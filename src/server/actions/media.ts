"use server";

import { z } from "zod";
import { env } from "@/env";
import { MEDIA_KINDS, folderFor, kindRules, type MediaKind } from "@/lib/media-kinds";
import type { ActionResult, MediaDTO, MediaRef, MediaUsage, ResumeFile } from "@/lib/types";
import { toMediaDTO } from "@/server/dto";
import { Game, Media, Profile, Settings, Testimonial } from "@/server/models";
import { ALL_TAGS, TAGS, expire } from "@/server/revalidate";
import { media } from "@/server/services/media";
import { findUsage } from "@/server/services/media-usage";
import { adminAction, fail } from "./_helpers";

type Raw = Record<string, unknown>;

const registerSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
  fileId: z.string().regex(/^[\w-]{6,64}$/),
  scope: z.string().max(80).optional(),
  alt: z.string().trim().max(200).default(""),
});

async function storageUsedBytes(): Promise<number> {
  const rows = (await Media.aggregate([{ $group: { _id: null, total: { $sum: "$bytes" } } }])) as Array<{ total: number }>;
  return rows[0]?.total ?? 0;
}

/** Validates a file the browser just uploaded to ImageKit, then records it. Invalid files are deleted. */
async function verifyAndRecord(kind: MediaKind, fileId: string, scope: string | undefined, alt: string) {
  const remote = await media.getFile(fileId);
  const folder = folderFor(env().IMAGEKIT_ROOT_FOLDER, kind, scope);
  const rules = kindRules(kind);
  const problems: string[] = [];
  if (!remote.filePath.startsWith(`${folder}/`)) problems.push("the file was uploaded to the wrong folder");
  if (!rules.accept.includes(remote.mime)) problems.push(`that file type isn't allowed (${rules.label})`);
  if (remote.size > rules.maxBytes) problems.push(`the file is too large (${rules.label})`);
  const cap = env().IMAGEKIT_MAX_STORAGE_MB;
  if (cap && (await storageUsedBytes()) + remote.size > cap * 1024 * 1024) problems.push(`the storage limit of ${cap} MB would be exceeded; delete unused files in Media first`);
  if (problems.length) {
    await media.deleteFile(fileId).catch(() => undefined);
    throw new Error(`Upload rejected: ${problems.join("; ")}.`);
  }
  const isImage = kind !== "resume";
  const doc = await Media.create({
    fileId: remote.fileId,
    filePath: remote.filePath,
    folder,
    name: remote.name,
    url: remote.url,
    format: remote.mime.split("/")[1] ?? "",
    bytes: remote.size,
    width: remote.width,
    height: remote.height,
    alt,
    kind: isImage ? "image" : "pdf",
    purpose: kind,
  });
  return { doc, remote };
}

export async function registerUpload(input: unknown): Promise<ActionResult<{ media: MediaDTO; ref: NonNullable<MediaRef> }>> {
  return adminAction("registerUpload", async () => {
    const data = registerSchema.parse(input);
    if (data.kind === "resume") return fail("Use the resume uploader for PDFs.");
    const { doc } = await verifyAndRecord(data.kind, data.fileId, data.scope, data.alt);
    const blur = await media.blurDataUrl(doc.url ?? "");
    const dto = toMediaDTO(doc.toObject() as unknown as Raw);
    return {
      ok: true,
      data: { media: dto, ref: { mediaId: dto.id, url: dto.url, width: dto.width, height: dto.height, alt: dto.alt, ...(blur ? { blurDataUrl: blur } : {}) } },
    };
  });
}

/**
 * Registers a new resume PDF and makes it the ONLY resume: the previous file (and anything
 * else left in the /resume folder) is deleted from ImageKit and the media library.
 */
export async function registerResume(input: unknown): Promise<ActionResult<ResumeFile>> {
  return adminAction("registerResume", async () => {
    const { fileId, fileName } = z.object({ fileId: z.string().regex(/^[\w-]{6,64}$/), fileName: z.string().trim().max(120).default("resume.pdf") }).parse(input);
    const { doc, remote } = await verifyAndRecord("resume", fileId, undefined, "Resume");

    const profile = await Profile.findById("profile");
    if (!profile) throw new Error("Profile not found. Run the seed first.");

    // 1) Remove every other resume record + file.
    const oldDocs = await Media.find({ purpose: "resume", _id: { $ne: doc._id } }).lean();
    for (const old of oldDocs) await media.deleteFile(String(old.fileId)).catch((e) => console.warn("[resume] delete old failed", e));
    await Media.deleteMany({ purpose: "resume", _id: { $ne: doc._id } });
    // 2) Sweep the folder for strays (e.g. uploads that were never registered).
    const folder = folderFor(env().IMAGEKIT_ROOT_FOLDER, "resume");
    const strays = await media.listFolder(folder).catch(() => []);
    for (const f of strays) if (f.fileId !== remote.fileId) await media.deleteFile(f.fileId).catch(() => undefined);

    const cleanName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    profile.cv = { mediaId: String(doc._id), fileId: remote.fileId, url: remote.url, fileName: cleanName, uploadedAt: new Date() };
    await profile.save();
    expire(TAGS.profile);
    return { ok: true, data: { mediaId: String(doc._id), fileId: remote.fileId, url: remote.url, fileName: cleanName, uploadedAt: new Date().toISOString() } };
  });
}

export async function removeResume(): Promise<ActionResult> {
  return adminAction("removeResume", async () => {
    const docs = await Media.find({ purpose: "resume" }).lean();
    for (const d of docs) await media.deleteFile(String(d.fileId)).catch(() => undefined);
    await Media.deleteMany({ purpose: "resume" });
    await Profile.updateOne({ _id: "profile" }, { $set: { cv: null } });
    expire(TAGS.profile);
    return { ok: true, data: null };
  });
}

export async function mediaUsage(id: string): Promise<ActionResult<MediaUsage[]>> {
  return adminAction("mediaUsage", async () => ({ ok: true, data: await findUsage(z.string().min(1).parse(id)) }));
}

export async function deleteMedia(id: string): Promise<ActionResult<{ deleted: boolean; usedIn: MediaUsage[] }>> {
  return adminAction<{ deleted: boolean; usedIn: MediaUsage[] }>("deleteMedia", async () => {
    const mid = z.string().regex(/^[a-f0-9]{24}$/i).parse(id);
    const doc = await Media.findById(mid);
    if (!doc) return fail("That file no longer exists.");
    const usedIn = await findUsage(mid);
    if (usedIn.length) return { ok: true, data: { deleted: false, usedIn } };
    await media.deleteFile(String(doc.fileId));
    await doc.deleteOne();
    return { ok: true, data: { deleted: true, usedIn: [] } };
  });
}

/** Updates alt text in the library AND in every place the image is used. */
export async function updateAlt(id: string, alt: unknown): Promise<ActionResult> {
  return adminAction("updateAlt", async () => {
    const mid = z.string().regex(/^[a-f0-9]{24}$/i).parse(id);
    const text = z.string().trim().max(200).parse(alt);
    await Media.updateOne({ _id: mid }, { $set: { alt: text } });
    await Promise.all([
      Game.updateMany({ "cover.mediaId": mid }, { $set: { "cover.alt": text } }),
      Game.updateMany({ "gallery.mediaId": mid }, { $set: { "gallery.$[g].alt": text } }, { arrayFilters: [{ "g.mediaId": mid }] }),
      Profile.updateMany({ "avatar.mediaId": mid }, { $set: { "avatar.alt": text } }),
      Testimonial.updateMany({ "avatar.mediaId": mid }, { $set: { "avatar.alt": text } }),
      Settings.updateMany({ "seo.ogImage.mediaId": mid }, { $set: { "seo.ogImage.alt": text } }),
    ]);
    expire(...ALL_TAGS);
    return { ok: true, data: null };
  });
}

/** Builds a MediaRef from an existing library item (for "Choose from library"). */
export async function mediaRefFor(id: string): Promise<ActionResult<NonNullable<MediaRef>>> {
  return adminAction("mediaRefFor", async () => {
    const doc = await Media.findById(z.string().regex(/^[a-f0-9]{24}$/i).parse(id)).lean();
    if (!doc || doc.kind !== "image") return fail("Image not found.");
    const blur = await media.blurDataUrl(String(doc.url));
    return {
      ok: true,
      data: { mediaId: String(doc._id), url: String(doc.url), width: doc.width ?? 0, height: doc.height ?? 0, alt: doc.alt ?? "", ...(blur ? { blurDataUrl: blur } : {}) },
    };
  });
}

export async function listMedia(kind?: "image" | "pdf"): Promise<ActionResult<MediaDTO[]>> {
  return adminAction("listMedia", async () => {
    const docs = await Media.find(kind ? { kind } : {}).sort({ createdAt: -1 }).limit(1000).lean<Raw[]>();
    return { ok: true, data: docs.map(toMediaDTO) };
  });
}
