"use client";

import { useEffect, useState } from "react";

const VISIBILITY_OFFSET = 280;

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > VISIBILITY_OFFSET);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="Inapoi sus"
      title="Inapoi sus"
      onClick={handleClick}
      className={
        "fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(env(safe-area-inset-bottom)+5.6rem)] z-[130] flex h-10 w-10 origin-center items-center justify-center rounded-[999px] border border-[color:var(--color-outline)] bg-[color:var(--color-surface)]/58 text-[color:var(--color-foreground)] shadow-[0_22px_44px_-24px_rgba(0,0,0,0.22)] ring-1 ring-[color:var(--color-outline)] backdrop-blur-md transition-all duration-200 ease-out hover:scale-[1.19] hover:border-[color:var(--color-accent)]/55 hover:bg-[color:var(--color-elevated)]/76 hover:text-[color:var(--color-accent)] hover:shadow-[0_28px_58px_-24px_rgba(0,0,0,0.36)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/45 sm:right-[max(1.25rem,env(safe-area-inset-right))] sm:bottom-[calc(env(safe-area-inset-bottom)+6.1rem)] sm:h-11 sm:w-11 lg:right-[max(1.5rem,calc((100vw-72rem)/2+0.5rem))] " +
        (isVisible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2 scale-95 opacity-0")
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 14l6-6 6 6" />
      </svg>
    </button>
  );
}
