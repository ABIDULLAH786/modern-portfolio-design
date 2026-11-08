import type { ThemeBase } from "./presets";

/** Status colours are fixed and not themeable (Design §3). */
export const STATUS = { success: "#22C55E", warning: "#F59E0B", danger: "#EF4444" } as const;

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

/** Mix `a` with `b`; `weight` is the share of `a` (0–1), like CSS color-mix(a weight%, b). */
export function mix(a: string, b: string, weight: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => x[i]! * weight + y[i]! * (1 - weight)) as RGB);
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

export function relativeLuminance(hex: string): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function onColor(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? "#0B0B10" : "#FFFFFF";
}

export interface ThemeTokens extends ThemeBase {
  surface2: string;
  border: string;
  muted: string;
  onPrimary: string;
  primarySoft: string;
  ring: string;
  shadow: string;
  gradient: string;
  /** Extra tokens used by generated cover art (so we don't depend on color-mix). */
  coverTo: string;
  primaryDeep: string;
  primaryLight: string;
  glass: string;
  glassStrong: string;
  bgGlass: string;
  /** Primary adjusted (towards the text colour) until it reaches 4.5:1 on cards and background. */
  primaryText: string;
}

/** Smallest mix of `color` towards `toward` that reaches `target` contrast on every background. */
export function readableOn(color: string, toward: string, backgrounds: string[], target = 4.5): string {
  for (let w = 1; w >= 0; w -= 0.05) {
    const c = mix(color, toward, w);
    if (backgrounds.every((b) => contrastRatio(c, b) >= target)) return c;
  }
  return toward;
}

export function deriveTokens(base: ThemeBase): ThemeTokens {
  return {
    ...base,
    surface2: mix(base.surface, base.text, 0.9),
    border: withAlpha(base.text, 0.12),
    muted: mix(base.text, base.bg, 0.64),
    onPrimary: onColor(base.primary),
    primarySoft: withAlpha(base.primary, 0.15),
    ring: withAlpha(base.primary, 0.18),
    shadow: `0 20px 50px -20px ${withAlpha(base.primary, 0.45)}`,
    gradient: `linear-gradient(120deg, ${base.primary}, ${base.accent})`,
    coverTo: mix(base.primary, base.bg, 0.55),
    primaryDeep: mix(base.primary, "#000000", 0.7),
    primaryLight: mix(base.primary, "#FFFFFF", 0.75),
    glass: withAlpha(base.surface, 0.72),
    glassStrong: withAlpha(base.surface, 0.85),
    bgGlass: withAlpha(base.bg, 0.7),
    primaryText: readableOn(base.primary, base.text, [base.surface, base.bg, mix(base.surface, base.text, 0.9)]),
  };
}

export interface ContrastCheck {
  label: string;
  ratio: number;
  ok: boolean;
}

export function contrastReport(t: ThemeTokens): ContrastCheck[] {
  const rows: Array<[string, string, string]> = [
    ["Text on background", t.text, t.bg],
    ["Text on cards", t.text, t.surface],
    ["Muted text on background", t.muted, t.bg],
    ["Button text on primary", t.onPrimary, t.primary],
  ];
  return rows.map(([label, fg, bg]) => {
    const ratio = contrastRatio(fg, bg);
    return { label, ratio, ok: ratio >= 4.5 };
  });
}

/** "Generate from one colour": suggests a palette from a primary colour. */
export function generateFromPrimary(primary: string, mode: "dark" | "light"): ThemeBase {
  const [r, g, b] = hexToRgb(primary).map((v) => v / 255) as RGB;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const hsl = (hh: number, ss: number, ll: number): string => {
    const c = (1 - Math.abs(2 * ll - 1)) * ss;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = ll - c / 2;
    const hn = ((hh % 360) + 360) % 360;
    const [rr, gg, bb] =
      hn < 60 ? [c, x, 0] : hn < 120 ? [x, c, 0] : hn < 180 ? [0, c, x] : hn < 240 ? [0, x, c] : hn < 300 ? [x, 0, c] : [c, 0, x];
    return rgbToHex([(rr + m) * 255, (gg + m) * 255, (bb + m) * 255]);
  };
  const accent = hsl(h + 60, Math.max(0.55, s), mode === "dark" ? 0.6 : 0.42);
  if (mode === "dark") {
    return { mode, primary, accent, bg: hsl(h, 0.35, 0.05), surface: hsl(h, 0.33, 0.1), text: hsl(h, 0.3, 0.94) };
  }
  return { mode, primary, accent, bg: hsl(h, 0.3, 0.97), surface: "#FFFFFF", text: hsl(h, 0.25, 0.1) };
}
