import { z } from "zod";
import { SECTION_KEYS } from "@/lib/constants";
import { mediaRef, required, text } from "./primitives";

export const sectionSchema = z.object({
  key: z.enum(SECTION_KEYS),
  label: required(30, "Menu label"),
  visible: z.boolean(),
  order: z.number().int().min(0),
});
export const sectionsSchema = z
  .array(sectionSchema)
  .length(SECTION_KEYS.length)
  .refine((s) => new Set(s.map((x) => x.key)).size === SECTION_KEYS.length, "Every section must appear once");

const head = { eyebrow: text(40, "Eyebrow"), title: required(100, "Title") };

export const copySchema = z.object({
  about: z.object({ ...head, subtitle: text(300, "Subtitle") }),
  games: z.object({ ...head, subtitle: text(300, "Subtitle") }),
  skills: z.object({ ...head, subtitle: text(300, "Subtitle") }),
  experience: z.object({ ...head, subtitle: text(300, "Subtitle") }),
  services: z.object({ ...head, subtitle: text(300, "Subtitle") }),
  testimonials: z.object({ ...head, subtitle: text(300, "Subtitle") }),
  contact: z.object({
    ...head,
    subtitle: text(300, "Subtitle"),
    successMessage: required(300, "Success message"),
    projectTypes: z.array(required(60, "Option")).min(1, "Add at least one project type").max(12),
    budgetEnabled: z.boolean(),
    budgetOptions: z.array(required(60, "Option")).max(12),
    autoReply: z.object({ enabled: z.boolean(), subject: text(150, "Subject"), body: text(3000, "Body") }),
  }),
});
export type CopyInput = z.infer<typeof copySchema>;

export const displaySchema = z.object({
  gamesOnHome: z.number().int().min(3).max(12),
  featuredFirst: z.boolean(),
  showSkillPercent: z.boolean(),
  experienceSort: z.enum(["manual", "newest"]),
});
export type DisplayInput = z.infer<typeof displaySchema>;

export const seoSchema = z.object({
  siteTitle: required(80, "Site title"),
  description: required(300, "Description"),
  keywords: z.array(required(50, "Keyword")).max(20),
  ogImage: mediaRef,
  favicon: mediaRef,
  googleVerification: text(120, "Verification code"),
  analyticsEnabled: z.boolean(),
});
export type SeoInput = z.infer<typeof seoSchema>;
