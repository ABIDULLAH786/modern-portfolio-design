/**
 * pnpm seed            → create missing content (safe to run any time)
 * pnpm seed --force    → reset all content to the starter content (keeps users, messages, media)
 */
import "./_env";
import fs from "node:fs";
import path from "node:path";
import { seedResumePath } from "@/data/seed";
import { imagekitConfigured, env } from "@/env";
import { folderFor } from "@/lib/media-kinds";
import { connectDb, disconnectDb } from "@/server/db";
import { Media, Profile } from "@/server/models";
import { media } from "@/server/services/media";
import { applySeed } from "@/server/services/seed";

async function uploadSeedResume() {
  const profile = await Profile.findById("profile");
  if (!profile || profile.cv?.url) return "resume: already set";
  if (!imagekitConfigured()) return "resume: skipped (ImageKit not configured)";
  const file = path.resolve(process.cwd(), seedResumePath);
  if (!fs.existsSync(file)) return "resume: skipped (seed PDF not found)";
  const folder = folderFor(env().IMAGEKIT_ROOT_FOLDER, "resume");
  const remote = await media.uploadBuffer(fs.readFileSync(file), "Najeeb-Ullah-Resume.pdf", folder);
  const doc = await Media.create({
    fileId: remote.fileId,
    filePath: remote.filePath,
    folder,
    name: remote.name,
    url: remote.url,
    format: "pdf",
    bytes: remote.size,
    kind: "pdf",
    purpose: "resume",
    alt: "Najeeb Ullah resume",
  });
  profile.cv = { mediaId: String(doc._id), fileId: remote.fileId, url: remote.url, fileName: "Najeeb-Ullah-Resume.pdf", uploadedAt: new Date() };
  await profile.save();
  return `resume: uploaded to ImageKit ${remote.filePath}`;
}

async function main() {
  const force = process.argv.includes("--force");
  await connectDb();
  const report = await applySeed({ force });
  console.log(`✔ Seed ${force ? "(forced reset) " : ""}complete`);
  if (report.created.length) console.log(`  created: ${report.created.join(", ")}`);
  if (report.skipped.length) console.log(`  kept existing: ${report.skipped.join(", ")}`);
  try {
    console.log(`  ${await uploadSeedResume()}`);
  } catch (e) {
    console.warn(`  resume upload failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  console.log("\nIf the dev/prod server is running, content shows up after its cache refreshes (or save anything in the admin).");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
