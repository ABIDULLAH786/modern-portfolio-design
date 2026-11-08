"use client";

import { useEffect, useRef } from "react";

/** Canvas starfield in theme colours. Pauses when hidden; static with reduced motion / animations off. */
export function Starfield({ animate }: { animate: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let colors: string[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    type P = { x: number; y: number; r: number; v: number; c: number; t: number };
    let pts: P[] = [];

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = ["--primary", "--accent", "--text"].map((v) => s.getPropertyValue(v).trim() || "#ffffff");
    };
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = cv.width = Math.floor(window.innerWidth * dpr);
      h = cv.height = Math.floor(window.innerHeight * dpr);
      cv.style.width = `${window.innerWidth}px`;
      cv.style.height = `${window.innerHeight}px`;
      pts = Array.from({ length: Math.round(window.innerWidth / 14) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.3) * dpr,
        v: (Math.random() * 0.25 + 0.05) * dpr,
        c: Math.floor(Math.random() * 3),
        t: Math.random() * 6,
      }));
    };
    const still = () => !animate || reduce.matches || document.querySelector("[data-anim='off']") !== null;
    const draw = (move: boolean) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (move) {
          p.y -= p.v;
          p.t += 0.02;
          if (p.y < 0) {
            p.y = h;
            p.x = Math.random() * w;
          }
        }
        ctx.globalAlpha = 0.25 + Math.abs(Math.sin(p.t)) * 0.5;
        ctx.fillStyle = colors[p.c] ?? "#fff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fill();
      }
    };
    const tick = () => {
      draw(true);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (still() || document.hidden) draw(false);
      else raf = requestAnimationFrame(tick);
    };
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    const onResize = () => {
      size();
      start();
    };
    const onTheme = () => {
      readColors();
      if (still()) draw(false);
    };

    readColors();
    size();
    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("themechange", onTheme);
    document.addEventListener("visibilitychange", onVis);
    reduce.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("themechange", onTheme);
      document.removeEventListener("visibilitychange", onVis);
      reduce.removeEventListener("change", start);
    };
  }, [animate]);

  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}
