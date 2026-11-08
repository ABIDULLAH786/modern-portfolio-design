export const FONT_PAIR_IDS = ["sora", "grotesk", "arcade", "outfit"] as const;
export type FontPairId = (typeof FONT_PAIR_IDS)[number];

export interface FontPair {
  id: FontPairId;
  name: string;
  head: string;
  body: string;
  feel: string;
  /** Base font size in px (Rajdhani renders small). */
  baseSize: number;
}

export const FONT_PAIRS: Record<FontPairId, FontPair> = {
  sora: { id: "sora", name: "Sora + Inter", head: "var(--font-sora)", body: "var(--font-inter)", feel: "Modern, clean", baseSize: 16 },
  grotesk: { id: "grotesk", name: "Space Grotesk + DM Sans", head: "var(--font-space-grotesk)", body: "var(--font-dm-sans)", feel: "Techy", baseSize: 16 },
  arcade: { id: "arcade", name: "Orbitron + Rajdhani", head: "var(--font-orbitron)", body: "var(--font-rajdhani)", feel: "Gaming / sci-fi", baseSize: 17 },
  outfit: { id: "outfit", name: "Outfit", head: "var(--font-outfit)", body: "var(--font-outfit)", feel: "Friendly, rounded", baseSize: 16 },
};
