"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";

type SilhouetteImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
};

export function SilhouetteImage({ src, alt, className }: SilhouetteImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  const fallback = useMemo(
    () => (
      <img
        src={src}
        alt={alt}
        className={className}
        draggable={false}
        loading="lazy"
      />
    ),
    [alt, className, src]
  );

  useEffect(() => {
    let alive = true;

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a === 0) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;

          // Remove white/near-white backdrop and keep object silhouette.
          if (r > 244 && g > 244 && b > 244 && sat < 0.09) {
            data[i + 3] = 0;
            continue;
          }

          // Feather near-white edges for smoother blend into card background.
          if (r > 226 && g > 226 && b > 226 && sat < 0.18) {
            const distance = 255 - (r + g + b) / 3;
            const factor = Math.max(0, Math.min(1, distance / 20));
            data[i + 3] = Math.round(a * factor);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const nextSrc = canvas.toDataURL("image/png");
        if (alive) setProcessedSrc(nextSrc);
      } catch {
        if (alive) setProcessedSrc(null);
      }
    };
    img.onerror = () => {
      if (alive) setProcessedSrc(null);
    };
    img.src = src;

    return () => {
      alive = false;
    };
  }, [src]);

  if (!processedSrc) return fallback;

  return (
    <img
      src={processedSrc}
      alt={alt}
      className={className}
      draggable={false}
      loading="lazy"
    />
  );
}
