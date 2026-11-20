import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { AI_ERROR_MARKER } from "@/lib/ai-stream";

export type AiStatus = "idle" | "loading" | "streaming" | "done" | "error";

/** Streams a plain-text AI answer from one of the app's /api routes. */
export function useAiStream(url: string) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<AiStatus>("idle");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const start = useCallback(
    async (body: unknown) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setText("");
      setError("");
      setStatus("loading");
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "AI MILI couldn't answer just now.");
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
        if (controller.signal.aborted) {
          setStatus((s) => (s === "streaming" ? "done" : "idle"));
          return;
        }
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setStatus("error");
      }
    },
    [url],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  return { text, status, error, start, stop };
}
