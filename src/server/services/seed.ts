import "server-only";
import crypto from "node:crypto";
import {
  seedCopy,
  seedDisplay,
  seedExperiences,
  seedGames,
  seedProfile,
  seedSections,
  seedSeo,
  seedServices,
  seedSkills,
  seedTheme,
} from "@/data/seed";
import { CustomTheme, Experience, Game, Profile, Service, Settings, Skill, SkillCategory, Testimonial } from "@/server/models";

export const seedHash = (s: string) => crypto.createHash("sha1").update(s.trim()).digest("hex").slice(0, 16);

export function placeholderHashes(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const g of seedGames) if (g.placeholder) out[`game:${g.slug}:description`] = seedHash(g.description);
  out["profile:email"] = seedHash("your.email@example.com");
  return out;
}

export interface SeedReport {
  created: string[];
  skipped: string[];
}

/**
 * Idempotent seed. Singletons are created when missing; lists are inserted only when the
 * collection is empty. `force` resets all content (keeps users, messages and media).
 */
export async function applySeed({ force = false }: { force?: boolean } = {}): Promise<SeedReport> {
  const report: SeedReport = { created: [], skipped: [] };

  if (force) {
    await Promise.all([
      Settings.deleteMany({}),
      Profile.deleteMany({}),
      Game.deleteMany({}),
      SkillCategory.deleteMany({}),
      Skill.deleteMany({}),
      Experience.deleteMany({}),
      Service.deleteMany({}),
      Testimonial.deleteMany({}),
      CustomTheme.deleteMany({}),
    ]);
  }

  const hasSettings = await Settings.exists({ _id: "site" });
  if (!hasSettings) {
    await Settings.create({
      _id: "site",
      theme: seedTheme,
      themeDraft: null,
      sections: seedSections,
      copy: seedCopy,
      display: seedDisplay,
      seo: seedSeo,
      seedHashes: placeholderHashes(),
    });
    report.created.push("settings");
  } else report.skipped.push("settings");

  const hasProfile = await Profile.exists({ _id: "profile" });
  if (!hasProfile) {
    await Profile.create({ _id: "profile", ...seedProfile });
    report.created.push("profile");
  } else report.skipped.push("profile");

  if ((await Game.countDocuments()) === 0) {
    await Game.insertMany(
      seedGames.map((g, order) => ({
        title: g.title,
        slug: g.slug,
        previousSlugs: [],
        status: g.status,
        published: true,
        featured: g.featured,
        order,
        genre: g.genre,
        platforms: g.platforms,
        engine: g.engine,
        releaseYear: null,
        shortDescription: g.shortDescription,
        description: g.description,
        tags: g.tags,
        cover: null,
        coverStyle: g.coverStyle,
        gallery: [],
        trailerUrl: "",
        links: g.links,
      })),
    );
    report.created.push(`games (${seedGames.length})`);
  } else report.skipped.push("games");

  if ((await SkillCategory.countDocuments()) === 0) {
    let total = 0;
    for (const [ci, group] of seedSkills.entries()) {
      const cat = await SkillCategory.create({ name: group.category, order: ci });
      await Skill.insertMany(group.skills.map(([name, level], si) => ({ name, level, categoryId: cat._id, order: si })));
      total += group.skills.length;
    }
    report.created.push(`skills (${seedSkills.length} categories, ${total} skills)`);
  } else report.skipped.push("skills");

  if ((await Experience.countDocuments()) === 0) {
    await Experience.insertMany(seedExperiences.map((e, order) => ({ ...e, order })));
    report.created.push(`experiences (${seedExperiences.length})`);
  } else report.skipped.push("experiences");

  if ((await Service.countDocuments()) === 0) {
    await Service.insertMany(seedServices.map((s, order) => ({ ...s, order })));
    report.created.push(`services (${seedServices.length})`);
  } else report.skipped.push("services");

  // Testimonials are intentionally seeded empty (PRD FR-T-2). Custom themes: none.
  await Promise.all([Testimonial.init(), CustomTheme.init()]);
  return report;
}
