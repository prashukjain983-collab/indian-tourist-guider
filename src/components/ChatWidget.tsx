import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useRouterState } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import miliAvatar from "@/assets/ai-mili-avatar.jpg";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { STATE_BY_SLUG } from "@/data/states";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Best 5-day Rajasthan route on ₹25,000?",
  "How do I get from Delhi airport to Red Fort?",
  "Train or flight from Mumbai to Goa?",
];

function usePageContext() {
  const location = useRouterState({ select: (s) => s.location });
  return useMemo(() => {
    const m = location.pathname.match(/^\/state\/([^/]+)/);
    const state = m?.[1] ? STATE_BY_SLUG.get(m[1])?.name : undefined;
    const search = location.search as { city?: unknown };
    const city = typeof search.city === "string" ? search.city : undefined;
    return { state, city };
  }, [location]);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const context = usePageContext();
  const contextRef = useRef(context);
  contextRef.current = context;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        body: () => ({ context: contextRef.current }),
      }),
    [],
  );

  const { messages, setMessages, sendMessage, status, stop, error } = useChat({
    transport,
    onError: (e) => toast.error(e.message || "AI MILI couldn't answer just now."),
  });

  // Load the saved conversation the first time the chat opens.
  useEffect(() => {
    if (!open || loaded) return;
    setLoaded(true);
    supabase
      .from("chat_messages")
      .select("message")
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data, error: err }) => {
        if (err) {
          toast.error("Couldn't load your earlier chat.");
          return;
        }
        if (data?.length) setMessages(data.map((r) => r.message as unknown as UIMessage));
      });
  }, [open, loaded, setMessages]);

  useEffect(() => {
    if (open && status !== "submitted" && status !== "streaming") textareaRef.current?.focus();
  }, [open, status]);

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    void sendMessage({ text: t.slice(0, 4000) });
    setInput("");
  }

  async function newChat() {
    stop();
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { error: err } = await supabase.from("chat_messages").delete().eq("user_id", u.user.id);
      if (err) {
        toast.error("Couldn't clear the chat.");
        return;
      }
    }
    setMessages([]);
    toast.success("Started a new chat");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI MILI chat" : "Ask AI MILI"}
        className={cn(
          "fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full border border-neon-pink bg-popover py-1.5 pr-4 pl-1.5 font-semibold text-foreground shadow-lift transition-all hover:-translate-y-0.5",
          open && "pr-1.5",
        )}
      >
        <img src={miliAvatar} alt="" width={40} height={40} className="size-10 rounded-full" />
        {!open && (
          <span className="hidden text-sm sm:inline">
            Ask <span className="text-neon-pink">AI MILI</span>
          </span>
        )}
        {open && <X className="mx-1.5 size-5" />}
      </button>

      {open && (
        <section
          aria-label="AI MILI chat"
          className="postcard animate-page-enter fixed bottom-20 left-5 z-50 flex h-[min(620px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden bg-popover"
        >
          <header className="flex items-center gap-3 border-b px-4 py-3">
            <img src={miliAvatar} alt="AI MILI" width={36} height={36} className="size-9 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="neon-text font-display text-base leading-tight">AI MILI</p>
              <p className="truncate text-xs text-muted-foreground">
                {context.city
                  ? `Helping with ${context.city}`
                  : context.state
                    ? `Helping with ${context.state}`
                    : "Your India travel guide"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={newChat} disabled={!messages.length}>
              <RotateCcw /> New chat
            </Button>
          </header>

          <Conversation className="flex-1">
            <ConversationContent className="gap-5 px-4">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<img src={miliAvatar} alt="" width={64} height={64} className="size-16 rounded-full" />}
                  title="Namaste! I'm AI MILI"
                  description="Ask me about routes, budgets, trains, flights, food or anything about travelling in India."
                >
                  <div className="mt-4 flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border px-3 py-1.5 text-left text-xs transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((m) => (
                  <Message key={m.id} from={m.role}>
                    <MessageContent
                      className={cn(
                        m.role === "user"
                          ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                          : "bg-transparent p-0 text-foreground",
                      )}
                    >
                      {m.parts.map((part, i) =>
                        part.type === "text" ? (
                          m.role === "assistant" ? (
                            <MessageResponse key={i} className="prose-guide text-sm">
                              {part.text}
                            </MessageResponse>
                          ) : (
                            <p key={i} className="whitespace-pre-wrap">
                              {part.text}
                            </p>
                          )
                        ) : null,
                      )}
                    </MessageContent>
                  </Message>
                ))
              )}
              {status === "submitted" && (
                <Shimmer className="text-sm">AI MILI is thinking…</Shimmer>
              )}
              {error && !busy && (
                <p className="text-sm text-destructive">
                  {error.message || "AI MILI couldn't answer just now."}
                </p>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t p-3">
            <PromptInput onSubmit={(msg) => send(msg.text ?? "")}>
              <PromptInputTextarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI MILI anything about your trip…"
                maxLength={4000}
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !input.trim()} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      )}
    </>
  );
}
