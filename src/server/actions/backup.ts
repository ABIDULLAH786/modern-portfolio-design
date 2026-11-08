"use server";

import { z } from "zod";
import type { ActionResult } from "@/lib/types";
import { backupSchema, backupSummary } from "@/lib/validation/backup";
import { ALL_TAGS, expire } from "@/server/revalidate";
import { restoreBackup } from "@/server/services/backup";
import { applySeed } from "@/server/services/seed";
import { adminAction, invalid } from "./_helpers";

export async function previewBackup(json: unknown): Promise<ActionResult<{ summary: string[]; exportedAt: string }>> {
  return adminAction("previewBackup", async () => {
    const parsed = backupSchema.safeParse(json);
    if (!parsed.success) return invalid(parsed.error);
    return { ok: true, data: { summary: backupSummary(parsed.data), exportedAt: parsed.data.exportedAt } };
  });
}

export async function importBackup(json: unknown, confirm: unknown): Promise<ActionResult> {
  return adminAction("importBackup", async () => {
    z.literal("REPLACE", { error: 'Type REPLACE to confirm' }).parse(confirm);
    const parsed = backupSchema.safeParse(json);
    if (!parsed.success) return invalid(parsed.error);
    await restoreBackup(parsed.data);
    expire(...ALL_TAGS);
    return { ok: true, data: null };
  });
}

export async function resetToSeed(confirm: unknown): Promise<ActionResult> {
  return adminAction("resetToSeed", async () => {
    z.literal("REPLACE", { error: 'Type REPLACE to confirm' }).parse(confirm);
    await applySeed({ force: true });
    expire(...ALL_TAGS);
    return { ok: true, data: null };
  });
}
