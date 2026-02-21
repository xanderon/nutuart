"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const rotatingHints = [
  "Pot sa te ajut?",
  "Vrei idei rapide?",
  "Cauti un cadou?",
  "Vrei ceva personalizat?",
  "Trimiti o poza cu locul?",
  "Spune-mi dimensiunea si bugetul.",
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
  "Cadou - ajuta-ma sa aleg",
  "Cum decurge o comanda?",
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

  const hideHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollHintAtRef = useRef(0);
  const hintCountRef = useRef(0);
  const mountedAtRef = useRef<number>(0);
  const hasOpenedRef = useRef(false);

  const starters = useMemo(() => universalStarters, []);

  const showHint = (duration = 3400) => {
    if (hasOpenedRef.current) return;
    if (hintCountRef.current >= 5) return;

    hintCountRef.current += 1;
    setHintText(pickRandom(rotatingHints));
    setHintVisible(true);

    if (hideHintTimerRef.current) clearTimeout(hideHintTimerRef.current);
    hideHintTimerRef.current = setTimeout(() => setHintVisible(false), duration);
  };

  useEffect(() => {
    setMounted(true);
    mountedAtRef.current = Date.now();

    const typingTimer = setTimeout(() => setBootTyping(true), 1900);
    const firstMessageTimer = setTimeout(() => {
      setBootTyping(false);
      setMessages([{ role: "assistant", content: contextualOpeners[context] }]);
    }, 2800);
    const firstHintTimer = setTimeout(() => showHint(3400), 4200);

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
      if (hasOpenedRef.current || hintCountRef.current >= 5) return;
      setWaveNow(true);
      showHint(3000);

      setTimeout(() => {
        setWaveNow(false);
      }, 1000);
    }, 20000);

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
    if (open) return;

    const onScroll = () => {
      if (hasOpenedRef.current || hintCountRef.current >= 5) return;
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
        body: JSON.stringify({ page: pathname, messages: nextMessages }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Asistentul nu a putut raspunde acum.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la asistent.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
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
                  <div>
                    <p className="text-[14px] font-semibold text-[#1f2f31]">
                      Salut! Sunt Marcelino.
                    </p>
                    <p className="text-[12px] text-[#4f6365]">
                      Iti raspund rapid despre modele, comenzi si personalizare.
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

            <div className="max-h-[50vh] space-y-4 overflow-y-auto px-4 py-4">
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
