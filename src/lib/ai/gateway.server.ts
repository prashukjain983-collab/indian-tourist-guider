import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { streamText } from "ai";

import type { Database } from "@/integrations/supabase/types";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const MODEL = "openai/gpt-6-astra";
export const ERROR_MARKER = "\u0000ERROR:";

export const MILI_INSTRUCTIONS = `You are AI MILI, a friendly, knowledgeable and practical tourist guide for India.
You help travellers with routes, directions, attractions, food, culture, budgets and transport.
If a question is not about travel in India, reply: "Sorry, I can only answer India tourist-related questions."
If the user greets you, greet them back and briefly introduce yourself.
Reply in clear, well-structured Markdown. Prices and timings are estimates: say so and suggest checking the booking site.
Never invent exact train numbers, flight numbers or fares; describe typical options instead.`;

export function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

/** Verifies the bearer token and returns the user id plus a client that acts as that user. */
export async function verifyUser(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  if (token.split(".").length !== 3) return null;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { userId: data.claims.sub, supabase };
}

export function friendlyError(error: unknown): string {
  const status =
    error && typeof error === "object" && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;
  if (status === 402) return "AI MILI has run out of credits for now. Please try again later.";
  if (status === 429) return "AI MILI is busy right now. Please wait a moment and try again.";
  if (status === 403) return "AI MILI isn't available for this request.";
  return "AI MILI couldn't answer just now. Please try again.";
}

/** Creates a request-scoped gateway provider. */
export function createGateway(request: Request, apiKey: string) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { provider, runIdFetch };
}

export const REASONING_OPTIONS = {
  openai: {
    store: false,
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    include: ["reasoning.encrypted_content"],
  },
} as const;

/** Streams a one-shot answer as plain text; failures are sent as ERROR_MARKER + message. */
export function streamPlainAnswer(request: Request, apiKey: string, prompt: string) {
  const { provider, runIdFetch } = createGateway(request, apiKey);
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: MILI_INSTRUCTIONS,
    messages: [{ role: "user", content: prompt }],
    abortSignal: request.signal,
    maxRetries: 0,
    providerOptions: REASONING_OPTIONS,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wroteText = false;
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            if (part.text) {
              wroteText = true;
              controller.enqueue(encoder.encode(part.text));
            }
          } else if (part.type === "error") {
            console.error("AI stream error", part.error);
            controller.enqueue(encoder.encode(ERROR_MARKER + friendlyError(part.error)));
            controller.close();
            return;
          }
        }
        if (!wroteText) {
          controller.enqueue(encoder.encode(ERROR_MARKER + "AI MILI returned an empty answer."));
        }
        controller.close();
      } catch (error) {
        if (request.signal.aborted) {
          controller.close();
          return;
        }
        console.error("AI request failed", error);
        controller.enqueue(encoder.encode(ERROR_MARKER + friendlyError(error)));
        controller.close();
      }
    },
  });

  return withLovableAiGatewayRunIdHeader(
    new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    }),
    runIdFetch,
    undefined,
    { waitForUpstreamHeaders: false },
  );
}
