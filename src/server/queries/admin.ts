import "server-only";
import type { MessageDTO, SettingsDTO } from "@/lib/types";
import { connectDb } from "@/server/db";
import {
  toCustomThemeDTO,
  toExperienceDTO,
  toGameDTO,
  toMediaDTO,
  toMessageDTO,
  toProfileDTO,
  toServiceDTO,
  toSettingsDTO,
  toSkillCategoryDTO,
  toSkillDTO,
  toTestimonialDTO,
} from "@/server/dto";
import { CustomTheme, Experience, Game, Media, Message, PlayClick, Profile, Service, Settings, Skill, SkillCategory, Testimonial } from "@/server/models";
import { defaultSettings } from "./public";
import { seedProfile } from "@/data/seed";

/* Uncached reads for the admin (always fresh). Callers must have checked the session. */
type Raw = Record<string, unknown>;

export async function adminSettings(): Promise<SettingsDTO> {
  await connectDb();
  const doc = await Settings.findById("site").lean<Raw>();
  return doc ? toSettingsDTO(doc) : defaultSettings();
}

export async function adminProfile() {
  await connectDb();
  const doc = await Profile.findById("profile").lean<Raw>();
  return toProfileDTO(doc ?? (seedProfile as unknown as Raw));
}

export async function adminGames() {
  await connectDb();
  return (await Game.find().sort({ order: 1, createdAt: 1 }).lean<Raw[]>()).map(toGameDTO);
}

export async function adminGame(id: string) {
  await connectDb();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await Game.findById(id).lean<Raw>();
  return doc ? toGameDTO(doc) : null;
}

export async function adminGenres(): Promise<string[]> {
  await connectDb();
  const genres = (await Game.distinct("genre")) as unknown[];
  return genres.filter((g): g is string => typeof g === "string" && g.length > 0).sort();
}

export async function adminSkills() {
  await connectDb();
  const [cats, skills] = await Promise.all([SkillCategory.find().sort({ order: 1 }).lean<Raw[]>(), Skill.find().sort({ order: 1 }).lean<Raw[]>()]);
  return { categories: cats.map(toSkillCategoryDTO), skills: skills.map(toSkillDTO) };
}

export async function adminExperiences() {
  await connectDb();
  return (await Experience.find().sort({ order: 1 }).lean<Raw[]>()).map(toExperienceDTO);
}

export async function adminServices() {
  await connectDb();
  return (await Service.find().sort({ order: 1 }).lean<Raw[]>()).map(toServiceDTO);
}

export async function adminTestimonials() {
  await connectDb();
  return (await Testimonial.find().sort({ order: 1 }).lean<Raw[]>()).map(toTestimonialDTO);
}

export async function adminCustomThemes() {
  await connectDb();
  return (await CustomTheme.find().sort({ createdAt: 1 }).lean<Raw[]>()).map(toCustomThemeDTO);
}

export async function adminMedia() {
  await connectDb();
  return (await Media.find().sort({ createdAt: -1 }).limit(1000).lean<Raw[]>()).map(toMediaDTO);
}

export interface MessageFilter {
  status?: "new" | "all" | "archived";
  q?: string;
}

export function messageQuery(f: MessageFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (f.status === "new") query.status = "new";
  else if (f.status === "archived") query.status = "archived";
  else query.status = { $ne: "archived" };
  if (f.q) {
    const rx = new RegExp(f.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: rx }, { email: rx }, { body: rx }, { projectType: rx }];
  }
  return query;
}

export async function adminMessages(f: MessageFilter): Promise<MessageDTO[]> {
  await connectDb();
  return (await Message.find(messageQuery(f)).sort({ createdAt: -1 }).limit(500).lean<Raw[]>()).map(toMessageDTO);
}

export async function unreadCount(): Promise<number> {
  await connectDb();
  return Message.countDocuments({ status: "new" });
}

export async function overviewStats() {
  await connectDb();
  const [published, drafts, unread, skills, latest, recent] = await Promise.all([
    Game.countDocuments({ published: true }),
    Game.countDocuments({ published: false }),
    Message.countDocuments({ status: "new" }),
    Skill.countDocuments(),
    Promise.all([
      Settings.findById("site").select("updatedAt").lean<Raw>(),
      Profile.findById("profile").select("updatedAt").lean<Raw>(),
      Game.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean<Raw>(),
    ]),
    Message.find().sort({ createdAt: -1 }).limit(5).lean<Raw[]>(),
  ]);
  const times = latest.map((d) => (d?.updatedAt ? new Date(d.updatedAt as Date).getTime() : 0));
  const last = Math.max(0, ...times);
  return { published, drafts, unread, skills, lastUpdate: last ? new Date(last).toISOString() : null, recent: recent.map(toMessageDTO) };
}

export async function playClicksByGame(days = 30): Promise<Array<{ slug: string; count: number }>> {
  await connectDb();
  const since = new Date(Date.now() - days * 86400_000);
  const rows = (await PlayClick.aggregate([
    { $match: { at: { $gte: since } } },
    { $group: { _id: "$slug", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])) as Array<{ _id: string; count: number }>;
  return rows.map((r) => ({ slug: r._id, count: r.count }));
}
