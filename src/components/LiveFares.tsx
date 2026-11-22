import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bus, Loader2, Plane, Radar, RotateCcw, TrainFront } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TransportMode } from "@/lib/booking-links";
import type { FareMode, FareOption } from "@/lib/live-fares";
import { getFareCheck, startFareCheck } from "@/lib/live-fares.functions";
import { cn } from "@/lib/utils";

const FARE_MODES: { id: FareMode; label: string; icon: React.ReactNode }[] = [
  { id: "flight", label: "Flights", icon: <Plane /> },
  { id: "train", label: "Trains", icon: <TrainFront /> },
  { id: "bus", label: "Buses", icon: <Bus /> },
];

const POLL_MS = 5000;
const MAX_WAIT_MS = 4 * 60 * 1000;

function isoInDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type State =
  | { kind: "idle" }
  | { kind: "running"; source: string; startedAt: number }
  | { kind: "done"; source: string; options: FareOption[] }
  | { kind: "error"; message: string };

export function LiveFares({ from, to, mode }: { from: string; to: string; mode: TransportMode }) {
  const [fareMode, setFareMode] = useState<FareMode>(
    mode === "flight" || mode === "bus" ? mode : "train",
  );
  const [date, setDate] = useState(() => isoInDays(7));
  const [state, setState] = useState<State>({ kind: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const cancelled = useRef(false);
  const start = useServerFn(startFareCheck);
  const poll = useServerFn(getFareCheck);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  useEffect(() => {
    if (state.kind !== "running") return;
    const t = setInterval(() => setElapsed(Date.now() - state.startedAt), 1000);
    return () => clearInterval(t);
  }, [state]);

  async function check() {
    setElapsed(0);
    setState({ kind: "running", source: "", startedAt: Date.now() });
    try {
      const res = await start({ data: { mode: fareMode, from, to, date } });
      if (!("runId" in res) || !res.runId) {
        setState({ kind: "error", message: ("error" in res && res.error) || "Couldn't start." });
        return;
      }
      const startedAt = Date.now();
      setState({ kind: "running", source: res.source, startedAt });
      while (!cancelled.current) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (cancelled.current) return;
        const s = await poll({ data: { runId: res.runId } });
        if (s.status === "done") {
          setState({ kind: "done", source: res.source, options: s.options });
          return;
        }
        if (s.status === "failed") {
          setState({ kind: "error", message: s.error });
          return;
        }
        if (Date.now() - startedAt > MAX_WAIT_MS) {
          setState({ kind: "error", message: "This is taking too long. Please try again later." });
          return;
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      setState({
        kind: "error",
        message: message.includes("date") ? "Pick a date within the next 4 months." : "Couldn't check fares. Please try again.",
      });
    }
  }

  const running = state.kind === "running";

  return (
    <section className="rounded-xl border border-neon-cyan/40 bg-accent/20 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Radar className="size-4 text-neon-cyan" /> Live ticket prices
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        A web agent checks real booking sites for {from} → {to}. It takes about 1–3 minutes.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex gap-1.5" role="group" aria-label="Ticket type">
          {FARE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              disabled={running}
              aria-pressed={fareMode === m.id}
              onClick={() => setFareMode(m.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 [&_svg]:size-4",
                fareMode === m.id
                  ? "border-neon-cyan text-neon-cyan shadow-neon-cyan"
                  : "hover:border-neon-cyan hover:text-neon-cyan",
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <Label htmlFor="fare-date" className="text-xs">
            Travel date
          </Label>
          <Input
            id="fare-date"
            type="date"
            value={date}
            min={isoInDays(0)}
            max={isoInDays(120)}
            disabled={running}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-40"
          />
        </div>
        <Button variant="hero" size="sm" onClick={check} disabled={running || !date}>
          {running ? <Loader2 className="animate-spin" /> : <Radar />}
          {running ? "Checking…" : "Check live fares"}
        </Button>
      </div>

      {running && (
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-neon-cyan" />
          {state.source ? `Searching ${state.source}…` : "Starting the search…"}{" "}
          {Math.floor(elapsed / 1000)}s
        </div>
      )}

      {state.kind === "error" && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="font-medium text-destructive">{state.message}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={check}>
            <RotateCcw /> Try again
          </Button>
        </div>
      )}

      {state.kind === "done" && (
        <div className="mt-4 animate-map-pop">
          <ul className="divide-y divide-border rounded-lg border bg-background/40">
            {state.options.map((o, i) => (
              <li key={`${o.operator}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{o.operator}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[o.departure && o.arrival ? `${o.departure} → ${o.arrival}` : o.departure, o.duration, o.details]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-display text-base font-bold",
                    i === 0 ? "text-neon-cyan" : "text-foreground",
                  )}
                >
                  ₹{o.price_inr.toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Prices from {state.source}, per person, checked just now. They can change — confirm on the
            booking site.
          </p>
        </div>
      )}
    </section>
  );
}
