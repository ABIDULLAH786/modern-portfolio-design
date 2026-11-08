import "server-only";
import { buildTheme, type ResolvedTheme } from "@/lib/theme/resolve";
import type { ThemeSettings } from "@/lib/theme/types";
import { getCustomThemes, getSettings } from "./public";

export async function getPublishedTheme(): Promise<ResolvedTheme> {
  const [settings, custom] = await Promise.all([getSettings(), getCustomThemes()]);
  return buildTheme(settings.theme, custom);
}

export async function buildThemeFrom(theme: ThemeSettings): Promise<ResolvedTheme> {
  return buildTheme(theme, await getCustomThemes());
}
