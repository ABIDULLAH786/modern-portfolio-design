"use client";

/** Store/play button that records a `play_click` (only stored when analytics are on). */
export function PlayLink({ href, slug, store, track, className, children }: { href: string; slug: string; store: string; track: boolean; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        if (!track) return;
        const body = JSON.stringify({ slug, store });
        if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
          void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
        }
      }}
    >
      {children}
    </a>
  );
}
