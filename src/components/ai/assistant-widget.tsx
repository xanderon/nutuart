"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type LeadDraft = {
  projectType: string;
  dimensions: string;
  style: string;
  location: string;
  summary: string;
};

const assistantAvatar = "/images/AIGlass.webp";

const contextualOpeners = {
  gallery:
    "Salut, sunt Marcelino. Daca ai vazut o lucrare care iti place, spune-mi pe scurt ce cauti si te ajut cu o directie.",
  artist:
    "Salut, sunt Marcelino. Daca vrei o piesa personalizata, spune-mi unde vrei sa o folosesti sau ce stil cauti.",
  contact:
    "Salut, sunt Marcelino. Spune-mi pe scurt ce proiect ai in minte si te ajut sa formulezi cererea.",
} as const;

function createId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getContextFromPath(pathname: string) {
  if (pathname.includes("/contact")) return "contact" as const;
  if (pathname.includes("/artist")) return "artist" as const;
  return "gallery" as const;
}

export function AssistantWidget() {
  const pathname = usePathname();
  const context = getContextFromPath(pathname);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootTyping, setBootTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [leadReady, setLeadReady] = useState(false);
  const [leadDraft, setLeadDraft] = useState<LeadDraft | null>(null);
  const [leadSubmittedId, setLeadSubmittedId] = useState<string | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [contactValues, setContactValues] = useState<{ email: string; phone: string }>({
    email: "",
    phone: "",
  });
  const [leadError, setLeadError] = useState<string | null>(null);
  const [waveNow, setWaveNow] = useState(false);

  const messagesListRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sessionIdRef = useRef("anonymous");
  const initialContextRef = useRef(context);

  const syncTextareaHeight = () => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "marcelino_session_id";
    const existing = window.localStorage.getItem(key);
    if (existing) {
      sessionIdRef.current = existing;
      return;
    }
    const next = createId();
    window.localStorage.setItem(key, next);
    sessionIdRef.current = next;
  }, []);

  useEffect(() => {
    setMounted(true);

    const typingTimer = setTimeout(() => setBootTyping(true), 350);
    const firstMessageTimer = setTimeout(() => {
      setBootTyping(false);
      setMessages([
        {
          id: createId(),
          role: "assistant",
          content: contextualOpeners[initialContextRef.current],
        },
      ]);
    }, 700);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(firstMessageTimer);
    };
  }, []);

  useEffect(() => {
    syncTextareaHeight();
  }, [input]);

  useEffect(() => {
    if (!open) return;
    const container = messagesListRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, bootTyping, leadReady, leadSubmittedId, open]);

  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      setWaveNow(true);
      setTimeout(() => setWaveNow(false), 900);
    }, 18000);

    return () => clearInterval(interval);
  }, [open]);

  const updateAssistantMessage = (id: string, updater: (current: string) => string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, content: updater(message.content) } : message
      )
    );
  };

  const streamAssistantReply = async (conversation: Message[], assistantId: string) => {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pathname,
        messages: conversation.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        sessionId: sessionIdRef.current,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "Asistentul nu a putut raspunde acum.");
    }

    if (!response.body) {
      throw new Error("Fluxul de raspuns nu este disponibil.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const eventBlock of events) {
        const line = eventBlock.split("\n").find((entry) => entry.startsWith("data: "));
        if (!line) continue;

        const payload = line.slice(6).trim();
        if (!payload) continue;

        const data = JSON.parse(payload) as
          | { type: "delta"; content: string }
          | { type: "replace"; content: string }
          | { type: "meta"; leadReady?: boolean; leadDraft?: LeadDraft | null }
          | { type: "done" }
          | { type: "error"; error: string };

        if (data.type === "delta") {
          updateAssistantMessage(assistantId, (current) => `${current}${data.content}`);
        }

        if (data.type === "replace") {
          updateAssistantMessage(assistantId, () => data.content);
        }

        if (data.type === "meta") {
          setLeadReady(Boolean(data.leadReady));
          setLeadDraft(data.leadDraft ?? null);
        }

        if (data.type === "error") {
          throw new Error(data.error || "Asistentul a intrerupt raspunsul.");
        }
      }

      if (done) break;
    }
  };

  const sendMessage = async (text: string) => {
    if (loading) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setLeadError(null);
    setLoading(true);

    let assistantId: string | null = null;

    try {
      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
      };
      assistantId = createId();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      const nextMessages = [...messages, userMessage, assistantMessage];

      setMessages(nextMessages);
      setInput("");

      await streamAssistantReply(nextMessages, assistantId);
    } catch (err) {
      if (assistantId) {
        setMessages((prev) => prev.filter((message) => message.id !== assistantId));
      }
      setError(err instanceof Error ? err.message : "Eroare la asistent.");
    } finally {
      setLoading(false);
    }
  };

  const submitLeadForward = async () => {
    if (leadSubmitting) return;
    setLeadError(null);
    setLeadSubmitting(true);

    try {
      const response = await fetch("/api/assistant/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          contactType,
          contactValue: contactValues[contactType],
          sessionId: sessionIdRef.current,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        requestId?: string;
        confirmation?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.requestId) {
        throw new Error(data.error || "Nu am putut trimite cererea.");
      }

      const confirmation =
        data.confirmation ||
        `Multumesc! Am trimis cererea. Numarul solicitarii tale este: ${data.requestId}.`;

      setLeadSubmittedId(data.requestId);
      setLeadReady(false);
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "assistant", content: confirmation },
      ]);
    } catch (err) {
      setLeadError(err instanceof Error ? err.message : "Eroare la trimitere.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      <div
        className="fixed z-[140]"
        style={{
          left: "max(0.75rem, env(safe-area-inset-left))",
          right: "max(0.75rem, env(safe-area-inset-right))",
          bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        {open ? (
          <div className="marcelino-panel ml-auto w-full max-w-[420px] overflow-hidden rounded-[26px]">
            <div className="marcelino-header flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-[var(--color-foreground)]">
                  Marcelino
                </div>
                <div className="text-[12px] text-[var(--color-muted)]">
                  Asistent pentru comenzi si recomandari.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="marcelino-button-secondary rounded-full px-3 py-1.5 text-[11px] font-medium"
              >
                Inchide
              </button>
            </div>

            <div
              ref={messagesListRef}
              className="max-h-[52vh] min-h-[300px] space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-[20px] px-4 py-3 text-[14px] leading-6 ${
                      message.role === "assistant"
                        ? "marcelino-bubble-assistant"
                        : "marcelino-bubble-user"
                    }`}
                  >
                    <div className="text-current">{message.content}</div>
                  </div>
                </div>
              ))}

              {(loading || bootTyping) && !messages.at(-1)?.content ? (
                <div className="marcelino-typing inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
                  <span>Marcelino scrie</span>
                  <span className="typing-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              ) : null}

              {!leadSubmittedId && leadReady ? (
                <div className="marcelino-card space-y-3 rounded-[20px] p-4">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">
                      Vrei sa trimitem cererea?
                    </div>
                    <div className="text-xs leading-5 text-[var(--color-muted)]">
                      Daca vrei, trimit mai departe contextul discutat pana acum.
                    </div>
                    {leadDraft?.summary ? (
                      <div className="text-[11px] text-[var(--color-muted)]">
                        Rezumat: {leadDraft.summary}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setContactType("email")}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        contactType === "email"
                          ? "marcelino-button-primary"
                          : "marcelino-button-secondary"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType("phone")}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        contactType === "phone"
                          ? "marcelino-button-primary"
                          : "marcelino-button-secondary"
                      }`}
                    >
                      Telefon
                    </button>
                  </div>

                  <input
                    value={contactValues[contactType]}
                    onChange={(event) =>
                      setContactValues((prev) => ({
                        ...prev,
                        [contactType]: event.target.value,
                      }))
                    }
                    placeholder={contactType === "email" ? "email@exemplu.com" : "+40..."}
                    className="marcelino-input w-full rounded-full px-4 py-2.5 text-sm outline-none transition"
                  />

                  <button
                    type="button"
                    onClick={() => void submitLeadForward()}
                    disabled={leadSubmitting}
                    className="marcelino-button-primary rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-70"
                  >
                    {leadSubmitting ? "Se trimite..." : "Trimite cererea"}
                  </button>

                  {leadError ? (
                    <div className="text-xs text-[#ff8a8a]">{leadError}</div>
                  ) : null}
                  <div className="text-[11px] text-[var(--color-muted)]">
                    Sau direct: marcelnutu@yahoo.com / +40 721 383 668
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="marcelino-error rounded-2xl px-3 py-2 text-xs">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="marcelino-footer px-4 py-4 sm:px-5">
              <form onSubmit={handleSubmit}>
                <div className="marcelino-composer rounded-[22px] p-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage(input);
                      }
                    }}
                    rows={1}
                    placeholder="Scrie un mesaj..."
                    className="marcelino-textarea max-h-[120px] min-h-[44px] w-full resize-none bg-transparent px-3 py-2 text-[15px] outline-none"
                  />

                  <div className="marcelino-composer-actions flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="marcelino-button-primary rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
                    >
                      {loading ? "Se genereaza..." : "Trimite"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`relative ml-auto block h-[88px] w-[62px] transition duration-200 hover:scale-[1.04] ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            aria-label="Deschide asistentul AI"
          >
            <div className="ai-breathe">
              <div className={`relative h-full w-full ${waveNow ? "ai-wave" : ""}`}>
                <Image
                  src={assistantAvatar}
                  alt="Marcelino"
                  fill
                  sizes="62px"
                  className="object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.28)]"
                  priority={false}
                />
              </div>
            </div>
          </button>
        )}
      </div>

      <style jsx>{`
        .marcelino-panel {
          border: 1px solid var(--color-outline);
          background:
            linear-gradient(
              180deg,
              color-mix(in srgb, var(--color-surface) 96%, white 4%) 0%,
              color-mix(in srgb, var(--color-elevated) 92%, transparent) 100%
            );
          box-shadow: 0 28px 70px -38px rgba(0, 0, 0, 0.55);
        }

        .marcelino-header,
        .marcelino-footer {
          border-color: var(--color-outline);
          background: color-mix(in srgb, var(--color-surface) 86%, transparent);
        }

        .marcelino-header {
          border-bottom-width: 1px;
          border-bottom-style: solid;
        }

        .marcelino-footer {
          border-top-width: 1px;
          border-top-style: solid;
        }

        .marcelino-bubble-assistant {
          background: color-mix(in srgb, var(--color-elevated) 94%, white 6%);
          color: var(--color-foreground);
          box-shadow: 0 12px 30px -24px rgba(0, 0, 0, 0.45);
        }

        .marcelino-bubble-user {
          background: var(--color-accent);
          color: var(--color-background);
        }

        .marcelino-typing {
          background: color-mix(in srgb, var(--color-elevated) 92%, transparent);
          color: var(--color-muted);
        }

        .marcelino-card {
          border: 1px solid var(--color-outline);
          background: color-mix(in srgb, var(--color-surface) 92%, transparent);
        }

        .marcelino-input,
        .marcelino-composer {
          border: 1px solid var(--color-outline);
          background: color-mix(in srgb, var(--color-surface) 96%, transparent);
          color: var(--color-foreground);
        }

        .marcelino-input::placeholder,
        .marcelino-textarea::placeholder {
          color: color-mix(in srgb, var(--color-muted) 78%, transparent);
        }

        .marcelino-input:focus,
        .marcelino-textarea:focus {
          outline: none;
        }

        .marcelino-input:focus-visible,
        .marcelino-composer:focus-within {
          border-color: color-mix(in srgb, var(--color-accent) 72%, white 8%);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-accent) 42%, transparent);
        }

        .marcelino-composer {
          box-shadow: 0 18px 35px -30px rgba(0, 0, 0, 0.45);
        }

        .marcelino-composer-actions {
          border-top: 1px solid color-mix(in srgb, var(--color-outline) 85%, transparent);
        }

        .marcelino-textarea {
          color: var(--color-foreground);
        }

        .marcelino-button-primary {
          background: var(--color-accent);
          color: var(--color-background);
        }

        .marcelino-button-primary:hover {
          background: color-mix(in srgb, var(--color-accent-strong) 82%, var(--color-accent));
        }

        .marcelino-button-secondary {
          border: 1px solid var(--color-outline);
          background: color-mix(in srgb, var(--color-surface) 94%, transparent);
          color: var(--color-foreground);
        }

        .marcelino-button-secondary:hover {
          background: color-mix(in srgb, var(--color-elevated) 96%, transparent);
        }

        .marcelino-error {
          border: 1px solid rgba(255, 138, 138, 0.25);
          background: rgba(127, 20, 20, 0.16);
          color: #ffb3b3;
        }

        .ai-breathe {
          display: block;
          width: 100%;
          height: 100%;
          animation: ai-breathe 3s ease-in-out infinite;
          transform-origin: 50% 75%;
        }

        .ai-wave {
          display: block;
          width: 100%;
          height: 100%;
          animation: ai-wave 1s ease-in-out;
          transform-origin: 50% 75%;
        }

        .typing-dots {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }

        .typing-dots span {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: currentColor;
          opacity: 0.35;
          animation: typing-bounce 1s ease-in-out infinite;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes ai-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        @keyframes ai-wave {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(6deg);
          }
          50% {
            transform: rotate(-6deg);
          }
          75% {
            transform: rotate(4deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes typing-bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-2px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
