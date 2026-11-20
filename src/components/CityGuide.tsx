import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bookmark,
  BookmarkCheck,
  Compass,
  Loader2,
  RotateCcw,
  Route as RouteIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { TripPlanner } from "@/components/TripPlanner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAiStream } from "@/lib/use-ai-stream";

type Props = { state: string; city: string; places: string[]; onClose: () => void };

export function CityGuide({ state, city, places, onClose }: Props) {
  const ai = useAiStream("/api/city-info");
  const [tab, setTab] = useState("guide");
  const [saveState, setSaveState] = useState<"ask" | "saving" | "saved" | "dismissed">("ask");
  const [attempt, setAttempt] = useState(0);
  const { start } = ai;

  useEffect(() => {
    setSaveState("ask");
    start({ state, city });
  }, [state, city, attempt, start]);

  async function save() {
    setSaveState("saving");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Please sign in again.");
      setSaveState("ask");
      return;
    }
    const { error } = await supabase.from("saved_places").insert({
      user_id: u.user.id,
      kind: "city",
      state_name: state,
      city_name: city,
      ai_info: ai.text.slice(0, 20000),
    });
    if (error) {
      toast.error("Couldn't save this place. Please try again.");
      setSaveState("ask");
      return;
    }
    setSaveState("saved");
    toast.success(`${city} saved to My places`);
  }

  return (
    <div className="postcard flex flex-col overflow-hidden animate-page-enter">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-neon-cyan uppercase">
            AI MILI · Travel desk
          </p>
          <h2 className="neon-text text-2xl font-semibold">{city}</h2>
          <p className="text-sm text-muted-foreground">{state}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close city guide" onClick={onClose}>
          <X />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-col">
        <div className="px-5 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">
              <Compass className="size-4" /> City guide
            </TabsTrigger>
            <TabsTrigger value="trip">
              <RouteIcon className="size-4" /> Plan my trip
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="guide" className="mt-0">
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            {ai.status === "loading" && (
              <div className="flex items-center gap-3 py-6 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-neon-cyan" />
                AI MILI is exploring {city} for you…
              </div>
            )}
            {ai.text && (
              <div className="prose-guide text-[15px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{ai.text}</ReactMarkdown>
              </div>
            )}
            {ai.status === "streaming" && (
              <span className="inline-block h-4 w-2 animate-pulse bg-neon-cyan align-middle" />
            )}
            {ai.status === "error" && (
              <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                <p className="font-medium text-destructive">{ai.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setAttempt((a) => a + 1)}
                >
                  <RotateCcw /> Try again
                </Button>
              </div>
            )}
          </div>

          {ai.status === "done" && (
            <div className="animate-map-pop space-y-3 border-t px-5 py-4">
              {saveState !== "dismissed" &&
                (saveState === "saved" ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <BookmarkCheck className="size-4 text-neon-cyan" /> Saved to My places
                    </span>
                    <Link to="/saved" className="font-semibold text-neon-pink hover:underline">
                      View my places →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      Do you want to save {city} to your places?
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSaveState("dismissed")}>
                        No thanks
                      </Button>
                      <Button
                        variant="saffron"
                        size="sm"
                        onClick={save}
                        disabled={saveState === "saving"}
                      >
                        <Bookmark /> {saveState === "saving" ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                ))}
              <Button variant="hero" className="w-full" onClick={() => setTab("trip")}>
                <RouteIcon /> Plan my trip to {city}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trip" className="mt-0 max-h-[70vh] overflow-y-auto px-5 py-4">
          <TripPlanner state={state} city={city} places={places} cityInfo={ai.text} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
