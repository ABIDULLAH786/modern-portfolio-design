"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaRef } from "@/lib/types";

type Img = NonNullable<MediaRef>;

/** Screenshot grid + lightbox (←/→/Esc, swipe, focus trap, focus returns to the trigger). */
export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const dialog = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const lastIndex = useRef(0);

  const close = useCallback(() => {
    setIndex(null);
    requestAnimationFrame(() => triggers.current[lastIndex.current]?.focus());
  }, []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (index === null) return;
    lastIndex.current = index;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialog.current) {
        const f = Array.from(dialog.current.querySelectorAll<HTMLElement>("button"));
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  useEffect(() => {
    if (index !== null) dialog.current?.querySelector<HTMLButtonElement>(".lb-close")?.focus();
  }, [index]);

  const current = index === null ? null : images[index];

  return (
    <>
      <div className="gallery">
        {images.map((img, i) => (
          <button
            key={img.mediaId + i}
            type="button"
            ref={(el) => {
              triggers.current[i] = el;
            }}
            onClick={() => setIndex(i)}
            aria-label={`Open screenshot ${i + 1} of ${images.length}${img.alt ? `: ${img.alt}` : ""}`}
          >
            <Image
              src={img.url}
              alt={img.alt || `${title} screenshot ${i + 1}`}
              fill
              sizes="(max-width: 700px) 100vw, 300px"
              {...(img.blurDataUrl ? { placeholder: "blur" as const, blurDataURL: img.blurDataUrl } : {})}
              style={{ objectFit: "cover" }}
            />
          </button>
        ))}
      </div>
      {current ? (
        <div
          ref={dialog}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} screenshots`}
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            const start = touchX.current;
            const end = e.changedTouches[0]?.clientX;
            if (start != null && end != null && Math.abs(end - start) > 40) step(end < start ? 1 : -1);
            touchX.current = null;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size view, dimensions unknown */}
          <img src={`${current.url}${current.url.includes("?") ? "&" : "?"}tr=w-1920`} alt={current.alt || `${title} screenshot ${(index ?? 0) + 1}`} />
          <button type="button" className="icon-btn lb-btn lb-close" onClick={close} aria-label="Close">
            <X />
          </button>
          {images.length > 1 ? (
            <>
              <button type="button" className="icon-btn lb-btn lb-prev" onClick={() => step(-1)} aria-label="Previous screenshot">
                <ChevronLeft />
              </button>
              <button type="button" className="icon-btn lb-btn lb-next" onClick={() => step(1)} aria-label="Next screenshot">
                <ChevronRight />
              </button>
            </>
          ) : null}
          <div className="lb-count" aria-live="polite">
            {(index ?? 0) + 1} / {images.length}
          </div>
        </div>
      ) : null}
    </>
  );
}
