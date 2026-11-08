"use server";

import { z } from "zod";
import type { ActionResult } from "@/lib/types";
import { copySchema, displaySchema, sectionsSchema, seoSchema } from "@/lib/validation/settings";
import { Settings } from "@/server/models";
import { ALL_TAGS, TAGS, expire } from "@/server/revalidate";
import { adminAction, invalid } from "./_helpers";

const layoutSchema = z.object({ sections: sectionsSchema, copy: copySchema, display: displaySchema });

/** Layout page: sections order/visibility/labels + all headings + contact options + display options. */
export async function updateLayout(input: unknown): Promise<ActionResult> {
  return adminAction("updateLayout", async () => {
    const parsed = layoutSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const sections = parsed.data.sections
      .map((s) => (s.key === "hero" ? { ...s, visible: true, order: -1 } : s))
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i }));
    await Settings.updateOne({ _id: "site" }, { $set: { sections, copy: parsed.data.copy, display: parsed.data.display } });
    expire(TAGS.settings);
    return { ok: true, data: null };
  });
}

/** Single display option (used by the Skills and Experience pages). */
export async function updateDisplay(input: unknown): Promise<ActionResult> {
  return adminAction("updateDisplay", async () => {
    const parsed = displaySchema.partial().safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const set = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [`display.${k}`, v]));
    await Settings.updateOne({ _id: "site" }, { $set: set });
    expire(TAGS.settings);
    return { ok: true, data: null };
  });
}

export async function updateSeo(input: unknown): Promise<ActionResult> {
  return adminAction("updateSeo", async () => {
    const parsed = seoSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    await Settings.updateOne({ _id: "site" }, { $set: { seo: parsed.data } });
    // Title/description/OG flow into every page's metadata.
    expire(...ALL_TAGS);
    return { ok: true, data: null };
  });
}
