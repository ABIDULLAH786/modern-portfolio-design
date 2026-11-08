import type { CoverStyle } from "@/lib/constants";

/** Deterministic PRNG seeded from a string (stable between server and client renders). */
function rng(seed: string): () => number {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const f = (n: number, d = 1) => Number(n.toFixed(d));

/**
 * SVG cover art that recolours with the theme (uses CSS variables only).
 * Ported from the prototype's coverSVG(); gradient ids are unique per game.
 */
export function GameCoverArt({ seed, style, title }: { seed: string; style: CoverStyle; title: string }) {
  const r = rng(seed + title);
  const id = `g-${seed.replace(/\W/g, "")}-${style}`;
  const stars = Array.from({ length: 40 }, () => ({ cx: f(r() * 400), cy: f(r() * 250), rr: f(r() * 1.4 + 0.3, 2), o: f(r() * 0.7 + 0.2, 2) }));

  let art: React.ReactNode;
  if (style === "space") {
    art = (
      <>
        {stars.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.rr} fill="#fff" opacity={s.o} />
        ))}
        <circle cx="310" cy="80" r="48" fill={`url(#${id}r)`} />
        <ellipse cx="310" cy="80" rx="80" ry="16" fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="3" opacity=".7" transform="rotate(-18 310 80)" />
        <g transform="translate(130 140) rotate(-14)">
          <rect x="-26" y="18" width="52" height="54" rx="18" fill="#E9ECF5" />
          <rect x="-40" y="26" width="16" height="34" rx="8" fill="#D4D8E6" />
          <rect x="24" y="26" width="16" height="34" rx="8" fill="#D4D8E6" />
          <circle cx="0" cy="0" r="32" fill="#F4F6FB" />
          <ellipse cx="2" cy="2" rx="22" ry="17" style={{ fill: "var(--primary-deep)" }} />
          <ellipse cx="-6" cy="-4" rx="7" ry="4" fill="#fff" opacity=".6" />
          <rect x="-12" y="34" width="24" height="12" rx="3" style={{ fill: "var(--accent)" }} />
        </g>
        <circle cx="60" cy="210" r="14" fill="#fff" opacity=".08" />
        <path d="M200 230 Q 260 200 330 220" style={{ stroke: "var(--accent)" }} strokeWidth="2" fill="none" opacity=".4" strokeDasharray="4 6" />
      </>
    );
  } else if (style === "battle") {
    const lines: React.ReactNode[] = [];
    for (let x = 0; x <= 400; x += 25) lines.push(<line key={`x${x}`} x1={x} y1="0" x2={x} y2="250" stroke="#fff" opacity=".05" />);
    for (let y = 0; y <= 250; y += 25) lines.push(<line key={`y${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#fff" opacity=".05" />);
    art = (
      <>
        {lines}
        <g style={{ stroke: "var(--accent)" }} fill="none" strokeWidth="3">
          <circle cx="270" cy="110" r="52" opacity=".8" />
          <circle cx="270" cy="110" r="22" />
          <path d="M270 40v40M270 140v40M200 110h40M300 110h40" />
        </g>
        <g transform="translate(120 160)">
          <rect x="-50" y="0" width="100" height="34" rx="10" style={{ fill: "var(--primary)" }} />
          <rect x="-56" y="28" width="112" height="16" rx="8" fill="#1a1a22" />
          {[-40, -20, 0, 20, 40].map((x) => (
            <circle key={x} cx={x} cy="36" r="6" fill="#555" />
          ))}
          <rect x="-22" y="-20" width="44" height="26" rx="8" style={{ fill: "var(--primary-light)" }} />
          <rect x="18" y="-12" width="70" height="9" rx="4" fill="#d9dbe6" transform="rotate(-14 18 -8)" />
        </g>
        <circle cx="340" cy="200" r="8" style={{ fill: "var(--accent)" }} opacity=".7" />
        <circle cx="60" cy="60" r="5" style={{ fill: "var(--accent)" }} opacity=".5" />
      </>
    );
  } else if (style === "jet") {
    const clouds = Array.from({ length: 6 }, () => ({ cx: Math.round(r() * 400), cy: Math.round(r() * 250), rx: Math.round(40 + r() * 50), ry: Math.round(10 + r() * 10) }));
    const enemy = (x: number, y: number, s: number) => (
      <path key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`} d="M0 20 L-18 -8 L-6 -4 L0 -16 L6 -4 L18 -8Z" style={{ fill: "var(--accent)" }} />
    );
    art = (
      <>
        {clouds.map((c, i) => (
          <ellipse key={i} {...c} fill="#fff" opacity=".07" />
        ))}
        {enemy(120, 60, 1)}
        {enemy(290, 48, 1.1)}
        {enemy(210, 30, 0.8)}
        <g style={{ stroke: "var(--accent)" }} strokeWidth="3" strokeLinecap="round">
          <path d="M192 150v-18M208 150v-18M192 118v-14M208 118v-14" />
        </g>
        <g transform="translate(200 190)">
          <path d="M0 -36 L8 -12 L44 6 L44 14 L8 6 L6 24 L18 32 L18 38 L0 34 L-18 38 L-18 32 L-6 24 L-8 6 L-44 14 L-44 6 L-8 -12Z" fill="#EEF0F7" />
          <path d="M0 -26 L4 -10 L-4 -10Z" style={{ fill: "var(--primary)" }} />
          <path d="M-4 34 L0 52 L4 34Z" style={{ fill: "var(--accent)" }} opacity=".9" />
        </g>
      </>
    );
  } else {
    const px = Array.from({ length: 60 }, () => ({
      x: Math.floor(r() * 20) * 20,
      y: Math.floor(r() * 13) * 20,
      c: r() > 0.5 ? "var(--primary)" : "var(--accent)",
      o: f(r() * 0.5 + 0.15, 2),
    }));
    art = (
      <>
        {px.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width="18" height="18" rx="3" style={{ fill: p.c }} opacity={p.o} />
        ))}
        <g transform="translate(160 85)" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="0" y="12" width="80" height="48" rx="24" />
          <path d="M20 36h16M28 28v16M54 38h.01M64 32h.01" />
        </g>
      </>
    );
  }

  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${title} cover art`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--bg)" }} />
          <stop offset="1" style={{ stopColor: "var(--cover-to)" }} />
        </linearGradient>
        <radialGradient id={`${id}r`}>
          <stop offset="0" style={{ stopColor: "var(--accent)" }} />
          <stop offset="1" style={{ stopColor: "var(--primary)" }} />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#${id})`} />
      {art}
    </svg>
  );
}
