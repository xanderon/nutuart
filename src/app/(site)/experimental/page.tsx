"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const mockSources = [
  "/images/collections/decorations/vaza-alba-baza.png",
  "/images/collections/decorations/vaza-alba-baza-2.png",
  "/images/collections/decorations/vaza-alba-baza-3.png",
  "/images/collections/decorations/vaza-alba-baza-4.png",
  "/images/collections/decorations/vaza-alba-baza-5.png",
  "/images/collections/decorations/vaza-alba-baza-6.png",
  "/images/collections/decorations/vaza-alba-baza-7.png",
];

const feedCardClasses = [
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/5]",
];

export default function ExperimentalPage() {
  const [shieldVisible, setShieldVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [musicDockCollapsed, setMusicDockCollapsed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shieldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mockFeed = Array.from({ length: 20 }, (_, index) => ({
    id: `mock-${index + 1}`,
    src: mockSources[index % mockSources.length],
    alt: `Decor glass concept ${index + 1}`,
  }));

  const watermarkLabel = useMemo(
    () => `Nutu Art • Preview • ${new Date().toLocaleString("ro-RO")}`,
    []
  );

  const showShield = useCallback((duration = 1200) => {
    setShieldVisible(true);
    if (shieldTimeoutRef.current) {
      clearTimeout(shieldTimeoutRef.current);
    }
    shieldTimeoutRef.current = setTimeout(() => {
      setShieldVisible(false);
    }, duration);
  }, []);

  useEffect(() => {
    const screenshotKeys = new Set(["3", "4", "5"]);

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const macScreenshot =
        event.metaKey && event.shiftKey && screenshotKeys.has(key);
      const macClipboardScreenshot =
        event.metaKey && event.ctrlKey && event.shiftKey && screenshotKeys.has(key);
      const snippingShortcut =
        event.shiftKey && (event.metaKey || event.ctrlKey) && key === "s";

      if (event.key === "PrintScreen" || macScreenshot || macClipboardScreenshot || snippingShortcut) {
        showShield(1400);
        event.preventDefault();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        showShield(1100);
      }
    };

    const onBlur = () => {
      showShield(900);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (shieldTimeoutRef.current) {
        clearTimeout(shieldTimeoutRef.current);
      }
    };
  }, [showShield]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = 0.18;
    audio.muted = false;

    const tryAutoplay = async () => {
      try {
        await audio.play();
      } catch {
        // Some browsers require user interaction before autoplay.
      }
    };

    void tryAutoplay();
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMusicDockCollapsed(true);
    }, 4200);

    const onScroll = () => {
      setMusicDockCollapsed(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="bg-[#fcfcfd] text-[#111827] select-none [-webkit-touch-callout:none]"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
    >
      <audio
        ref={audioRef}
        src="/music/hitslab-mystery-mysterious-mystical-music-460375.mp3"
        loop
        preload="auto"
        playsInline
      />

      {shieldVisible ? (
        <div className="pointer-events-none fixed inset-0 z-[120] bg-black" />
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-black/5 bg-white px-5 py-7 shadow-[0_30px_80px_-60px_rgba(14,24,39,0.35)] sm:px-8">
          <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[#64748b]">
            Experimental Feed
          </p>
          <h1 className="mt-3 max-w-2xl text-2xl leading-tight text-[#0f172a] sm:text-4xl">
            Glass Art by Artist Nutu Marcel Marius
          </h1>
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          <figure className="group">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-2xl transition duration-300"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)",
              }}
            >
                <Image
                  src="/images/portret-mai-patratos.png"
                  alt="Artist Nutu Marcel Marius"
                  fill
                  className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 50vw"
                  draggable={false}
                  priority
                />
                <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/70 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-black/60">
                  {watermarkLabel}
                </span>
              </div>
            </figure>

          {mockFeed.map((item, index) => (
            <figure key={item.id} className="group">
              <div
                className={`relative overflow-hidden rounded-2xl transition duration-300 ${feedCardClasses[index % feedCardClasses.length]}`}
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)",
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-contain object-center p-1 transition duration-500 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 50vw"
                  draggable={false}
                  priority={index < 3}
                />
                <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/70 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-black/60">
                  {watermarkLabel}
                </span>
              </div>
            </figure>
          ))}
        </section>

        <section className="relative mt-12 overflow-hidden rounded-[2rem] bg-transparent">
          <div className="relative aspect-[16/7] sm:aspect-[16/6]">
            <Image
              src="/images/collections/decorations/vaza-alba-baza.png"
              alt="Compozitie decorativa din sticla pe fundal alb"
              fill
              className="object-contain object-center"
              sizes="(min-width: 1024px) 75vw, 100vw"
              draggable={false}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#fcfcfd_0%,transparent_7%,transparent_93%,#fcfcfd_100%),linear-gradient(to_bottom,#fcfcfd_0%,transparent_4%,transparent_96%,#fcfcfd_100%)]" />
        </section>

        <section className="mt-10 border-t border-black/6 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-[#0f172a] transition hover:bg-black hover:text-white"
            >
              Inapoi la galerie
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-black/10 px-5 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-[#0f172a] transition hover:border-black"
            >
              Contact
            </Link>
          </div>
        </section>
      </div>

      <div
        className={`group fixed bottom-4 right-0 z-[130] transition-transform duration-500 ${
          musicDockCollapsed
            ? "translate-x-[4.15rem] hover:translate-x-0 focus-within:translate-x-0"
            : "translate-x-0"
        }`}
      >
        <div className="rounded-l-full border border-black/10 border-r-0 bg-white/88 p-1.5 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              if (musicDockCollapsed) {
                setMusicDockCollapsed(false);
                return;
              }
              toggleMute();
            }}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-black/10 bg-white px-2.5 text-[#0f172a] transition hover:border-black"
            aria-label={isMuted ? "Unmute music" : "Mute music"}
            title={isMuted ? "Unmute music" : "Mute music"}
          >
            <span className="flex h-4 items-end gap-[2px]" aria-hidden="true">
              <span
                className={`w-[2px] rounded-full bg-[#0f172a] ${
                  isMuted ? "h-1.5 opacity-40" : "h-2.5 wave-1"
                }`}
              />
              <span
                className={`w-[2px] rounded-full bg-[#0f172a] ${
                  isMuted ? "h-2 opacity-40" : "h-3.5 wave-2"
                }`}
              />
              <span
                className={`w-[2px] rounded-full bg-[#0f172a] ${
                  isMuted ? "h-2.5 opacity-40" : "h-4 wave-3"
                }`}
              />
            </span>
            <span
              className={`overflow-hidden text-[0.58rem] uppercase tracking-[0.16em] transition-all duration-300 ${
                musicDockCollapsed
                  ? "max-w-0 opacity-0 sm:group-hover:max-w-16 sm:group-hover:opacity-100"
                  : "max-w-16 opacity-100"
              }`}
            >
              {isMuted ? "Mute" : "Sound"}
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .wave-1 {
          animation: wave 0.95s ease-in-out infinite;
        }
        .wave-2 {
          animation: wave 1.15s ease-in-out infinite;
        }
        .wave-3 {
          animation: wave 0.85s ease-in-out infinite;
        }
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(0.45);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
