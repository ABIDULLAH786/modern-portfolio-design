import { FONT_PAIRS } from "./font-pairs";
import { DEFAULT_PRESET, PRESETS, isPresetId, type ThemeBase } from "./presets";
import { deriveTokens, type ThemeTokens } from "./derive";
import type { CustomThemeDTO, ThemeSettings, ThemeSource } from "./types";

export function resolveSource(source: ThemeSource, customThemes: CustomThemeDTO[]): ThemeBase {
  if (source.kind === "custom") {
    const c = customThemes.find((t) => t.id === source.id);
    if (c) return { mode: c.mode, bg: c.bg, surface: c.surface, text: c.text, primary: c.primary, accent: c.accent };
  }
  const p = isPresetId(source.id) ? PRESETS[source.id] : PRESETS[DEFAULT_PRESET];
  return { mode: p.mode, bg: p.bg, surface: p.surface, text: p.text, primary: p.primary, accent: p.accent };
}

export function resolveTheme(theme: ThemeSettings, customThemes: CustomThemeDTO[]): ThemeBase {
  return { ...resolveSource(theme.source, customThemes), ...theme.overrides };
}

const varMap: Array<[keyof ThemeTokens, string]> = [
  ["bg", "--bg"],
  ["surface", "--surface"],
  ["surface2", "--surface-2"],
  ["text", "--text"],
  ["muted", "--muted"],
  ["border", "--border"],
  ["primary", "--primary"],
  ["accent", "--accent"],
  ["onPrimary", "--on-primary"],
  ["primarySoft", "--primary-soft"],
  ["ring", "--ring"],
  ["shadow", "--shadow"],
  ["gradient", "--gradient"],
  ["coverTo", "--cover-to"],
  ["primaryDeep", "--primary-deep"],
  ["primaryLight", "--primary-light"],
  ["glass", "--glass"],
  ["glassStrong", "--glass-strong"],
  ["bgGlass", "--bg-glass"],
];

/** Colour tokens only (used for the visitor light/dark alternate set). */
export function colorVars(tokens: ThemeTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of varMap) out[v] = String(tokens[k]);
  out["color-scheme"] = tokens.mode;
  return out;
}

export function toCssVars(tokens: ThemeTokens, radius: number, fontPair: ThemeSettings["fontPair"]): Record<string, string> {
  const fp = FONT_PAIRS[fontPair] ?? FONT_PAIRS.sora;
  return {
    ...colorVars(tokens),
    "--radius": `${radius}px`,
    "--font-head": fp.head,
    "--font-body": fp.body,
    "--base-size": `${fp.baseSize}px`,
  };
}

export function varsToCss(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

export interface ResolvedTheme {
  mode: ThemeBase["mode"];
  vars: Record<string, string>;
  css: string;
  effect: ThemeSettings["effect"];
  animations: boolean;
  fontPair: ThemeSettings["fontPair"];
  toggle: null | { dark: Record<string, string>; light: Record<string, string> };
}

/** Full pipeline: settings → base colours → tokens → CSS custom properties. */
export function buildTheme(theme: ThemeSettings, customThemes: CustomThemeDTO[]): ResolvedTheme {
  const base = resolveTheme(theme, customThemes);
  const tokens = deriveTokens(base);
  const vars = toCssVars(tokens, theme.radius, theme.fontPair);
  let toggle: ResolvedTheme["toggle"] = null;
  if (theme.visitorToggle.enabled) {
    toggle = {
      dark: colorVars(deriveTokens(resolveSource(theme.visitorToggle.darkSource, customThemes))),
      light: colorVars(deriveTokens(resolveSource(theme.visitorToggle.lightSource, customThemes))),
    };
  }
  return {
    mode: base.mode,
    vars,
    css: varsToCss(vars),
    effect: theme.effect,
    animations: theme.animations,
    fontPair: theme.fontPair,
    toggle,
  };
}

/** The <style> body for the document theme. `selector` lets the preview override with higher specificity. */
export function themeStyleSheet(t: ResolvedTheme, selector = ":root"): string {
  let css = `${selector}{${t.css}}`;
  if (t.toggle) {
    css += `${selector}[data-visitor-mode="dark"]{${varsToCss(t.toggle.dark)}}`;
    css += `${selector}[data-visitor-mode="light"]{${varsToCss(t.toggle.light)}}`;
  }
  return css;
}
