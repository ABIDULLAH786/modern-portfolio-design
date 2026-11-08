import { z } from "zod";
import { FONT_PAIR_IDS } from "@/lib/theme/font-pairs";
import { hex, required } from "./primitives";

export const themeSource = z.object({ kind: z.enum(["preset", "custom"]), id: z.string().min(1).max(40) });

export const themeSettingsSchema = z.object({
  source: themeSource,
  overrides: z
    .object({ bg: hex, surface: hex, text: hex, primary: hex, accent: hex })
    .partial(),
  fontPair: z.enum(FONT_PAIR_IDS),
  radius: z.number().int().min(0).max(32),
  effect: z.enum(["starfield", "grid", "none"]),
  animations: z.boolean(),
  visitorToggle: z.object({ enabled: z.boolean(), darkSource: themeSource, lightSource: themeSource }),
});

export const customThemeSchema = z.object({
  name: required(40, "Name"),
  mode: z.enum(["dark", "light"]),
  bg: hex,
  surface: hex,
  text: hex,
  primary: hex,
  accent: hex,
});
export type CustomThemeInput = z.infer<typeof customThemeSchema>;
