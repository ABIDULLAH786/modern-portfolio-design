"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="center-page">
      <div>
        <p className="big-code grad-text">Oops</p>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", margin: "10px 0 12px" }}>Something went wrong</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>Please try again in a moment.</p>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <button type="button" className="btn btn-primary" onClick={reset}>
            <RotateCw aria-hidden="true" /> Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
