"use server";

import type { ActionResult } from "@/lib/types";
import type { CustomThemeDTO } from "@/lib/theme/types";
import { objectId } from "@/lib/validation/primitives";
import { customThemeSchema, themeSettingsSchema } from "@/lib/validation/theme";
import { toCustomThemeDTO } from "@/server/dto";
import { CustomTheme, Settings } from "@/server/models";
import { TAGS, expire } from "@/server/revalidate";
import { adminAction, fail, invalid } from "./_helpers";

export async function saveThemeDraft(input: unknown): Promise<ActionResult> {
  return adminAction("saveThemeDraft", async () => {
    const parsed = themeSettingsSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    await Settings.updateOne({ _id: "site" }, { $set: { themeDraft: parsed.data } });
    // The draft is only read by /preview (dynamic), so the public cache is untouched.
    return { ok: true, data: null };
  });
}

export async function publishTheme(input?: unknown): Promise<ActionResult> {
  return adminAction("publishTheme", async () => {
    let theme: unknown = input;
    if (theme === undefined) {
      const s = await Settings.findById("site").select("themeDraft").lean();
      theme = s?.themeDraft;
    }
    if (!theme) return fail("There are no theme changes to publish.");
    const parsed = themeSettingsSchema.safeParse(theme);
    if (!parsed.success) return invalid(parsed.error);
    await Settings.updateOne({ _id: "site" }, { $set: { theme: parsed.data, themeDraft: null } });
    expire(TAGS.settings);
    return { ok: true, data: null };
  });
}

export async function discardThemeDraft(): Promise<ActionResult> {
  return adminAction("discardThemeDraft", async () => {
    await Settings.updateOne({ _id: "site" }, { $set: { themeDraft: null } });
    return { ok: true, data: null };
  });
}

export async function createCustomTheme(input: unknown): Promise<ActionResult<CustomThemeDTO>> {
  return adminAction("createCustomTheme", async () => {
    const parsed = customThemeSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    if ((await CustomTheme.countDocuments()) >= 30) return fail("You can save up to 30 themes. Delete one first.");
    const doc = await CustomTheme.create(parsed.data);
    expire(TAGS.themes);
    return { ok: true, data: toCustomThemeDTO(doc.toObject() as unknown as Record<string, unknown>) };
  });
}

export async function renameCustomTheme(id: string, name: unknown): Promise<ActionResult> {
  return adminAction("renameCustomTheme", async () => {
    const n = customThemeSchema.shape.name.parse(name);
    await CustomTheme.updateOne({ _id: objectId.parse(id) }, { $set: { name: n } });
    expire(TAGS.themes);
    return { ok: true, data: null };
  });
}

export async function deleteCustomTheme(id: string): Promise<ActionResult> {
  return adminAction("deleteCustomTheme", async () => {
    const tid = objectId.parse(id);
    const s = await Settings.findById("site").select("theme themeDraft").lean();
    const inUse = JSON.stringify([s?.theme, s?.themeDraft]).includes(`"${tid}"`);
    if (inUse) return fail("This theme is in use (live site, draft or light/dark switch). Pick another theme first.");
    await CustomTheme.deleteOne({ _id: tid });
    expire(TAGS.themes);
    return { ok: true, data: null };
  });
}
