import { z } from "zod";

import { jsonError, streamPlainAnswer, verifyUser } from "./gateway.server";

const bodySchema = z.object({
  state: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(150),
});

export async function handleCityInfo(request: Request): Promise<Response> {
  const auth = await verifyUser(request);
  if (!auth) return jsonError(401, "Please sign in again.");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Please pick a valid city.");

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return jsonError(500, "AI MILI is not set up yet.");

  const { city, state } = parsed.data;
  const prompt = `Give a traveller's guide to ${city} in ${state}, India.
Use these Markdown sections with short bullet points:
## Overview (2-3 sentences)
## Top things to see
## Food to try
## Best time to visit
## How to get there
## Local tips
Keep it under 300 words.`;

  return streamPlainAnswer(request, apiKey, prompt);
}
