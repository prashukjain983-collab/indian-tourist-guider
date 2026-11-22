import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, MapPin, Route as RouteIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { STATE_BY_NAME } from "@/data/states";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "My places — Indian Tourist Guider" },
      { name: "description", content: "Cities you saved with their AI travel guides." },
      { property: "og:title", content: "My places — Indian Tourist Guider" },
      { property: "og:description", content: "Your saved Indian cities and travel notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPage,
});

type Saved = {
  id: string;
  state_name: string;
  city_name: string;
  ai_info: string;
  created_at: string;
  kind: string;
  from_location: string | null;
  budget: string | null;
  transport_mode: string | null;
  trip_plan: string | null;
};

function SavedPage() {
  const [items, setItems] = useState<Saved[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("saved_places")
      .select("id, state_name, city_name, ai_info, created_at, kind, from_location, budget, transport_mode, trip_plan")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Couldn't load your places.");
        setItems(data ?? []);
      });
  }, []);

  async function remove(id: string) {
    const { error } = await supabase.from("saved_places").delete().eq("id", id);
    if (error) {
      toast.error("Couldn't remove this place.");
      return;
    }
    setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
    toast.success("Removed");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-semibold">My places</h1>
      <p className="mt-1 text-muted-foreground">Cities and trips you saved, with AI MILI's travel notes and routes.</p>

      {items === null ? (
        <div className="mt-10 flex justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-secondary border-t-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="postcard mt-8 p-10 text-center">
          <p className="font-display text-2xl">No saved places yet</p>
          <p className="mt-1 text-muted-foreground">
            Open a state on the map, pick a city and tap Save.
          </p>
          <Button asChild variant="hero" className="mt-5">
            <Link to="/explore">Open the map</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => {
            const slug = STATE_BY_NAME.get(item.state_name)?.slug;
            const isOpen = open === item.id;
            const isTrip = item.kind === "trip";
            return (
              <li key={item.id} className="postcard overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    {isTrip ? <RouteIcon className="size-5" /> : <MapPin className="size-5" />}
                  </span>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setOpen(isOpen ? null : item.id)}
                  >
                    <p className="truncate font-display text-lg font-semibold">
                      {isTrip && item.from_location
                        ? `${item.from_location} → ${item.city_name}`
                        : item.city_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isTrip ? "Trip" : "City"} · {item.state_name} · saved{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </button>
                  {slug && (
                    <Link
                      to="/state/$slug"
                      params={{ slug }}
                      className="hidden text-sm font-medium text-primary hover:underline sm:inline"
                    >
                      Open state
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Show notes for ${item.city_name}`}
                    onClick={() => setOpen(isOpen ? null : item.id)}
                  >
                    <ChevronDown
                      className={
                        isOpen ? "rotate-180 transition-transform" : "transition-transform"
                      }
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.city_name}`}
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                {isOpen && (
                  <div className="prose-guide animate-map-pop border-t px-5 py-4 text-[15px]">
                    {isTrip ? (
                      <>
                        <div className="not-prose mb-3 flex flex-wrap gap-2 text-xs">
                          {item.budget && (
                            <span className="rounded-full border px-2.5 py-1">{item.budget}</span>
                          )}
                          {item.transport_mode && (
                            <span className="rounded-full border border-neon-cyan px-2.5 py-1 text-neon-cyan capitalize">
                              {item.transport_mode === "any" ? "Best mode" : item.transport_mode}
                            </span>
                          )}
                        </div>
                        <div className="[&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:py-1.5 [&_th]:border-b [&_th]:py-1.5 [&_th]:text-left">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.trip_plan ?? ""}
                          </ReactMarkdown>
                        </div>
                      </>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.ai_info}</ReactMarkdown>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
