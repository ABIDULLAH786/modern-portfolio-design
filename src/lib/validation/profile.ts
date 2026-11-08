import { z } from "zod";
import { MAX_STATS, SOCIAL_PLATFORMS } from "@/lib/constants";
import { httpUrl, mediaRef, optionalUrl, required, text } from "./primitives";

export const socialSchema = z.object({
  id: z.string().min(1).max(40),
  platform: z.enum(SOCIAL_PLATFORMS),
  label: required(40, "Label"),
  url: httpUrl,
});
export type SocialInput = z.infer<typeof socialSchema>;

export const statSchema = z.object({
  id: z.string().min(1).max(40),
  value: required(10, "Value"),
  label: required(40, "Label"),
});
export type StatInput = z.infer<typeof statSchema>;

export const profileSchema = z.object({
  name: required(80, "Name"),
  role: required(80, "Role"),
  tagline: required(200, "Tagline"),
  bio: required(5000, "Bio"),
  avatar: mediaRef,
  location: text(80, "Location"),
  email: z.union([z.literal(""), z.email("Enter a valid email address").max(120)]),
  phone: text(40, "Phone"),
  available: z.boolean(),
  availabilityText: text(120, "Availability text"),
  heroBadge: text(60, "Badge text"),
  busyBadge: text(60, "Badge text"),
  primaryEngine: text(40, "Main engine"),
  heroChip3: z.object({ title: text(30, "Chip title"), subtitle: text(40, "Chip subtitle") }),
  aboutExternal: z.object({ label: text(40, "Button label"), url: optionalUrl }),
  languages: z.array(required(40, "Language")).max(10),
  socials: z.array(socialSchema).max(16),
  stats: z.array(statSchema).max(MAX_STATS, `At most ${MAX_STATS} stats`),
});
export type ProfileInput = z.infer<typeof profileSchema>;
