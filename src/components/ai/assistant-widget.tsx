"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Attachment = {
  name: string;
  url: string;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  attachments?: Attachment[];
};

type LeadDraft = {
  projectType: string;
  dimensions: string;
  style: string;
  location: string;
  summary: string;
};

type ComposerImage = {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
};

const assistantAvatar = "/images/AIGlass.webp";
const maxComposerImages = 3;

const rotatingHints = [
  "Arata-mi o referinta.",
  "Spune-mi pe scurt ce cauti.",
  "Pot sa-ti recomand o directie.",
  "Trimite o poza daca ai una.",
  "Te ajut cu idei rapide.",
] as const;

const contextualOpeners = {
  gallery:
    "Salut, sunt Marcelino. Daca ai vazut o lucrare care iti place, spune-mi modelul sau trimite-mi o referinta si iti spun ce directie s-ar potrivi.",
  artist:
    "Salut, sunt Marcelino. Daca vrei o piesa personalizata, imi poti spune spatiul, stilul sau poti trimite direct o imagine de referinta.",
  contact:
    "Salut, sunt Marcelino. Spune-mi ce proiect ai in minte sau trimite-mi o imagine, iar eu te ajut sa formulezi rapid cererea.",
} as const;

const suggestionMap = {
  gallery: [
    "Vreau ceva personalizat",
    "Am o poza de referinta",
    "Cum decurge comanda?",
    "Ce s-ar potrivi pentru living?",
  ],
  artist: [
    "Vreau sa discut o lucrare",
    "Ce stil mi se potriveste?",
    "Am nevoie de un cadou",
    "Cat de personalizat se poate?",
  ],
  contact: [
    "Vreau sa las o cerere",
    "Am nevoie de recomandare",
    "Cum trimit detaliile?",
    "Prefer sa fiu contactat",
  ],
} as const;

const headerNudges = [
  "Raspund despre vitralii, sablare, decor si comenzi personalizate.",
  "Poti scrie simplu sau poti trimite o imagine de referinta.",
  "Te ajut sa formulezi rapid ideea si pasul urmator.",
] as const;

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function createId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
  const [contactValues, setContactValues] = useState<{ email: string; phone: string }>({
    email: "",
    phone: "",
  });
  const [leadError, setLeadError] = useState<string | null>(null);
  const [composerImages, setComposerImages] = useState<ComposerImage[]>([]);
  const messagesListRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sessionIdRef = useRef("anonymous");
  const composerImagesRef = useRef<ComposerImage[]>([]);
  const initialContextRef = useRef(context);

  const hideHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollHintAtRef = useRef(0);
  const hintCountRef = useRef(0);
  const mountedAtRef = useRef<number>(0);
  const hasOpenedRef = useRef(false);

  const starters = useMemo(() => suggestionMap[context], [context]);
  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages]
  );
  const canSend = input.trim().length > 0 || composerImages.length > 0;

  const syncTextareaHeight = () => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 140)}px`;
  };

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
    const next = createId();
    window.localStorage.setItem(key, next);
    sessionIdRef.current = next;
  }, []);

  useEffect(() => {
    setMounted(true);
    mountedAtRef.current = Date.now();

    const typingTimer = setTimeout(() => setBootTyping(true), 450);
    const firstMessageTimer = setTimeout(() => {
      setBootTyping(false);
      setMessages([
        {
          id: createId(),
          role: "assistant",
          content: contextualOpeners[initialContextRef.current],
        },
      ]);
    }, 850);
    const firstHintTimer = setTimeout(() => showHint(2800), 1800);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(firstMessageTimer);
      clearTimeout(firstHintTimer);
      if (hideHintTimerRef.current) clearTimeout(hideHintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      if (hasOpenedRef.current || hintCountRef.current >= 3) return;
      setWaveNow(true);
      showHint(2800);

      setTimeout(() => {
        setWaveNow(false);
      }, 900);
    }, 28000);

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
      if (Date.now() - mountedAtRef.current < 8000) return;
      const now = Date.now();
      if (now - lastScrollHintAtRef.current < 18000) return;
      lastScrollHintAtRef.current = now;
      showHint(2400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    syncTextareaHeight();
  }, [input]);

  useEffect(() => {
    composerImagesRef.current = composerImages;
  }, [composerImages]);

  useEffect(() => {
    return () => {
      composerImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const clearComposerImages = () => {
    setComposerImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
  };

  const updateAssistantMessage = (id: string, updater: (current: string) => string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, content: updater(message.content) } : message
      )
    );
  };

  const uploadComposerImages = async () => {
    const uploaded: Attachment[] = [];

    for (const image of composerImages) {
      if (image.uploadedUrl) {
        uploaded.push({ name: image.file.name, url: image.uploadedUrl });
        continue;
      }

      const formData = new FormData();
      formData.append("file", image.file);
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

      uploaded.push({ name: image.file.name, url: data.url });
    }

    return uploaded;
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
          attachments: message.attachments?.map((attachment) => attachment.url) ?? [],
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
        const line = eventBlock
          .split("\n")
          .find((entry) => entry.startsWith("data: "));

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
    if (!trimmed && composerImages.length === 0) return;

    setError(null);
    setLeadError(null);
    setLoading(true);

    let assistantId: string | null = null;

    try {
      const uploadedAttachments = await uploadComposerImages();
      const userMessage: Message = {
        id: createId(),
        role: "user",
        content:
          trimmed || (uploadedAttachments.length ? "Analizeaza, te rog, imaginile atasate." : ""),
        attachments: uploadedAttachments.length ? uploadedAttachments : undefined,
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
      clearComposerImages();

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

  const handleImageSelection = (files: FileList | null) => {
    if (!files?.length) return;

    const availableSlots = Math.max(0, maxComposerImages - composerImages.length);
    const nextFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, availableSlots);

    if (!nextFiles.length) return;

    setComposerImages((prev) => [
      ...prev,
      ...nextFiles.map((file) => ({
        id: createId(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeComposerImage = (id: string) => {
    setComposerImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
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
          <div className="ml-auto w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[rgba(214,198,176,0.55)] bg-[linear-gradient(180deg,#fffdf9_0%,#fff8ef_100%)] shadow-[0_32px_90px_-42px_rgba(32,20,8,0.42)]">
            <div className="border-b border-[rgba(131,94,58,0.12)] bg-[linear-gradient(180deg,rgba(255,252,247,0.95)_0%,rgba(248,240,230,0.95)_100%)] px-4 pb-3 pt-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[rgba(131,94,58,0.15)] bg-white shadow-[0_10px_30px_-20px_rgba(38,26,16,0.4)]">
                    <div className="ai-breathe">
                      <div className={`relative h-full w-full ${waveNow ? "ai-wave" : ""}`}>
                        <Image
                          src={assistantAvatar}
                          alt="Marcelino"
                          fill
                          sizes="48px"
                          className="object-cover"
                          priority={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#241912]">Marcelino</p>
                    <p className="text-[12px] text-[#6d5544]">
                      {hasUserMessage
                        ? "Asistent pentru recomandari, comenzi si referinte vizuale."
                        : headerNudges[headerNudgeIndex]}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[rgba(131,94,58,0.14)] bg-white/85 px-3 py-1.5 text-[11px] font-medium text-[#6d5544] transition hover:bg-white"
                >
                  Inchide
                </button>
              </div>
            </div>

            <div
              ref={messagesListRef}
              className="max-h-[54vh] min-h-[320px] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[58vh] sm:px-5"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[88%] space-y-2 rounded-[22px] px-4 py-3 text-[14px] leading-6 shadow-[0_12px_30px_-24px_rgba(34,25,18,0.35)] ${
                      message.role === "assistant"
                        ? "bg-white text-[#2f241d]"
                        : "bg-[#2d5b67] text-white"
                    }`}
                  >
                    {message.attachments?.length ? (
                      <div className="grid grid-cols-2 gap-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.url}
                            className="relative h-24 w-full overflow-hidden rounded-2xl border border-white/15"
                          >
                            <Image
                              src={attachment.url}
                              alt={attachment.name}
                              fill
                              sizes="(max-width: 640px) 120px, 160px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {message.content ? <p>{message.content}</p> : null}
                  </div>
                </div>
              ))}

              {(loading || bootTyping) && !messages.at(-1)?.content ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f0e7da] px-3 py-1.5 text-xs text-[#705847]">
                  <span>{composerImages.length ? "Marcelino analizeaza" : "Marcelino scrie"}</span>
                  <span className="typing-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              ) : null}

              {!leadSubmittedId && leadReady ? (
                <div className="space-y-3 rounded-[22px] border border-[rgba(131,94,58,0.14)] bg-[rgba(255,255,255,0.86)] p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#2f241d]">Vrei sa lasi cererea acum?</p>
                    <p className="text-xs leading-5 text-[#6d5544]">
                      Daca vrei, trimit mai departe contextul discutat pana acum, impreuna cu
                      datele tale de contact.
                    </p>
                    {leadDraft?.summary ? (
                      <p className="text-[11px] text-[#8a6f5b]">Rezumat: {leadDraft.summary}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setContactType("email")}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        contactType === "email"
                          ? "bg-[#2d5b67] text-white"
                          : "border border-[rgba(131,94,58,0.14)] bg-white text-[#6d5544]"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType("phone")}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        contactType === "phone"
                          ? "bg-[#2d5b67] text-white"
                          : "border border-[rgba(131,94,58,0.14)] bg-white text-[#6d5544]"
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
                    className="w-full rounded-full border border-[rgba(131,94,58,0.16)] bg-white px-4 py-2.5 text-sm text-[#2f241d] outline-none transition focus:border-[#2d5b67]"
                  />

                  <button
                    type="button"
                    onClick={() => void submitLeadForward()}
                    disabled={leadSubmitting}
                    className="rounded-full bg-[#2d5b67] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#234853] disabled:opacity-70"
                  >
                    {leadSubmitting ? "Se trimite..." : "Trimite cererea"}
                  </button>

                  {leadError ? <p className="text-xs text-[#a64a4a]">{leadError}</p> : null}
                  <p className="text-[11px] text-[#7a6352]">
                    Sau direct: marcelnutu@yahoo.com / +40 721 383 668
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-[#e4c7c7] bg-[#fff4f4] px-3 py-2 text-xs text-[#9c3d3d]">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="border-t border-[rgba(131,94,58,0.12)] bg-[rgba(255,252,248,0.88)] px-4 py-4 sm:px-5">
              {!hasUserMessage ? (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {starters.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => void sendMessage(starter)}
                      className="shrink-0 rounded-full border border-[rgba(131,94,58,0.14)] bg-white px-3 py-1.5 text-xs text-[#5d4a3c] transition hover:border-[#2d5b67] hover:text-[#2d5b67]"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              ) : null}

              {composerImages.length ? (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {composerImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[rgba(131,94,58,0.14)] bg-white"
                    >
                      <Image
                        src={image.previewUrl}
                        alt={image.file.name}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeComposerImage(image.id)}
                        className="absolute right-1 top-1 rounded-full bg-[rgba(36,25,18,0.72)] px-1.5 py-0.5 text-[10px] text-white"
                        aria-label={`Sterge ${image.file.name}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="rounded-[24px] border border-[rgba(131,94,58,0.16)] bg-white p-2 shadow-[0_18px_35px_-30px_rgba(34,25,18,0.3)]">
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
                    placeholder="Scrie un mesaj sau descrie imaginea..."
                    className="max-h-[140px] min-h-[44px] w-full resize-none bg-transparent px-3 py-2 text-[15px] text-[#2f241d] outline-none placeholder:text-[#9b8778]"
                  />

                  <div className="flex items-center justify-between gap-3 border-t border-[rgba(131,94,58,0.08)] px-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full border border-[rgba(131,94,58,0.14)] px-3 py-1.5 text-xs font-medium text-[#6d5544] transition hover:border-[#2d5b67] hover:text-[#2d5b67]"
                      >
                        Adauga imagine
                      </button>
                      <span className="text-[11px] text-[#8a6f5b]">maxim 3 imagini</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !canSend}
                      className="rounded-full bg-[#2d5b67] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234853] disabled:opacity-60"
                    >
                      {loading ? "Se genereaza..." : "Trimite"}
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleImageSelection(event.target.files);
                    event.target.value = "";
                  }}
                />

                <p className="text-[11px] leading-5 text-[#7a6352]">
                  Poti scrie liber, poti cere o recomandare rapida sau poti trimite o referinta
                  vizuala pentru un raspuns mai precis.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative ml-auto flex w-full max-w-[280px] flex-col items-end gap-2">
            <div
              className={`max-w-[240px] rounded-2xl border border-[rgba(131,94,58,0.1)] bg-white px-3 py-2 text-xs text-[#4b3b2f] shadow-[0_16px_34px_-24px_rgba(35,22,11,0.38)] transition-all duration-300 ${
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
              className={`group flex items-center gap-3 rounded-full border border-[rgba(131,94,58,0.12)] bg-white/95 px-3 py-2 shadow-[0_24px_50px_-30px_rgba(35,22,11,0.42)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-30px_rgba(35,22,11,0.5)] ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              aria-label="Deschide asistentul AI"
            >
              <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[rgba(131,94,58,0.12)] bg-[#fff7ed]">
                <div className="ai-breathe">
                  <div className={`relative h-full w-full ${waveNow ? "ai-wave" : ""}`}>
                    <Image
                      src={assistantAvatar}
                      alt="Marcelino"
                      fill
                      sizes="44px"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                </div>
              </div>

              <div className="text-left">
                <span className="block text-sm font-semibold text-[#2f241d]">Marcelino</span>
                <span className="block text-[11px] text-[#7a6352]">Intreaba sau trimite o poza</span>
              </div>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
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
          background: #7f6654;
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
