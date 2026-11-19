import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { Bookmark, BookmarkCheck, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AI_ERROR_MARKER } from "@/lib/ai-stream";

type Status = "loading" | "streaming" | "done" | "error";

export function CityGuide({
  state,
  city,
  onClose,
}: {
  state: string;
  city: string;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<"ask" | "saving" | "saved" | "dismissed">("ask");
  const [attempt, setAttempt] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError("");
    setStatus("loading");
    setSaveState("ask");

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch("/api/city-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ state, city }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "The AI guide couldn't answer just now.");
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const idx = acc.indexOf(AI_ERROR_MARKER);
          if (idx >= 0) {
            setText(acc.slice(0, idx));
            throw new Error(acc.slice(idx + AI_ERROR_MARKER.length));
          }
          setText(acc);
          setStatus("streaming");
        }
        setStatus("done");
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [state, city, attempt]);

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
      state_name: state,
      city_name: city,
      ai_info: text.slice(0, 20000),
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
    <div className="postcard flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b bg-accent/40 px-5 py-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            AI MILI · City guide
          </p>
          <h2 className="text-2xl font-semibold">{city}</h2>
          <p className="text-sm text-muted-foreground">{state}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close city guide" onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
        {status === "loading" && (
          <div className="flex items-center gap-3 py-6 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            AI MILI is planning your trip to {city}…
          </div>
        )}
        {text && (
          <div className="prose-guide text-[15px]">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
        {status === "streaming" && (
          <span className="inline-block h-4 w-2 animate-pulse bg-primary align-middle" />
        )}
        {status === "error" && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">{error}</p>
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

      {status === "done" && saveState !== "dismissed" && (
        <div className="animate-map-pop border-t bg-secondary/60 px-5 py-4">
          {saveState === "saved" ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <BookmarkCheck className="size-4 text-primary" /> Saved to My places
              </span>
              <Link to="/saved" className="font-semibold text-primary hover:underline">
                View my places →
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">Do you want to save {city} to your places?</p>
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
          )}
        </div>
      )}
    </div>
  );
}
