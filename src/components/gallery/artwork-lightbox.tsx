"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Artwork } from "@/data/artworks";

type ArtworkLightboxProps = {
  artwork: Artwork | null;
  onClose: () => void;
  isOpen: boolean;
};

export function ArtworkLightbox({ artwork, onClose, isOpen }: ArtworkLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && artwork ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[calc(var(--radius-lg)*1.2)] border border-white/10 bg-[color:var(--color-background)]/85 shadow-[0_42px_120px_-32px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <span className="sr-only">Închide</span>
              ×
            </button>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative aspect-[4/5]">
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 text-white">
                  <h2 className="font-display text-3xl">{artwork.title}</h2>
                  <p className="mt-2 text-sm uppercase tracking-[0.4em] text-white/70">
                    {artwork.year} • {artwork.medium}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-8 p-6 pr-7 text-sm text-muted">
                <div className="space-y-4">
                  <table className="w-full text-left text-xs uppercase tracking-[0.3em] text-muted">
                    <tbody>
                      <tr className="border-b border-white/10">
                        <th className="py-3 pr-4 font-medium text-white/70">
                          Dimensiuni
                        </th>
                        <td className="py-3">{artwork.dimensions}</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <th className="py-3 pr-4 font-medium text-white/70">
                          Colecție
                        </th>
                        <td className="py-3 capitalize">{artwork.collection}</td>
                      </tr>
                      <tr>
                        <th className="py-3 pr-4 font-medium text-white/70">
                          An
                        </th>
                        <td className="py-3">{artwork.year}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="leading-relaxed text-foreground/80">
                    {artwork.description}
                  </p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-5 text-xs uppercase tracking-[0.3em] text-white/70">
                  Contactează atelierul pentru disponibilitate și opțiuni de
                  personalizare.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
