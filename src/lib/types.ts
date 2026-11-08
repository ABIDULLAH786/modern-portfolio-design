import type { CoverStyle, ExperienceType, GameStatus, LinkKind, SectionKey, ServiceIcon, SocialPlatform } from "./constants";
import type { ThemeSettings } from "./theme/types";
import type { CopyInput, DisplayInput } from "./validation/settings";
import type { MediaRef } from "./validation/primitives";

export type { MediaRef };

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface SectionConfig {
  key: SectionKey;
  label: string;
  visible: boolean;
  order: number;
}

export interface SeoDTO {
  siteTitle: string;
  description: string;
  keywords: string[];
  ogImage: MediaRef;
  favicon: MediaRef;
  googleVerification: string;
  analyticsEnabled: boolean;
}

export interface SettingsDTO {
  theme: ThemeSettings;
  themeDraft: ThemeSettings | null;
  sections: SectionConfig[];
  copy: CopyInput;
  display: DisplayInput;
  seo: SeoDTO;
  seedHashes: Record<string, string>;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface ResumeFile {
  mediaId: string;
  fileId: string;
  url: string;
  fileName: string;
  uploadedAt: string | null;
}

export interface ProfileDTO {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  avatar: MediaRef;
  cv: ResumeFile | null;
  location: string;
  email: string;
  phone: string;
  available: boolean;
  availabilityText: string;
  heroBadge: string;
  busyBadge: string;
  primaryEngine: string;
  heroChip3: { title: string; subtitle: string };
  aboutExternal: { label: string; url: string };
  languages: string[];
  socials: SocialLink[];
  stats: Stat[];
  updatedAt: string;
}

export interface GameLink {
  kind: LinkKind;
  url: string;
  label: string;
}

export interface GameDTO {
  id: string;
  title: string;
  slug: string;
  previousSlugs: string[];
  status: GameStatus;
  published: boolean;
  featured: boolean;
  order: number;
  genre: string;
  platforms: string[];
  engine: string;
  releaseYear: number | null;
  shortDescription: string;
  description: string;
  tags: string[];
  cover: MediaRef;
  coverStyle: CoverStyle;
  gallery: NonNullable<MediaRef>[];
  trailerUrl: string;
  links: GameLink[];
  updatedAt: string;
}

export interface SkillCategoryDTO {
  id: string;
  name: string;
  order: number;
}

export interface SkillDTO {
  id: string;
  name: string;
  level: number;
  categoryId: string;
  order: number;
}

export interface SkillGroup extends SkillCategoryDTO {
  skills: SkillDTO[];
}

export interface YearMonth {
  month: number | null;
  year: number;
}

export interface ExperienceDTO {
  id: string;
  type: ExperienceType;
  role: string;
  organization: string;
  location: string;
  url: string;
  start: YearMonth | null;
  end: YearMonth | null;
  current: boolean;
  periodOverride: string;
  description: string;
  order: number;
}

export interface ServiceDTO {
  id: string;
  title: string;
  icon: ServiceIcon;
  description: string;
  order: number;
}

export interface TestimonialDTO {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: MediaRef;
  url: string;
  published: boolean;
  order: number;
}

export interface MessageDTO {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  body: string;
  status: "new" | "read" | "archived";
  emailDelivered: boolean;
  emailError: string;
  createdAt: string;
}

export interface MediaDTO {
  id: string;
  fileId: string;
  filePath: string;
  folder: string;
  name: string;
  url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  alt: string;
  kind: "image" | "pdf";
  purpose: string;
  createdAt: string;
}
