export type ThemeMode = "dark" | "light";

export interface ThemeBase {
  mode: ThemeMode;
  bg: string;
  surface: string;
  text: string;
  primary: string;
  accent: string;
}

export interface ThemePreset extends ThemeBase {
  id: PresetId;
  name: string;
}

export const PRESET_IDS = [
  "neon",
  "ocean",
  "lime",
  "sunset",
  "gold",
  "crimson",
  "light",
  "mint",
  "paper",
] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const PRESETS: Record<PresetId, ThemePreset> = {
  neon: { id: "neon", name: "Neon Arcade", mode: "dark", bg: "#0B0B14", surface: "#14142A", text: "#ECECF8", primary: "#7C5CFF", accent: "#22D3EE" },
  ocean: { id: "ocean", name: "Ocean Depth", mode: "dark", bg: "#06111C", surface: "#0D1D2E", text: "#E6F1FB", primary: "#38BDF8", accent: "#818CF8" },
  lime: { id: "lime", name: "Cyber Lime", mode: "dark", bg: "#090E0A", surface: "#121A13", text: "#E8F5E9", primary: "#A3E635", accent: "#2DD4BF" },
  sunset: { id: "sunset", name: "Sunset Synth", mode: "dark", bg: "#140B12", surface: "#22121E", text: "#FCEFF5", primary: "#FB7185", accent: "#FBBF24" },
  gold: { id: "gold", name: "Royal Gold", mode: "dark", bg: "#0E0C08", surface: "#1A1710", text: "#F7F1E3", primary: "#EAB308", accent: "#F97316" },
  crimson: { id: "crimson", name: "Crimson Core", mode: "dark", bg: "#100808", surface: "#1D0F11", text: "#FBECEC", primary: "#EF4444", accent: "#F472B6" },
  light: { id: "light", name: "Clean Light", mode: "light", bg: "#F6F6FB", surface: "#FFFFFF", text: "#15151F", primary: "#4F46E5", accent: "#0891B2" },
  mint: { id: "mint", name: "Mint Fresh", mode: "light", bg: "#F2FAF6", surface: "#FFFFFF", text: "#0F1F19", primary: "#059669", accent: "#0284C7" },
  paper: { id: "paper", name: "Warm Paper", mode: "light", bg: "#FAF6EF", surface: "#FFFDF8", text: "#231C14", primary: "#C2410C", accent: "#A16207" },
};

export const DEFAULT_PRESET: PresetId = "neon";

export function isPresetId(id: string): id is PresetId {
  return (PRESET_IDS as readonly string[]).includes(id);
}
