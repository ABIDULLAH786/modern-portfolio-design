"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#0B0B14", color: "#ECECF8" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: "10px 18px", borderRadius: 999, border: 0, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
