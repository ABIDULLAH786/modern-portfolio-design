"use client";

import { useEffect, useRef, useState } from "react";

/** Tiny public toast (bottom-centre pill). Trigger with: window.dispatchEvent(new CustomEvent("toast", { detail: "Copied" })) */
export function Toaster() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const on = (e: Event) => {
      setMsg(String((e as CustomEvent).detail ?? ""));
      setShow(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShow(false), 2200);
    };
    window.addEventListener("toast", on);
    return () => window.removeEventListener("toast", on);
  }, []);
  return (
    <div className={`toast${show ? " show" : ""}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("toast", { detail: message }));
}
