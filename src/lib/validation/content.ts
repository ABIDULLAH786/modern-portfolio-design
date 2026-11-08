import { z } from "zod";
import { EXPERIENCE_TYPES, SERVICE_ICONS } from "@/lib/constants";
import { mediaRef, objectId, optionalUrl, required, text } from "./primitives";

export const skillCategorySchema = z.object({ name: required(50, "Category name") });

export const skillSchema = z.object({
  name: required(60, "Skill name"),
  level: z.number().int().min(0).max(100),
  categoryId: objectId,
});
export type SkillInput = z.infer<typeof skillSchema>;

const yearMonth = z.object({
  month: z.number().int().min(1).max(12).nullable(),
  year: z.number().int().min(1950).max(2100),
});

export const experienceSchema = z
  .object({
    type: z.enum(EXPERIENCE_TYPES),
    role: required(100, "Role / title"),
    organization: required(100, "Organisation"),
    location: text(80, "Location"),
    url: optionalUrl,
    start: yearMonth.nullable(),
    end: yearMonth.nullable(),
    current: z.boolean(),
    periodOverride: text(40, "Period override"),
    description: text(3000, "Description"),
  })
  .refine((e) => e.start || e.periodOverride, { message: "Add a start year or a period override", path: ["start"] });
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const serviceSchema = z.object({
  title: required(60, "Title"),
  icon: z.enum(SERVICE_ICONS),
  description: required(200, "Description"),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const testimonialSchema = z.object({
  quote: required(400, "Quote"),
  name: required(60, "Name"),
  role: text(60, "Role"),
  company: text(60, "Company"),
  avatar: mediaRef,
  url: optionalUrl,
  published: z.boolean(),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;
