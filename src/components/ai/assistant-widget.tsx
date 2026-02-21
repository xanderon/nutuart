"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
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

const rotatingHints = [
  "Pot sa te ajut?",
  "Vrei idei rapide?",
  "Cauti un cadou?",
  "Vrei ceva personalizat?",
  "Trimiti o poza cu locul?",
  "Spune-mi dimensiunea aproximativa.",
  "Iti recomand un model potrivit spatiului.",
  "Sunt asistentul AI al site-ului.",
] as const;

const contextualOpeners = {
  gallery:
    "Iti place ceva de aici? Spune-mi ce model si ce dimensiune ai in minte.",
  artist: "Vrei o piesa personalizata? Pot sa-ti recomand 2-3 variante.",
  contact: "Spune-mi pe scurt: dimensiune, buget si unde vrei sa o pui.",
} as const;

const universalStarters = [
  "Vreau ceva personalizat",
  "Caut un cadou",
  "Cum decurge o comanda?",
  "Cat dureaza realizarea?",
  "Pot trimite o poza?",
] as const;

const headerNudges = [
  "Cu ce te pot ajuta azi?",
  "Vrei ceva personalizat?",
  "Cauti un cadou?",
  "Pot sa-ti recomand o varianta potrivita?",
  "Vrei sa-ti explic rapid cum decurge comanda?",
] as const;

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getContextFromPath(pathname: string) {
  if (pathname.includes("/contact")) return "contact" as const;
  if (pathname.includes("/artist")) return "artist" as const;
  return "gallery" as const;
}

function withDots(text: string, step: number) {
  return `${text}${".".repeat((step % 3) + 1)}`;
}

export function AssistantWidget() {
  const pathname = usePathname();
  const context = getContextFromPath(pathname);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintText, setHintText] = useState("");
  const [dotsStep, setDotsStep] = useState(0);
  const [waveNow, setWaveNow] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootTyping, setBootTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [headerNudgeIndex, setHeaderNudgeIndex] = useState(0);
  const [leadReady, setLeadReady] = useState(false);
  const [leadDraft, setLeadDraft] = useState<LeadDraft | null>(null);
  const [leadSubmittedId, setLeadSubmittedId] = useState<string | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [contactValue, setContactValue] = useState("");
  const [leadError, setLeadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadUrl, setLastUploadUrl] = useState<string | null>(null);
  const messagesListRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sessionIdRef = useRef("anonymous");

  const hideHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollHintAtRef = useRef(0);
  const hintCountRef = useRef(0);
  const mountedAtRef = useRef<number>(0);
  const hasOpenedRef = useRef(false);

  const starters = useMemo(() => universalStarters, []);
  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages]
  );

  const showHint = (duration = 3000) => {
    if (hasOpenedRef.current) return;
    if (hintCountRef.current >= 3) return;

    hintCountRef.current += 1;
    setHintText(pickRandom(rotatingHints));
    setHintVisible(true);

    if (hideHintTimerRef.current) clearTimeout(hideHintTimerRef.current);
    hideHintTimerRef.current = setTimeout(() => setHintVisible(false), duration);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "marcelino_session_id";
    const existing = window.localStorage.getItem(key);
    if (existing) {
      sessionIdRef.current = existing;
      return;
    }
    const next = `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(key, next);
    sessionIdRef.current = next;
  }, []);

  useEffect(() => {
    setMounted(true);
    mountedAtRef.current = Date.now();

    const typingTimer = setTimeout(() => setBootTyping(true), 900);
    const firstMessageTimer = setTimeout(() => {
      setBootTyping(false);
      setMessages([{ role: "assistant", content: contextualOpeners[context] }]);
    }, 1700);
    const firstHintTimer = setTimeout(() => showHint(3000), 2800);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(firstMessageTimer);
      clearTimeout(firstHintTimer);
      if (hideHintTimerRef.current) clearTimeout(hideHintTimerRef.current);
    };
  }, [context]);

  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      if (hasOpenedRef.current || hintCountRef.current >= 3) return;
      setWaveNow(true);
      showHint(3000);

      setTimeout(() => {
        setWaveNow(false);
      }, 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (!hintVisible) return;

    const interval = setInterval(() => {
      setDotsStep((prev) => (prev + 1) % 3);
    }, 400);

    return () => clearInterval(interval);
  }, [hintVisible]);

  useEffect(() => {
    if (!open || hasUserMessage) return;

    const interval = setInterval(() => {
      setHeaderNudgeIndex((prev) => (prev + 1) % headerNudges.length);
    }, 5200);

    return () => clearInterval(interval);
  }, [open, hasUserMessage]);

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

    const onScroll = () => {
      if (hasOpenedRef.current || hintCountRef.current >= 3) return;
      if (Date.now() - mountedAtRef.current < 10000) return;
      const now = Date.now();
      if (now - lastScrollHintAtRef.current < 20000) {
        return;
      }
      lastScrollHintAtRef.current = now;
      showHint(2500);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          messages: nextMessages,
          sessionId: sessionIdRef.current,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        leadReady?: boolean;
        leadDraft?: LeadDraft;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Asistentul nu a putut raspunde acum.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "" }]);
      if (data.leadReady) {
        setLeadReady(true);
      }
      if (data.leadDraft) {
        setLeadDraft(data.leadDraft);
      }
    } catch (err) {
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
          messages,
          contactType,
          contactValue,
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
      setMessages((prev) => [...prev, { role: "assistant", content: confirmation }]);
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;

    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Poti incarca doar imagini.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("Imaginea depaseste 4MB. Alege o varianta mai mica.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionIdRef.current);

      const response = await fetch("/api/assistant/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error || "Nu am putut incarca imaginea.");
      }

      setLastUploadUrl(data.url);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Am primit poza. Daca vrei, iti pot trimite mai departe rezumatul discutiei ca sa nu repeti detaliile.",
        },
      ]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Eroare la upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[140]">
        {open ? (
          <div className="w-[min(92vw,400px)] overflow-hidden rounded-[20px] border border-[#d9e5e6] bg-white shadow-[0_28px_75px_-38px_rgba(12,34,35,0.35)]">
            <div className="border-b border-[#e8eff0] bg-[#f4f7f7] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0">
                    <div className="ai-breathe">
                      <div className={waveNow ? "ai-wave" : ""}>
                        <Image
                          src="/images/AIGlass.png"
                          alt="Asistent AI"
                          width={64}
                          height={90}
                          className="h-auto w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.2)]"
                          priority={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="inline-flex rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[#1f2f31] shadow-[0_8px_18px_-14px_rgba(10,30,31,0.35)]">
                      Salut! Sunt Marcelino.
                    </p>
                    <p className="text-[12px] text-[#4f6365]">
                      {hasUserMessage
                        ? "Iti raspund rapid despre modele, comenzi si personalizare."
                        : headerNudges[headerNudgeIndex]}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[#dce7e8] px-2 py-1 text-[10px] text-[#5f6a6b] hover:bg-[#f4f7f7]"
                >
                  Inchide
                </button>
              </div>
            </div>

            <div ref={messagesListRef} className="max-h-[50vh] space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === "assistant"
                      ? "bg-[#f4f7f7] text-[#223638]"
                      : "ml-8 bg-[#2f6f73] text-white"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {(loading || bootTyping) ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4f4] px-3 py-1.5 text-xs text-[#627274]">
                  <span>Marcelino scrie</span>
                  <span className="typing-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              ) : null}

              {!leadSubmittedId && leadReady ? (
                <div className="space-y-3 rounded-2xl border border-[#d7e4e5] bg-[#f6fbfb] p-3">
                  <p className="text-xs text-[#36585b]">
                    Daca vrei, pot trimite mai departe detaliile discutate pana acum, ca sa nu mai
                    fie nevoie sa le explici din nou.
                  </p>

                  {leadDraft ? (
                    <p className="text-[11px] text-[#557073]">
                      Rezumat: {leadDraft.summary}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setContactType("email")}
                      className={`rounded-full px-3 py-1 text-xs ${
                        contactType === "email"
                          ? "bg-[#2f6f73] text-white"
                          : "border border-[#cfe0e2] bg-white text-[#456466]"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType("phone")}
                      className={`rounded-full px-3 py-1 text-xs ${
                        contactType === "phone"
                          ? "bg-[#2f6f73] text-white"
                          : "border border-[#cfe0e2] bg-white text-[#456466]"
                      }`}
                    >
                      Telefon
                    </button>
                  </div>

                  <input
                    value={contactValue}
                    onChange={(event) => setContactValue(event.target.value)}
                    placeholder={contactType === "email" ? "email@exemplu.com" : "+40..."}
                    className="w-full rounded-full border border-[#d7e4e5] bg-white px-4 py-2 text-sm text-[#1f3335] outline-none focus:border-[#2f6f73]"
                  />

                  <button
                    type="button"
                    onClick={() => void submitLeadForward()}
                    disabled={leadSubmitting}
                    className="rounded-full bg-[#2f6f73] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3c8a90] disabled:opacity-70"
                  >
                    {leadSubmitting ? "Se trimite..." : "Trimite cererea catre artist"}
                  </button>

                  {leadError ? <p className="text-xs text-[#a64a4a]">{leadError}</p> : null}
                  <p className="text-[11px] text-[#5a6f71]">
                    Sau, daca preferi direct: marcelnutu@yahoo.com / +40 721 383 668
                  </p>
                </div>
              ) : null}

              {error ? <p className="text-xs text-[#a64a4a]">{error}</p> : null}
            </div>

            <div className="border-t border-[#e8eff0] px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void sendMessage(starter)}
                    className="rounded-full border border-[#d7e4e5] bg-[#f9fbfb] px-3 py-1.5 text-xs text-[#406466] hover:border-[#2f6f73] hover:text-[#2f6f73]"
                  >
                    {starter}
                  </button>
                ))}
              </div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-full border border-[#d7e4e5] bg-[#f9fbfb] px-3 py-1.5 text-xs text-[#406466] hover:border-[#2f6f73] hover:text-[#2f6f73] disabled:opacity-70"
                >
                  {uploading ? "Se incarca..." : "Incarca poza (max 4MB)"}
                </button>
                {lastUploadUrl ? (
                  <a
                    href={lastUploadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#2f6f73] underline underline-offset-2"
                  >
                    Vezi ultima poza
                  </a>
                ) : null}
              </div>
              {uploadError ? <p className="mb-2 text-xs text-[#a64a4a]">{uploadError}</p> : null}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="w-full rounded-full border border-[#d7e4e5] bg-white px-4 py-2.5 text-sm text-[#1f3335] outline-none focus:border-[#2f6f73]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[#2f6f73] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3c8a90] disabled:opacity-70"
                >
                  Trimite
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-end gap-2">
            <div
              className={`max-w-[220px] rounded-2xl bg-white px-3 py-2 text-xs text-[#314f52] shadow-[0_14px_30px_-20px_rgba(13,38,39,0.4)] transition-all duration-300 ${
                hintVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {withDots(hintText || "Pot sa te ajut", dotsStep)}
            </div>

            <button
              type="button"
              onClick={() => {
                hasOpenedRef.current = true;
                setHintVisible(false);
                setOpen(true);
              }}
              className={`relative w-[85px] transition duration-200 hover:scale-110 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              aria-label="Deschide asistentul AI"
            >
              <div className="ai-breathe">
                <div className={waveNow ? "ai-wave" : ""}>
                  <Image
                    src="/images/AIGlass.png"
                    alt="Asistent AI"
                    width={85}
                    height={120}
                    className="h-auto w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.2)]"
                    priority={false}
                  />
                </div>
              </div>
              <span className="mt-1 block text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f6f73]">
                Marcelino AI
              </span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .ai-breathe {
          animation: ai-breathe 3s ease-in-out infinite;
          transform-origin: 50% 75%;
        }

        .ai-wave {
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
          background: #5b6f71;
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
