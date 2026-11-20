import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Bookmark,
  BookmarkCheck,
  Bus,
  Car,
  ExternalLink,
  Loader2,
  MapPin,
  Plane,
  RotateCcw,
  Shuffle,
  TrainFront,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type TransportMode, intercityLinks, localRideLinks } from "@/lib/booking-links";
import { useAiStream } from "@/lib/use-ai-stream";
import { cn } from "@/lib/utils";

const MODES: { id: TransportMode; label: string; icon: React.ReactNode }[] = [
  { id: "flight", label: "Flight", icon: <Plane /> },
  { id: "train", label: "Train", icon: <TrainFront /> },
  { id: "bus", label: "Bus", icon: <Bus /> },
  { id: "car", label: "Car", icon: <Car /> },
  { id: "any", label: "Suggest best", icon: <Shuffle /> },
];

const BUDGETS = [5000, 15000, 30000, 60000];

type Props = {
  state: string;
  city: string;
  /** Places in this state used as drop-off ideas for local rides */
  places: string[];
  cityInfo: string;
};

export function TripPlanner({ state, city, places, cityInfo }: Props) {
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState("");
  const [budget, setBudget] = useState<number>(15000);
  const [travellers, setTravellers] = useState(2);
  const [days, setDays] = useState(3);
  const [mode, setMode] = useState<TransportMode | null>(null);
  const [saved, setSaved] = useState<"no" | "saving" | "yes" | "dismissed">("no");
  const ai = useAiStream("/api/trip-plan");

  const pickups = useMemo(
    () => [`${city} Airport`, `${city} Railway Station`, `${city} Bus Stand`],
    [city],
  );
  const [pickup, setPickup] = useState(pickups[0]!);
  const [dropoff, setDropoff] = useState(places[0] ?? city);

  const steps = ["Where from?", "Budget", "Transport"];

  function next() {
    if (step === 0 && from.trim().length < 2) {
      toast.error("Tell AI MILI where you're starting from.");
      return;
    }
    if (step === 1 && (!budget || budget < 500)) {
      toast.error("Please enter a budget of at least ₹500.");
      return;
    }
    setStep((s) => s + 1);
  }

  function plan(m: TransportMode) {
    setMode(m);
    setSaved("no");
    setStep(3);
    ai.start({ state, city, from: from.trim(), budget, travellers, days, mode: m });
  }

  async function save() {
    if (!mode) return;
    setSaved("saving");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Please sign in again.");
      setSaved("no");
      return;
    }
    const { error } = await supabase.from("saved_places").insert({
      user_id: u.user.id,
      kind: "trip",
      state_name: state,
      city_name: city,
      ai_info: (cityInfo || ai.text).slice(0, 20000),
      trip_plan: ai.text.slice(0, 30000),
      from_location: from.trim(),
      budget: `₹${budget.toLocaleString("en-IN")} · ${travellers} traveller(s) · ${days} day(s)`,
      transport_mode: mode,
    });
    if (error) {
      toast.error("Couldn't save this trip. Please try again.");
      setSaved("no");
      return;
    }
    setSaved("yes");
    toast.success(`Trip to ${city} saved`);
  }

  if (step < 3) {
    return (
      <div className="space-y-5">
        <ol className="flex items-center gap-2">
          {steps.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all",
                  i < step && "border-neon-cyan bg-neon-cyan text-primary-foreground",
                  i === step && "border-neon-pink text-neon-pink shadow-lift",
                  i > step && "border-border text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  i === step ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
            </li>
          ))}
        </ol>

        <div key={step} className="animate-map-pop space-y-4">
          {step === 0 && (
            <>
              <p className="font-display text-lg">Where will you start your journey?</p>
              <div className="space-y-1.5">
                <Label htmlFor="trip-from">Your city or location</Label>
                <div className="relative">
                  <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neon-cyan" />
                  <Input
                    id="trip-from"
                    autoFocus
                    value={from}
                    maxLength={150}
                    onChange={(e) => setFrom(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    placeholder="e.g. Mumbai, Bandra West"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="trip-people">Travellers</Label>
                  <Input
                    id="trip-people"
                    type="number"
                    min={1}
                    max={20}
                    value={travellers}
                    onChange={(e) =>
                      setTravellers(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trip-days">Days</Label>
                  <Input
                    id="trip-days"
                    type="number"
                    min={1}
                    max={30}
                    value={days}
                    onChange={(e) =>
                      setDays(Math.min(30, Math.max(1, Number(e.target.value) || 1)))
                    }
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="font-display text-lg">What's your total budget?</p>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(b)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                      budget === b
                        ? "border-neon-pink text-neon-pink shadow-lift"
                        : "hover:border-neon-cyan hover:text-neon-cyan",
                    )}
                  >
                    ₹{b.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trip-budget">Or type an amount (₹, whole group)</Label>
                <div className="relative">
                  <Wallet className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neon-cyan" />
                  <Input
                    id="trip-budget"
                    type="number"
                    min={500}
                    step={500}
                    value={budget}
                    onChange={(e) =>
                      setBudget(Math.max(0, Math.floor(Number(e.target.value) || 0)))
                    }
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    className="pl-9"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="font-display text-lg">How would you like to travel?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => plan(m.id)}
                    className="group flex flex-col items-center gap-2 rounded-xl border bg-background/40 p-4 text-sm font-medium transition-all hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan [&_svg]:size-6"
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft /> Back
          </Button>
          {step < 2 && (
            <Button variant="hero" size="sm" onClick={next}>
              Next <ArrowRight />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const links = mode ? intercityLinks(from, city, mode) : [];
  const rides = localRideLinks(pickup, `${dropoff}, ${city}`);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border px-2.5 py-1">From {from}</span>
        <span className="rounded-full border px-2.5 py-1">₹{budget.toLocaleString("en-IN")}</span>
        <span className="rounded-full border px-2.5 py-1">
          {travellers} traveller(s) · {days} day(s)
        </span>
        <span className="rounded-full border border-neon-cyan px-2.5 py-1 text-neon-cyan capitalize">
          {mode === "any" ? "Best mode" : mode}
        </span>
        <button
          type="button"
          onClick={() => {
            ai.stop();
            setStep(0);
          }}
          className="ml-auto font-medium text-neon-pink hover:underline"
        >
          Change details
        </button>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Book your tickets
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((l) => (
            <LinkCard key={l.label} {...l} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Bike className="size-4 text-neon-pink" /> Local rides in {city}
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ride-from" className="text-xs">
              From
            </Label>
            <select
              id="ride-from"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {pickups.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ride-to" className="text-xs">
              To
            </Label>
            <select
              id="ride-to"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {[city, ...places.filter((p) => p !== city)].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rides.map((r) => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              title={r.note}
              className="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:border-neon-pink hover:text-neon-pink hover:shadow-lift"
            >
              {r.label} <ExternalLink className="size-3.5" />
            </a>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Rapido and Ola open their booking page; enter the same pick-up and drop-off in their app.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Your route plan by AI MILI
        </h3>
        {ai.status === "loading" && (
          <div className="flex items-center gap-3 py-4 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-neon-cyan" /> Planning the full route from{" "}
            {from} to {city}…
          </div>
        )}
        {ai.text && (
          <div className="prose-guide text-[15px] [&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:py-1.5 [&_th]:border-b [&_th]:py-1.5 [&_th]:text-left">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{ai.text}</ReactMarkdown>
          </div>
        )}
        {ai.status === "streaming" && (
          <span className="inline-block h-4 w-2 animate-pulse bg-neon-cyan align-middle" />
        )}
        {ai.status === "error" && (
          <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="font-medium text-destructive">{ai.error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => mode && plan(mode)}>
              <RotateCcw /> Try again
            </Button>
          </div>
        )}
      </section>

      {ai.status === "done" && saved !== "dismissed" && (
        <div className="animate-map-pop rounded-xl border border-neon-cyan/40 bg-accent/40 p-4">
          {saved === "yes" ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <BookmarkCheck className="size-4 text-neon-cyan" /> Trip saved
              </span>
              <Link to="/saved" className="font-semibold text-neon-pink hover:underline">
                View my places →
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">Do you want to save this trip plan?</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSaved("dismissed")}>
                  No thanks
                </Button>
                <Button variant="saffron" size="sm" onClick={save} disabled={saved === "saving"}>
                  <Bookmark /> {saved === "saving" ? "Saving…" : "Save trip"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LinkCard({ label, href, note }: { label: string; href: string; note: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 rounded-xl border bg-background/40 px-4 py-3 transition-all hover:border-neon-cyan hover:shadow-neon-cyan"
    >
      <span>
        <span className="block text-sm font-semibold group-hover:text-neon-cyan">{label}</span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
      <ExternalLink className="size-4 text-muted-foreground group-hover:text-neon-cyan" />
    </a>
  );
}
