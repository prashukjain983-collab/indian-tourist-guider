import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import {
  MILI_INSTRUCTIONS,
  MODEL,
  REASONING_OPTIONS,
  createGateway,
  jsonError,
  verifyUser,
} from "./gateway.server";
import { withLovableAiGatewayRunIdHeader } from "./run-id.server";

const bodySchema = z.object({
  messages: z
    .array(
      z
        .object({
          id: z.string().min(1).max(200),
          role: z.enum(["user", "assistant", "system"]),
          parts: z.array(z.record(z.string(), z.unknown())).max(200),
        })
        .passthrough(),
    )
    .min(1)
    .max(200),
  context: z
    .object({
      state: z.string().max(100).optional(),
      city: z.string().max(150).optional(),
    })
    .optional(),
});

export async function handleChat(request: Request): Promise<Response> {
  const auth = await verifyUser(request);
  if (!auth) return jsonError(401, "Please sign in again.");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "That message couldn't be sent.");

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return jsonError(500, "AI MILI is not set up yet.");

  const messages = parsed.data.messages.filter((m) => m.role !== "system") as unknown as UIMessage[];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const ctx = parsed.data.context;
  const where = ctx?.city
    ? `The traveller is currently looking at ${ctx.city}, ${ctx.state ?? "India"}.`
    : ctx?.state
      ? `The traveller is currently looking at ${ctx.state}.`
      : "";

  const { provider, runIdFetch } = createGateway(request, apiKey);
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: `${MILI_INSTRUCTIONS}
Keep answers focused and skimmable (short headings and bullets, under 250 words unless asked for a full plan).
When suggesting bookings, mention IRCTC (trains), Google Flights / MakeMyTrip (flights), redBus (buses) and Rapido / Uber / Ola (local rides). ${where}`,
    messages: await convertToModelMessages(messages.slice(-30)),
    abortSignal: request.signal,
    maxRetries: 0,
    providerOptions: REASONING_OPTIONS,
  });

  const response = result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendReasoning: true,
    onError: (error) => {
      console.error("chat stream error", error);
      const status =
        error && typeof error === "object" && "statusCode" in error
          ? Number((error as { statusCode?: number }).statusCode)
          : 0;
      if (status === 402) return "AI MILI has run out of credits for now. Please try again later.";
      if (status === 429) return "AI MILI is busy right now. Please wait a moment and try again.";
      return "AI MILI couldn't answer just now. Please try again.";
    },
    onFinish: async ({ responseMessage, isAborted }) => {
      const rows = [];
      if (lastUser) {
        rows.push({ user_id: auth.userId, message_id: lastUser.id, role: "user", message: lastUser as never });
      }
      if (responseMessage.parts.length > 0) {
        rows.push({
          user_id: auth.userId,
          message_id: responseMessage.id,
          role: "assistant",
          message: { ...responseMessage, metadata: { aborted: isAborted } } as never,
        });
      }
      if (!rows.length) return;
      const { error } = await auth.supabase
        .from("chat_messages")
        .upsert(rows, { onConflict: "user_id,message_id", ignoreDuplicates: true });
      if (error) console.error("Could not save chat messages", error);
    },
  });

  return withLovableAiGatewayRunIdHeader(response, runIdFetch);
}
