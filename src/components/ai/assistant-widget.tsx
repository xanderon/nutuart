"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const rotatingHints = [
  "Te pot ajuta?",
  "Ai gasit ceva interesant?",
  "Cautai un model anume?",
  "Vrei ceva personalizat?",
  "Iti explic diferenta sablare vs vitraliu?",
] as const;

const contextualOpeners = {
  gallery:
    "Iti place ceva de aici? Putem adapta sau crea un model special pentru tine.",
  artist:
    "Vrei o piesa unica pentru spatiul tau? Iti pot explica optiunile.",
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
    "Ce recomandati pentru spatii mici?",
  ],
  contact: [
    "Ce detalii sa trimit pentru proiect?",
    "Care este urmatorul pas?",
    "Pot trimite dimensiuni si poze?",
  ],
} as const;

function getContextFromPath(pathname: string) {
  if (pathname.includes("/contact")) return "contact" as const;
  if (pathname.includes("/artist")) return "artist" as const;
  return "gallery" as const;
}

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function withDots(text: string, step: number) {
  const dots = ".".repeat((step % 3) + 1);
  return `${text}${dots}`;
}

export function AssistantWidget() {
  const pathname = usePathname();
  const context = getContextFromPath(pathname);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintText, setHintText] = useState("");
  const [dotsStep, setDotsStep] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootTyping, setBootTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const starters = useMemo(() => contextualStarters[context], [context]);

  const showHint = (duration = 6000) => {
    setHintText(pickRandom(rotatingHints));
    setHintVisible(true);

    if (hideHintTimerRef.current) clearTimeout(hideHintTimerRef.current);
    hideHintTimerRef.current = setTimeout(() => setHintVisible(false), duration);
  };

  useEffect(() => {
    setMounted(true);
    const initialDelay = 1600;

    const typingStart = setTimeout(() => setBootTyping(true), initialDelay);
    const firstMessage = setTimeout(() => {
      setBootTyping(false);
      setMessages([{ role: "assistant", content: contextualOpeners[context] }]);
    }, initialDelay + 850);
    const firstHint = setTimeout(() => showHint(6000), 2100);

    return () => {
      clearTimeout(typingStart);
      clearTimeout(firstMessage);
      clearTimeout(firstHint);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hideHintTimerRef.current) clearTimeout(hideHintTimerRef.current);
    };
  }, [context]);

  useEffect(() => {
    if (open) return;

    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }, 10000);

    return () => clearInterval(pulseInterval);
  }, [open]);

  useEffect(() => {
    if (!hintVisible) return;
    const dotsInterval = setInterval(() => {
      setDotsStep((prev) => (prev + 1) % 3);
    }, 420);
    return () => clearInterval(dotsInterval);
  }, [hintVisible]);

  useEffect(() => {
    if (open) return;

    const onScroll = () => {
      showHint(3800);

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        showHint(3800);
      }, 12000);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
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
    <div className="fixed bottom-4 right-4 z-[140]">
      {open ? (
        <div className="w-[min(92vw,400px)] overflow-hidden rounded-[20px] border border-[#d8c8b0] bg-[linear-gradient(180deg,#fffdf8_0%,#f4ecde_100%)] shadow-[0_28px_75px_-38px_rgba(83,62,31,0.48)] backdrop-blur-md">
          <div className="border-b border-[#e6dbc8] bg-[linear-gradient(90deg,rgba(212,186,144,0.2),rgba(255,255,255,0.45))] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-base text-[#3f3120]">Asistent AI Atelier NUTU</p>
                <p className="text-xs text-[#7d6950]">Raspund rapid despre lucrari si colaborare.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#d5c7ae] px-2.5 py-1 text-[11px] text-[#6f614d] hover:bg-white/75"
              >
                Inchide
              </button>
            </div>
          </div>

          <div className="max-h-[50vh] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-[16px] px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.role === "assistant"
                    ? "bg-[#efe5d6] text-[#413322]"
                    : "ml-8 bg-[#b9925b] text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
            {(loading || bootTyping) ? (
              <p className="text-xs text-[#7f7058]">Asistentul scrie...</p>
            ) : null}
            {error ? <p className="text-xs text-[#8f4f3e]">{error}</p> : null}
          </div>

          <div className="border-t border-[#e6dbc8] px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void sendMessage(starter)}
                  className="rounded-full border border-[#d8cbb8] bg-[#fbf7f0] px-3 py-1.5 text-xs text-[#6f5f49] hover:border-[#b99a6e] hover:text-[#4e3f2b]"
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
                className="w-full rounded-full border border-[#d8cbb8] bg-[#fffdf9] px-4 py-2.5 text-sm text-[#3f3428] outline-none focus:border-[#b89a6f]"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#b88f59] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_25px_-15px_rgba(93,66,30,0.55)] hover:brightness-95 disabled:opacity-70"
              >
                Trimite
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-end gap-2">
          <div
            className={`max-w-[220px] rounded-full border border-[#decfb8] bg-[#fff8ea] px-3 py-1.5 text-xs text-[#6f5a3d] shadow-[0_16px_36px_-22px_rgba(105,76,40,0.5)] transition-all duration-400 ${
              hintVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {withDots(hintText || "Te pot ajuta", dotsStep)}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`relative h-16 w-16 rounded-full border border-[#cfb084] bg-[linear-gradient(180deg,#caa16b_0%,#b88f59_100%)] text-white shadow-[0_24px_48px_-28px_rgba(101,67,25,0.65)] transition duration-300 hover:scale-[1.05] ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            } ${pulse ? "scale-[1.02]" : "scale-100"}`}
            aria-label="Deschide asistentul AI"
          >
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.32),transparent_52%)]" />
            <span className="relative flex h-full flex-col items-center justify-center leading-none">
              <span className="text-lg">💬</span>
              <span className="mt-0.5 text-[10px] font-semibold tracking-[0.08em]">AI</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
