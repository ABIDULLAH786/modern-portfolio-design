"use server";

import type { ActionResult, ProfileDTO } from "@/lib/types";
import { profileSchema } from "@/lib/validation/profile";
import { toProfileDTO } from "@/server/dto";
import { Profile } from "@/server/models";
import { TAGS, expire } from "@/server/revalidate";
import { adminAction, invalid } from "./_helpers";

/** Saves the whole profile (all tabs, incl. socials + stats, which are reordered client-side). */
export async function updateProfile(input: unknown): Promise<ActionResult<ProfileDTO>> {
  return adminAction("updateProfile", async () => {
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const doc = await Profile.findByIdAndUpdate("profile", { $set: parsed.data }, { new: true, upsert: true }).lean<Record<string, unknown>>();
    // Games' JSON-LD + hero chips use the profile too.
    expire(TAGS.profile, TAGS.games);
    return { ok: true, data: toProfileDTO(doc ?? {}) };
  });
}
