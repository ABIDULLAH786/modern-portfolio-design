"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Adds `.in` to `.reveal` elements as they scroll into view (12% visible, once), with a
 * small stagger for siblings. Pure CSS does the animation, so content is never hidden
 * without JavaScript (the `.js` class is only set by the pre-paint script).
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        visible.forEach((e, i) => {
          const el = e.target as HTMLElement;
          el.style.transitionDelay = `${Math.min(i, 6) * 75}ms`;
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
