import { z } from "zod";
import { gameSchema } from "./game";
import { experienceSchema, serviceSchema, skillCategorySchema, skillSchema, testimonialSchema } from "./content";
import { objectId, slug } from "./primitives";
import { profileSchema } from "./profile";
import { copySchema, displaySchema, sectionsSchema, seoSchema } from "./settings";
import { customThemeSchema, themeSettingsSchema } from "./theme";

const withId = { id: objectId };

export const BACKUP_VERSION = 1;

export const backupSchema = z.object({
  version: z.literal(BACKUP_VERSION, { error: "Unsupported or missing backup version" }),
  exportedAt: z.string(),
  settings: z.object({ theme: themeSettingsSchema, sections: sectionsSchema, copy: copySchema, display: displaySchema, seo: seoSchema }),
  profile: profileSchema.extend({
    cv: z.object({ mediaId: z.string(), fileId: z.string(), url: z.string(), fileName: z.string(), uploadedAt: z.string().nullable() }).nullable(),
  }),
  games: z.array(gameSchema.extend({ ...withId, previousSlugs: z.array(slug), order: z.number().int() })).max(500),
  skillCategories: z.array(skillCategorySchema.extend({ ...withId, order: z.number().int() })).max(100),
  skills: z.array(skillSchema.extend({ ...withId, order: z.number().int() })).max(1000),
  experiences: z.array(z.object({ ...withId, order: z.number().int() }).and(experienceSchema)).max(200),
  services: z.array(serviceSchema.extend({ ...withId, order: z.number().int() })).max(50),
  testimonials: z.array(testimonialSchema.extend({ ...withId, order: z.number().int() })).max(200),
  customThemes: z.array(customThemeSchema.extend(withId)).max(100),
});
export type Backup = z.infer<typeof backupSchema>;

export function backupSummary(b: Backup): string[] {
  return [
    `${b.games.length} game${b.games.length === 1 ? "" : "s"}`,
    `${b.skillCategories.length} skill categories with ${b.skills.length} skills`,
    `${b.experiences.length} experience entries`,
    `${b.services.length} services`,
    `${b.testimonials.length} testimonials`,
    `${b.customThemes.length} saved themes`,
    "profile, theme, layout, headings and SEO settings",
  ];
}
