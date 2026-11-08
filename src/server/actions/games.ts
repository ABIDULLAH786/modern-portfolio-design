"use server";

import { z } from "zod";
import type { ActionResult, GameDTO } from "@/lib/types";
import { slugify } from "@/lib/utils/slugify";
import { gameSchema } from "@/lib/validation/game";
import { idList, objectId } from "@/lib/validation/primitives";
import { toGameDTO } from "@/server/dto";
import { Game, Media } from "@/server/models";
import { TAGS, expire } from "@/server/revalidate";
import { media } from "@/server/services/media";
import { findUsage } from "@/server/services/media-usage";
import { adminAction, fail, invalid, orderOps } from "./_helpers";

type Raw = Record<string, unknown>;

async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  return Boolean(await Game.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }));
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let s = base || "game";
  for (let i = 2; await slugTaken(s, excludeId); i++) s = `${base}-${i}`;
  return s;
}

export async function checkSlug(slug: string, excludeId?: string): Promise<ActionResult<{ available: boolean }>> {
  return adminAction("checkSlug", async () => ({ ok: true, data: { available: !(await slugTaken(slugify(slug), excludeId)) } }));
}

export async function createGame(input: unknown): Promise<ActionResult<GameDTO>> {
  return adminAction("createGame", async () => {
    const parsed = gameSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const data = parsed.data;
    if (await slugTaken(data.slug)) return { ok: false, error: "That URL is already used by another game.", fieldErrors: { slug: ["Already in use"] } };
    // A new game takes over a slug that used to redirect elsewhere.
    await Game.updateMany({ previousSlugs: data.slug }, { $pull: { previousSlugs: data.slug } });
    const last = await Game.findOne().sort({ order: -1 }).select("order").lean();
    const doc = await Game.create({ ...data, previousSlugs: [], order: (last?.order ?? -1) + 1 });
    expire(TAGS.games, TAGS.game(data.slug));
    return { ok: true, data: toGameDTO(doc.toObject() as unknown as Raw) };
  });
}

export async function updateGame(id: string, input: unknown): Promise<ActionResult<GameDTO>> {
  return adminAction("updateGame", async () => {
    const gid = objectId.parse(id);
    const parsed = gameSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const data = parsed.data;
    const doc = await Game.findById(gid);
    if (!doc) return fail("This game no longer exists.");
    if (await slugTaken(data.slug, gid)) return { ok: false, error: "That URL is already used by another game.", fieldErrors: { slug: ["Already in use"] } };
    const oldSlug = doc.slug;
    if (oldSlug !== data.slug) {
      const prev = new Set([...(doc.previousSlugs ?? []), oldSlug]);
      prev.delete(data.slug);
      doc.previousSlugs = [...prev];
      await Game.updateMany({ _id: { $ne: gid }, previousSlugs: data.slug }, { $pull: { previousSlugs: data.slug } });
    }
    doc.set(data);
    await doc.save();
    expire(TAGS.games, TAGS.game(data.slug), TAGS.game(oldSlug), ...(doc.previousSlugs ?? []).map(TAGS.game));
    return { ok: true, data: toGameDTO(doc.toObject() as unknown as Raw) };
  });
}

export async function duplicateGame(id: string): Promise<ActionResult<GameDTO>> {
  return adminAction("duplicateGame", async () => {
    const src = await Game.findById(objectId.parse(id)).lean();
    if (!src) return fail("This game no longer exists.");
    const slug = await uniqueSlug(`${src.slug}-copy`);
    const last = await Game.findOne().sort({ order: -1 }).select("order").lean();
    const rest: Raw = { ...(src as unknown as Raw) };
    delete rest._id;
    delete rest.createdAt;
    delete rest.updatedAt;
    delete rest.__v;
    const doc = await Game.create({ ...rest, title: `${String(src.title)} (copy)`, slug, previousSlugs: [], published: false, featured: false, order: (last?.order ?? -1) + 1 });
    expire(TAGS.games);
    return { ok: true, data: toGameDTO(doc.toObject() as unknown as Raw) };
  });
}

/** Deletes a game. With deleteImages, its cover + screenshots are removed from ImageKit if nothing else uses them. */
export async function deleteGame(id: string, deleteImages = false): Promise<ActionResult<{ removedImages: number }>> {
  return adminAction("deleteGame", async () => {
    const doc = await Game.findById(objectId.parse(id));
    if (!doc) return fail("This game no longer exists.");
    const mediaIds = [doc.cover?.mediaId, ...(doc.gallery ?? []).map((g) => g.mediaId)].filter((x): x is string => Boolean(x));
    const slugs = [doc.slug, ...(doc.previousSlugs ?? [])];
    await doc.deleteOne();
    let removedImages = 0;
    if (deleteImages) {
      for (const mid of mediaIds) {
        if ((await findUsage(mid)).length) continue;
        const m = await Media.findById(mid);
        if (!m) continue;
        await media.deleteFile(String(m.fileId)).catch(() => undefined);
        await m.deleteOne();
        removedImages++;
      }
    }
    expire(TAGS.games, ...slugs.map(TAGS.game));
    return { ok: true, data: { removedImages } };
  });
}

export async function reorderGames(ids: unknown): Promise<ActionResult> {
  return adminAction("reorderGames", async () => {
    const list = idList.parse(ids);
    await Game.bulkWrite(orderOps(list));
    expire(TAGS.games);
    return { ok: true, data: null };
  });
}

const flagSchema = z.object({ id: objectId, value: z.boolean() });

export async function setGameFlag(input: unknown, flag: "published" | "featured"): Promise<ActionResult<GameDTO>> {
  return adminAction("setGameFlag", async () => {
    const { id, value } = flagSchema.parse(input);
    if (flag !== "published" && flag !== "featured") return fail("Unknown flag");
    const doc = await Game.findByIdAndUpdate(id, { $set: { [flag]: value } }, { returnDocument: "after" }).lean<Raw>();
    if (!doc) return fail("This game no longer exists.");
    expire(TAGS.games, TAGS.game(String(doc.slug)));
    return { ok: true, data: toGameDTO(doc) };
  });
}
