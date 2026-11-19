import { z } from "zod";

import { jsonError, streamPlainAnswer, verifyUser } from "./gateway.server";

export const tripSchema = z.object({
  state: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(150),
  from: z.string().trim().min(2).max(150),
  budget: z.number().int().min(500).max(10_000_000),
  travellers: z.number().int().min(1).max(20),
  days: z.number().int().min(1).max(30),
  mode: z.enum(["flight", "train", "bus", "car", "any"]),
});

const MODE_LABEL: Record<z.infer<typeof tripSchema>["mode"], string> = {
  flight: "flight",
  train: "train",
  bus: "bus",
  car: "car / self-drive",
  any: "whichever mode fits the budget best",
};

export async function handleTripPlan(request: Request): Promise<Response> {
  const auth = await verifyUser(request);
  if (!auth) return jsonError(401, "Please sign in again.");

  const parsed = tripSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "Please check your trip details.");

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return jsonError(500, "AI MILI is not set up yet.");

  const t = parsed.data;
  const prompt = `Plan a complete trip for ${t.travellers} traveller(s) from ${t.from} to ${t.city}, ${t.state}, India.
Total budget: ₹${t.budget.toLocaleString("en-IN")} for the whole group. Trip length: ${t.days} day(s). Preferred transport: ${MODE_LABEL[t.mode]}.

Use exactly these Markdown sections:
## Your route at a glance
A numbered, step-by-step route from ${t.from} to the hotel area in ${t.city} (e.g. home → airport/station → arrival → hotel), with approximate travel time for each step.
## Getting there by ${t.mode === "any" ? "the best mode" : MODE_LABEL[t.mode]}
Typical options, nearest airport / railway station / bus stand, approximate cost per person, and what to search for when booking.
## Getting around ${t.city}
How to get from the arrival point (airport / station) to the main sights — e.g. Rapido bike/auto, Uber, Ola, metro, local bus — with rough fares for key hops like "Airport → top attraction".
## Day-by-day plan
One short bullet list per day.
## Budget breakdown
A Markdown table: Item | Estimated cost (₹). Include travel, stay, food, local transport, entry fees, buffer; show the total and whether it fits the budget.
## Money-saving tips
3-5 bullets.
Keep it under 550 words.`;

  return streamPlainAnswer(request, apiKey, prompt);
}
