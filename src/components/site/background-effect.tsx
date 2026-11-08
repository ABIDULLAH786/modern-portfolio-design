"use client";

import dynamic from "next/dynamic";
import type { ThemeEffect } from "@/lib/theme/types";

const Starfield = dynamic(() => import("./starfield").then((m) => m.Starfield), { ssr: false });

/** Grid is pure CSS (class on the wrapper); the starfield canvas is lazy-loaded. */
export function BackgroundEffect({ effect, animate }: { effect: ThemeEffect; animate: boolean }) {
  if (effect !== "starfield") return null;
  return <Starfield animate={animate} />;
}
