import type { FontPairId } from "./font-pairs";
import type { ThemeBase } from "./presets";

export type ThemeSource = { kind: "preset" | "custom"; id: string };
export type ThemeEffect = "starfield" | "grid" | "none";
export type ColorKey = "bg" | "surface" | "text" | "primary" | "accent";
export type ThemeOverrides = Partial<Record<ColorKey, string>>;

export interface ThemeSettings {
  source: ThemeSource;
  overrides: ThemeOverrides;
  fontPair: FontPairId;
  radius: number;
  effect: ThemeEffect;
  animations: boolean;
  visitorToggle: { enabled: boolean; darkSource: ThemeSource; lightSource: ThemeSource };
}

export interface CustomThemeDTO extends ThemeBase {
  id: string;
  name: string;
}
