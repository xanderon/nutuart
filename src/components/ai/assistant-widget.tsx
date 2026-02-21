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
  "Ai gasit ceva interesant?",
  "Vrei ceva personalizat?",
  "Iti explic diferenta dintre sablare si vitraliu?",
] as const;

const contextualOpeners = {
  gallery:
    "Iti place ceva de aici? Putem adapta sau crea un model special pentru tine.",
  artist: "Vrei o piesa unica pentru spatiul tau? Iti pot explica optiunile.",
  contact: "Ai un proiect in minte? Spune-mi cateva detalii si te ghidez.",
} as const;

const contextualStarters = {
  gallery: [
    "Diferenta sablare vs vitraliu",
    "Model pentru living luminos",
    "Vreau ceva personalizat",
  ],
  artist: [
    "Ce tip de lucrari realizeaza?",
    "Cum decurge o comanda personalizata?",
    "Ce se poate face pentru un spatiu mic?",
  ],
  contact: [
    "Ce detalii sunt utile pentru proiect?",
    "Cum iau legatura rapid cu artistul?",
    "Pot trimite poze si dimensiuni?",
  ],
} as const;

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

  const starters = useMemo(() => contextualStarters[context], [context]);

  const showHint = (duration = 3000) => {
    setHintText(pickRandom(rotatingHints));
    setHintVisible(true);

    if (hideHintTimerRef.current) clearTimeout(hideHintTimerRef.current);
    hideHintTimerRef.current = setTimeout(() => setHintVisible(false), duration);
  };

  useEffect(() => {
    setMounted(true);

    const typingTimer = setTimeout(() => setBootTyping(true), 1900);
    const firstMessageTimer = setTimeout(() => {
      setBootTyping(false);
      setMessages([{ role: "assistant", content: contextualOpeners[context] }]);
    }, 2800);
    const firstHintTimer = setTimeout(() => showHint(3200), 2300);

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
      setWaveNow(true);
      showHint(3000);

      setTimeout(() => {
        setWaveNow(false);
      }, 1000);
    }, 9000);

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
      showHint(2800);
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
                <div>
                  <p className="text-[15px] font-semibold text-[#111111]">Asistent</p>
                  <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#2f6f73]">
                    AI activ
                  </p>
                  <p className="mt-1 text-[12px] text-[#5f6a6b]">
                    Te pot ajuta cu informatii despre lucrari din sticla.
                  </p>
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
                <p className="text-xs text-[#627274]">Asistentul scrie...</p>
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
              onClick={() => setOpen(true)}
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
      `}</style>
    </>
  );
}
