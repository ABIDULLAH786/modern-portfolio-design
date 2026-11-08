import "server-only";
import type { CopyInput, DisplayInput } from "@/lib/validation/settings";
import type { CustomThemeDTO, ThemeSettings } from "@/lib/theme/types";
import type {
  ExperienceDTO,
  GameDTO,
  MediaDTO,
  MediaRef,
  MessageDTO,
  ProfileDTO,
  ServiceDTO,
  SettingsDTO,
  SkillCategoryDTO,
  SkillDTO,
  TestimonialDTO,
} from "@/lib/types";

/* Mongoose lean() documents are loosely typed. These mappers normalise them into DTOs. */
type Raw = Record<string, unknown>;

const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : v == null ? d : String(v));
const num = (v: unknown, d = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const bool = (v: unknown, d = false): boolean => (typeof v === "boolean" ? v : d);
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const obj = (v: unknown): Raw => (v && typeof v === "object" ? (v as Raw) : {});
const iso = (v: unknown): string => (v instanceof Date ? v.toISOString() : typeof v === "string" ? v : new Date(0).toISOString());
const id = (v: Raw): string => str(v._id);

export function toMediaRef(v: unknown): MediaRef {
  if (!v || typeof v !== "object") return null;
  const m = v as Raw;
  if (!m.mediaId || !m.url) return null;
  return {
    mediaId: str(m.mediaId),
    url: str(m.url),
    width: num(m.width),
    height: num(m.height),
    alt: str(m.alt),
    ...(m.blurDataUrl ? { blurDataUrl: str(m.blurDataUrl) } : {}),
  };
}

export function toTheme(v: unknown): ThemeSettings {
  const t = obj(v);
  const src = (s: unknown, fallback: string) => {
    const o = obj(s);
    return { kind: (o.kind === "custom" ? "custom" : "preset") as "preset" | "custom", id: str(o.id, fallback) };
  };
  const vt = obj(t.visitorToggle);
  const overrides = Object.fromEntries(Object.entries(obj(t.overrides)).filter(([, val]) => typeof val === "string"));
  return {
    source: src(t.source, "neon"),
    overrides: overrides as ThemeSettings["overrides"],
    fontPair: (["sora", "grotesk", "arcade", "outfit"].includes(str(t.fontPair)) ? str(t.fontPair) : "sora") as ThemeSettings["fontPair"],
    radius: num(t.radius, 18),
    effect: (["starfield", "grid", "none"].includes(str(t.effect)) ? str(t.effect) : "starfield") as ThemeSettings["effect"],
    animations: bool(t.animations, true),
    visitorToggle: { enabled: bool(vt.enabled), darkSource: src(vt.darkSource, "neon"), lightSource: src(vt.lightSource, "light") },
  };
}

export function toSettingsDTO(doc: Raw): SettingsDTO {
  const seo = obj(doc.seo);
  return {
    theme: toTheme(doc.theme),
    themeDraft: doc.themeDraft ? toTheme(doc.themeDraft) : null,
    sections: arr<Raw>(doc.sections)
      .map((s) => ({ key: str(s.key) as SettingsDTO["sections"][number]["key"], label: str(s.label), visible: bool(s.visible, true), order: num(s.order) }))
      .sort((a, b) => a.order - b.order),
    copy: JSON.parse(JSON.stringify(doc.copy ?? {})) as CopyInput,
    display: { gamesOnHome: 6, featuredFirst: false, showSkillPercent: true, experienceSort: "manual", ...obj(doc.display) } as DisplayInput,
    seo: {
      siteTitle: str(seo.siteTitle),
      description: str(seo.description),
      keywords: arr<string>(seo.keywords),
      ogImage: toMediaRef(seo.ogImage),
      favicon: toMediaRef(seo.favicon),
      googleVerification: str(seo.googleVerification),
      analyticsEnabled: bool(seo.analyticsEnabled),
    },
    seedHashes: obj(doc.seedHashes) as Record<string, string>,
    updatedAt: iso(doc.updatedAt),
  };
}

export function toProfileDTO(doc: Raw): ProfileDTO {
  const cv = doc.cv ? obj(doc.cv) : null;
  return {
    name: str(doc.name),
    role: str(doc.role),
    tagline: str(doc.tagline),
    bio: str(doc.bio),
    avatar: toMediaRef(doc.avatar),
    cv: cv && cv.url ? { mediaId: str(cv.mediaId), fileId: str(cv.fileId), url: str(cv.url), fileName: str(cv.fileName, "resume.pdf"), uploadedAt: cv.uploadedAt ? iso(cv.uploadedAt) : null } : null,
    location: str(doc.location),
    email: str(doc.email),
    phone: str(doc.phone),
    available: bool(doc.available, true),
    availabilityText: str(doc.availabilityText),
    heroBadge: str(doc.heroBadge),
    busyBadge: str(doc.busyBadge),
    primaryEngine: str(doc.primaryEngine),
    heroChip3: { title: str(obj(doc.heroChip3).title), subtitle: str(obj(doc.heroChip3).subtitle) },
    aboutExternal: { label: str(obj(doc.aboutExternal).label), url: str(obj(doc.aboutExternal).url) },
    languages: arr<string>(doc.languages),
    socials: arr<Raw>(doc.socials).map((s) => ({ id: str(s.id), platform: str(s.platform, "other") as ProfileDTO["socials"][number]["platform"], label: str(s.label), url: str(s.url) })),
    stats: arr<Raw>(doc.stats).map((s) => ({ id: str(s.id), value: str(s.value), label: str(s.label) })),
    updatedAt: iso(doc.updatedAt),
  };
}

export function toGameDTO(doc: Raw): GameDTO {
  return {
    id: id(doc),
    title: str(doc.title),
    slug: str(doc.slug),
    previousSlugs: arr<string>(doc.previousSlugs),
    status: str(doc.status, "released") as GameDTO["status"],
    published: bool(doc.published),
    featured: bool(doc.featured),
    order: num(doc.order),
    genre: str(doc.genre),
    platforms: arr<string>(doc.platforms),
    engine: str(doc.engine),
    releaseYear: typeof doc.releaseYear === "number" ? doc.releaseYear : null,
    shortDescription: str(doc.shortDescription),
    description: str(doc.description),
    tags: arr<string>(doc.tags),
    cover: toMediaRef(doc.cover),
    coverStyle: str(doc.coverStyle, "arcade") as GameDTO["coverStyle"],
    gallery: arr<unknown>(doc.gallery).map(toMediaRef).filter((m): m is NonNullable<MediaRef> => m !== null),
    trailerUrl: str(doc.trailerUrl),
    links: arr<Raw>(doc.links).map((l) => ({ kind: str(l.kind, "other") as GameDTO["links"][number]["kind"], url: str(l.url), label: str(l.label) })),
    updatedAt: iso(doc.updatedAt),
  };
}

export const toSkillCategoryDTO = (d: Raw): SkillCategoryDTO => ({ id: id(d), name: str(d.name), order: num(d.order) });
export const toSkillDTO = (d: Raw): SkillDTO => ({ id: id(d), name: str(d.name), level: num(d.level), categoryId: str(d.categoryId), order: num(d.order) });

const ym = (v: unknown) => {
  if (!v) return null;
  const o = obj(v);
  if (typeof o.year !== "number") return null;
  return { month: typeof o.month === "number" ? o.month : null, year: o.year };
};

export const toExperienceDTO = (d: Raw): ExperienceDTO => ({
  id: id(d),
  type: str(d.type, "job") as ExperienceDTO["type"],
  role: str(d.role),
  organization: str(d.organization),
  location: str(d.location),
  url: str(d.url),
  start: ym(d.start),
  end: ym(d.end),
  current: bool(d.current),
  periodOverride: str(d.periodOverride),
  description: str(d.description),
  order: num(d.order),
});

export const toServiceDTO = (d: Raw): ServiceDTO => ({ id: id(d), title: str(d.title), icon: str(d.icon, "sparkles") as ServiceDTO["icon"], description: str(d.description), order: num(d.order) });

export const toTestimonialDTO = (d: Raw): TestimonialDTO => ({
  id: id(d),
  name: str(d.name),
  role: str(d.role),
  company: str(d.company),
  quote: str(d.quote),
  avatar: toMediaRef(d.avatar),
  url: str(d.url),
  published: bool(d.published, true),
  order: num(d.order),
});

export const toMessageDTO = (d: Raw): MessageDTO => ({
  id: id(d),
  name: str(d.name),
  email: str(d.email),
  projectType: str(d.projectType),
  budget: str(d.budget),
  body: str(d.body),
  status: str(d.status, "new") as MessageDTO["status"],
  emailDelivered: bool(d.emailDelivered),
  emailError: str(d.emailError),
  createdAt: iso(d.createdAt),
});

export const toMediaDTO = (d: Raw): MediaDTO => ({
  id: id(d),
  fileId: str(d.fileId),
  filePath: str(d.filePath),
  folder: str(d.folder),
  name: str(d.name),
  url: str(d.url),
  format: str(d.format),
  bytes: num(d.bytes),
  width: num(d.width),
  height: num(d.height),
  alt: str(d.alt),
  kind: str(d.kind, "image") === "pdf" ? "pdf" : "image",
  purpose: str(d.purpose, "library"),
  createdAt: iso(d.createdAt),
});

export const toCustomThemeDTO = (d: Raw): CustomThemeDTO => ({
  id: id(d),
  name: str(d.name),
  mode: str(d.mode) === "light" ? "light" : "dark",
  bg: str(d.bg),
  surface: str(d.surface),
  text: str(d.text),
  primary: str(d.primary),
  accent: str(d.accent),
});
