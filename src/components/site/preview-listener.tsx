"use client";

import { useEffect } from "react";

export interface PreviewMessage {
  type: "theme-preview";
  vars: Record<string, string>;
  animations: boolean;
  effect: "starfield" | "grid" | "none";
  fontPair: string;
}

/** Applies theme variables sent by the Theme Studio instantly (no reload, no save). */
export function PreviewListener() {
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as Partial<PreviewMessage> | null;
      if (!d || d.type !== "theme-preview" || !d.vars) return;
      const root = document.documentElement;
      for (const [k, v] of Object.entries(d.vars)) root.style.setProperty(k, v);
      const site = document.querySelector<HTMLElement>(".site-root");
      if (site) {
        site.dataset.anim = d.animations ? "on" : "off";
        site.dataset.font = d.fontPair ?? "sora";
        site.classList.toggle("site-fx-grid", d.effect === "grid");
        const canvas = document.querySelector<HTMLElement>(".fx-canvas");
        if (canvas) canvas.style.display = d.effect === "starfield" ? "" : "none";
      }
      if (d.animations === false) document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      window.dispatchEvent(new Event("themechange"));
    };
    window.addEventListener("message", on);
    window.parent?.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", on);
  }, []);
  return null;
}
