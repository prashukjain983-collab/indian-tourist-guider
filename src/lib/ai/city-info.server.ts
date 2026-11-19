import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { streamText } from "ai";
import { z } from "zod";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are AI MILI, a friendly and knowledgeable tourist guide for India.
You only answer India travel questions. Reply in clear, well-structured Markdown.
Be accurate; if you are unsure of a detail, say so briefly instead of inventing it.`;

const bodySchema = z.object({
  state: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(150),
});

export const ERROR_MARKER = "\u0000ERROR:";

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

async function verifyUser(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  if (token.split(".").length !== 3) return null;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
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
  return data.claims.sub;
}

function friendlyError(error: unknown): string {
  const status =
    error && typeof error === "object" && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;
  if (status === 402) return "The AI guide has run out of credits for now. Please try again later.";
  if (status === 429) return "The AI guide is busy right now. Please wait a moment and try again.";
  if (status === 403) return "The AI guide isn't available for this request.";
  return "The AI guide couldn't answer just now. Please try again.";
}

export async function handleCityInfo(request: Request): Promise<Response> {
  const userId = await verifyUser(request);
  if (!userId) return json(401, "Please sign in again.");

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return json(400, "Please pick a valid city.");
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, "The AI guide is not set up yet.");

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const prompt = `Give a traveller's guide to ${parsed.city} in ${parsed.state}, India.
Use these Markdown sections with short bullet points:
## Overview (2-3 sentences)
## Top things to see
## Food to try
## Best time to visit
## How to get there
## Local tips
Keep it under 300 words.`;

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: [{ role: "user", content: prompt }],
    abortSignal: request.signal,
    maxRetries: 0,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
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
            console.error("city-info stream error", part.error);
            controller.enqueue(encoder.encode(ERROR_MARKER + friendlyError(part.error)));
            controller.close();
            return;
          }
        }
        if (!wroteText) {
          controller.enqueue(
            encoder.encode(ERROR_MARKER + "The AI guide returned an empty answer."),
          );
        }
        controller.close();
      } catch (error) {
        if (request.signal.aborted) {
          controller.close();
          return;
        }
        console.error("city-info failed", error);
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
