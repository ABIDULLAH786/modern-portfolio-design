import "server-only";
import { unstable_cache } from "next/cache";
import { seedCopy, seedDisplay, seedProfile, seedSections, seedSeo, seedTheme } from "@/data/seed";
import type { GameDTO, ProfileDTO, SettingsDTO, SkillGroup } from "@/lib/types";
import { connectDb } from "@/server/db";
import {
  toCustomThemeDTO,
  toExperienceDTO,
  toGameDTO,
  toProfileDTO,
  toServiceDTO,
  toSettingsDTO,
  toSkillCategoryDTO,
  toSkillDTO,
  toTestimonialDTO,
} from "@/server/dto";
import { CustomTheme, Experience, Game, Profile, Service, Settings, Skill, SkillCategory, Testimonial } from "@/server/models";
import { TAGS } from "@/server/revalidate";

const DAY = 60 * 60 * 24;
type Raw = Record<string, unknown>;

/** Defaults used until `pnpm seed` has run, so the site never crashes on an empty DB. */
export function defaultSettings(): SettingsDTO {
  return toSettingsDTO({ theme: seedTheme, themeDraft: null, sections: seedSections, copy: seedCopy, display: seedDisplay, seo: seedSeo });
}

export const getSettings = unstable_cache(
  async (): Promise<SettingsDTO> => {
    await connectDb();
    const doc = await Settings.findById("site").lean<Raw>();
    return doc ? toSettingsDTO(doc) : defaultSettings();
  },
  ["settings-v1"],
  { tags: [TAGS.settings], revalidate: DAY },
);

export const getCustomThemes = unstable_cache(
  async () => {
    await connectDb();
    const docs = await CustomTheme.find().sort({ createdAt: 1 }).lean<Raw[]>();
    return docs.map(toCustomThemeDTO);
  },
  ["custom-themes-v1"],
  { tags: [TAGS.themes], revalidate: DAY },
);

export const getProfile = unstable_cache(
  async (): Promise<ProfileDTO> => {
    await connectDb();
    const doc = await Profile.findById("profile").lean<Raw>();
    return toProfileDTO(doc ?? (seedProfile as unknown as Raw));
  },
  ["profile-v1"],
  { tags: [TAGS.profile], revalidate: DAY },
);

export const getPublishedGames = unstable_cache(
  async (): Promise<GameDTO[]> => {
    await connectDb();
    const docs = await Game.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean<Raw[]>();
    return docs.map(toGameDTO);
  },
  ["published-games-v1"],
  { tags: [TAGS.games], revalidate: DAY },
);

export type GameLookup = { kind: "game"; game: GameDTO } | { kind: "redirect"; slug: string } | { kind: "missing" };

export const getGameBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<GameLookup> => {
      await connectDb();
      const doc = await Game.findOne({ slug, published: true }).lean<Raw>();
      if (doc) return { kind: "game", game: toGameDTO(doc) };
      const moved = await Game.findOne({ previousSlugs: slug, published: true }).select("slug").lean<Raw>();
      if (moved) return { kind: "redirect", slug: String(moved.slug) };
      return { kind: "missing" };
    },
    ["game-by-slug-v1", slug],
    { tags: [TAGS.games, TAGS.game(slug)], revalidate: DAY },
  )();

export const getSkillGroups = unstable_cache(
  async (): Promise<SkillGroup[]> => {
    await connectDb();
    const [cats, skills] = await Promise.all([
      SkillCategory.find().sort({ order: 1 }).lean<Raw[]>(),
      Skill.find().sort({ order: 1 }).lean<Raw[]>(),
    ]);
    const all = skills.map(toSkillDTO);
    return cats.map(toSkillCategoryDTO).map((c) => ({ ...c, skills: all.filter((s) => s.categoryId === c.id) }));
  },
  ["skill-groups-v1"],
  { tags: [TAGS.skills], revalidate: DAY },
);

export const getExperiences = unstable_cache(
  async () => {
    await connectDb();
    const docs = await Experience.find().sort({ order: 1 }).lean<Raw[]>();
    return docs.map(toExperienceDTO);
  },
  ["experiences-v1"],
  { tags: [TAGS.experience], revalidate: DAY },
);

export const getServices = unstable_cache(
  async () => {
    await connectDb();
    const docs = await Service.find().sort({ order: 1 }).lean<Raw[]>();
    return docs.map(toServiceDTO);
  },
  ["services-v1"],
  { tags: [TAGS.services], revalidate: DAY },
);

export const getPublishedTestimonials = unstable_cache(
  async () => {
    await connectDb();
    const docs = await Testimonial.find({ published: true }).sort({ order: 1 }).lean<Raw[]>();
    return docs.map(toTestimonialDTO);
  },
  ["testimonials-v1"],
  { tags: [TAGS.testimonials], revalidate: DAY },
);

/** Featured-first (optional) then manual order. */
export function orderGames(games: GameDTO[], featuredFirst: boolean): GameDTO[] {
  if (!featuredFirst) return games;
  return [...games].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
}
