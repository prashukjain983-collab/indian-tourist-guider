import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fareTask, isValidTravelDate, normalizeFares, type FareOption } from "./live-fares";
import { getTinyFishRun, startTinyFishRun } from "./live-fares.server";

const startInput = z.object({
  mode: z.enum(["flight", "train", "bus"]),
  from: z.string().trim().min(2).max(150),
  to: z.string().trim().min(2).max(150),
  date: z.string().refine((d) => isValidTravelDate(d), "Pick a date within the next 4 months."),
});

export const startFareCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => startInput.parse(data))
  .handler(async ({ data }) => {
    const task = fareTask(data.mode, data.from, data.to, data.date);
    const started = await startTinyFishRun(task);
    return { ...started, source: task.source };
  });

export type FareCheckState =
  | { status: "running" }
  | { status: "done"; options: FareOption[] }
  | { status: "failed"; error: string };

export const getFareCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ runId: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<FareCheckState> => {
    const run = await getTinyFishRun(data.runId);
    if ("error" in run && typeof run.error === "string") return { status: "failed", error: run.error };
    const r = run as { status: string; result?: unknown; error?: { message?: string } | null };
    if (r.status === "PENDING" || r.status === "RUNNING") return { status: "running" };
    if (r.status === "COMPLETED") {
      const options = normalizeFares(r.result);
      if (options.length === 0)
        return { status: "failed", error: "No fares were shown for this route and date." };
      return { status: "done", options };
    }
    return {
      status: "failed",
      error: r.error?.message ? `Fare check stopped: ${r.error.message}` : "The fare check didn't finish.",
    };
  });
