import mongoose, { Schema, type Model } from "mongoose";
import { makeSchema, mediaRefSchema, themeSchemaDef } from "./shared";

function getModel<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] ?? mongoose.model(name, schema)) as unknown as Model<T>;
}

/* ───────── hand-written document shapes ───────── */
type Ref = { mediaId: string; url: string; width: number; height: number; alt: string; blurDataUrl?: string } | null;
type Src = { kind: string; id: string };
interface ThemeShape {
  source: Src;
  overrides: Record<string, string>;
  fontPair: string;
  radius: number;
  effect: string;
  animations: boolean;
  visitorToggle: { enabled: boolean; darkSource?: Src; lightSource?: Src };
}
interface Timestamps {
  createdAt?: Date;
  updatedAt?: Date;
}
type Head = { eyebrow: string; title: string; subtitle: string };
export interface SettingsDoc extends Timestamps {
  _id: string;
  theme: ThemeShape;
  themeDraft: ThemeShape | null;
  sections: Array<{ key: string; label: string; visible: boolean; order: number }>;
  copy: Record<string, Head> & {
    contact: Head & { successMessage: string; projectTypes: string[]; budgetEnabled: boolean; budgetOptions: string[]; autoReply: { enabled: boolean; subject: string; body: string } };
  };
  display: { gamesOnHome: number; featuredFirst: boolean; showSkillPercent: boolean; experienceSort: string };
  seo: { siteTitle: string; description: string; keywords: string[]; ogImage: Ref; favicon: Ref; googleVerification: string; analyticsEnabled: boolean };
  seedHashes: Record<string, string>;
}
export interface ProfileDoc extends Timestamps {
  _id: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  avatar: Ref;
  cv: { mediaId: string; url: string; fileName: string; fileId: string; uploadedAt: Date | null } | null;
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
  socials: Array<{ id: string; platform: string; label: string; url: string }>;
  stats: Array<{ id: string; value: string; label: string }>;
}
export interface GameDoc extends Timestamps {
  title: string;
  slug: string;
  previousSlugs: string[];
  status: string;
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
  cover: Ref;
  coverStyle: string;
  gallery: Array<NonNullable<Ref>>;
  trailerUrl: string;
  links: Array<{ kind: string; url: string; label: string }>;
}
export interface SkillCategoryDoc extends Timestamps {
  name: string;
  order: number;
}
export interface SkillDoc extends Timestamps {
  name: string;
  level: number;
  categoryId: mongoose.Types.ObjectId | string;
  order: number;
}
type YM = { month: number | null; year: number } | null;
export interface ExperienceDoc extends Timestamps {
  type: string;
  role: string;
  organization: string;
  location: string;
  url: string;
  start: YM;
  end: YM;
  current: boolean;
  periodOverride: string;
  description: string;
  order: number;
}
export interface ServiceDoc extends Timestamps {
  title: string;
  icon: string;
  description: string;
  order: number;
}
export interface TestimonialDoc extends Timestamps {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: Ref;
  url: string;
  published: boolean;
  order: number;
}
export interface MessageDoc extends Timestamps {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  body: string;
  status: string;
  emailDelivered: boolean;
  emailError: string;
  ipHash: string;
  userAgent: string;
}
export interface MediaDoc extends Timestamps {
  provider: string;
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
  kind: string;
  purpose: string;
}
export interface CustomThemeDoc extends Timestamps {
  name: string;
  mode: string;
  bg: string;
  surface: string;
  text: string;
  primary: string;
  accent: string;
}
export interface UserDoc extends Timestamps {
  email: string;
  passwordHash: string;
  name: string;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  sessionVersion: number;
  failedLogins: { count: number; lockedUntil: Date | null };
}
export interface RateLimitDoc {
  key: string;
  count: number;
  expiresAt: Date;
}
export interface PlayClickDoc {
  slug: string;
  store: string;
  at: Date;
}

/* ───────── settings (singleton _id: "site") ───────── */
const headSchema = { eyebrow: { type: String, default: "" }, title: { type: String, default: "" }, subtitle: { type: String, default: "" } };
const settingsSchema = makeSchema(
  {
    _id: { type: String, default: "site" },
    theme: { type: makeSchema(themeSchemaDef, { _id: false }), required: true },
    themeDraft: { type: makeSchema(themeSchemaDef, { _id: false }), default: null },
    sections: [{ _id: false, key: String, label: String, visible: Boolean, order: Number }],
    copy: {
      about: headSchema,
      games: headSchema,
      skills: headSchema,
      experience: headSchema,
      services: headSchema,
      testimonials: headSchema,
      contact: {
        ...headSchema,
        successMessage: String,
        projectTypes: [String],
        budgetEnabled: Boolean,
        budgetOptions: [String],
        autoReply: { enabled: Boolean, subject: String, body: String },
      },
    },
    display: { gamesOnHome: Number, featuredFirst: Boolean, showSkillPercent: Boolean, experienceSort: String },
    seo: {
      siteTitle: String,
      description: String,
      keywords: [String],
      ogImage: { type: mediaRefSchema, default: null },
      favicon: { type: mediaRefSchema, default: null },
      googleVerification: { type: String, default: "" },
      analyticsEnabled: { type: Boolean, default: false },
    },
    seedHashes: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);
export const Settings = getModel<SettingsDoc>("Settings", settingsSchema);

/* ───────── profile (singleton _id: "profile") ───────── */
const profileSchema = makeSchema(
  {
    _id: { type: String, default: "profile" },
    name: String,
    role: String,
    tagline: String,
    bio: String,
    avatar: { type: mediaRefSchema, default: null },
    cv: { type: makeSchema({ mediaId: String, url: String, fileName: String, fileId: String, uploadedAt: Date }, { _id: false }), default: null },
    location: String,
    email: String,
    phone: { type: String, default: "" },
    available: Boolean,
    availabilityText: String,
    heroBadge: String,
    busyBadge: String,
    primaryEngine: String,
    heroChip3: { title: String, subtitle: String },
    aboutExternal: { label: String, url: String },
    languages: [String],
    socials: [{ _id: false, id: String, platform: String, label: String, url: String }],
    stats: [{ _id: false, id: String, value: String, label: String }],
  },
  { timestamps: true, minimize: false },
);
export const Profile = getModel<ProfileDoc>("Profile", profileSchema);

/* ───────── games ───────── */
const gameSchema = makeSchema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    previousSlugs: { type: [String], default: [] },
    status: { type: String, default: "released" },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    genre: String,
    platforms: [String],
    engine: String,
    releaseYear: { type: Number, default: null },
    shortDescription: String,
    description: String,
    tags: [String],
    cover: { type: mediaRefSchema, default: null },
    coverStyle: { type: String, default: "arcade" },
    gallery: { type: [mediaRefSchema], default: [] },
    trailerUrl: { type: String, default: "" },
    links: [{ _id: false, kind: String, url: String, label: String }],
  },
  { timestamps: true },
);
gameSchema.index({ published: 1, order: 1 });
gameSchema.index({ previousSlugs: 1 });
export const Game = getModel<GameDoc>("Game", gameSchema);

/* ───────── skills ───────── */
const skillCategorySchema = makeSchema({ name: String, order: { type: Number, default: 0 } }, { timestamps: true });
export const SkillCategory = getModel<SkillCategoryDoc>("SkillCategory", skillCategorySchema);

const skillSchema = makeSchema(
  { name: String, level: Number, categoryId: { type: Schema.Types.ObjectId, ref: "SkillCategory", index: true }, order: { type: Number, default: 0 } },
  { timestamps: true },
);
export const Skill = getModel<SkillDoc>("Skill", skillSchema);

/* ───────── experiences ───────── */
const ym = makeSchema({ month: { type: Number, default: null }, year: Number }, { _id: false });
const experienceSchema = makeSchema(
  {
    type: String,
    role: String,
    organization: String,
    location: { type: String, default: "" },
    url: { type: String, default: "" },
    start: { type: ym, default: null },
    end: { type: ym, default: null },
    current: { type: Boolean, default: false },
    periodOverride: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const Experience = getModel<ExperienceDoc>("Experience", experienceSchema);

/* ───────── services ───────── */
const serviceSchema = makeSchema({ title: String, icon: String, description: String, order: { type: Number, default: 0 } }, { timestamps: true });
export const Service = getModel<ServiceDoc>("Service", serviceSchema);

/* ───────── testimonials ───────── */
const testimonialSchema = makeSchema(
  {
    name: String,
    role: { type: String, default: "" },
    company: { type: String, default: "" },
    quote: String,
    avatar: { type: mediaRefSchema, default: null },
    url: { type: String, default: "" },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const Testimonial = getModel<TestimonialDoc>("Testimonial", testimonialSchema);

/* ───────── messages ───────── */
const messageSchema = makeSchema(
  {
    name: String,
    email: String,
    projectType: { type: String, default: "" },
    budget: { type: String, default: "" },
    body: String,
    status: { type: String, enum: ["new", "read", "archived"], default: "new" },
    emailDelivered: { type: Boolean, default: false },
    emailError: { type: String, default: "" },
    ipHash: String,
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);
messageSchema.index({ status: 1, createdAt: -1 });
export const Message = getModel<MessageDoc>("Message", messageSchema);

/* ───────── media (ImageKit) ───────── */
const mediaSchema = makeSchema(
  {
    provider: { type: String, default: "imagekit" },
    fileId: { type: String, required: true, unique: true },
    filePath: String,
    folder: String,
    name: String,
    url: String,
    format: String,
    bytes: Number,
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: "" },
    kind: { type: String, enum: ["image", "pdf"], default: "image" },
    purpose: { type: String, default: "library" },
  },
  { timestamps: true },
);
export const Media = getModel<MediaDoc>("Media", mediaSchema);

/* ───────── custom themes ───────── */
const customThemeSchema = makeSchema(
  { name: String, mode: String, bg: String, surface: String, text: String, primary: String, accent: String },
  { timestamps: true },
);
export const CustomTheme = getModel<CustomThemeDoc>("CustomTheme", customThemeSchema);

/* ───────── users ───────── */
const userSchema = makeSchema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Admin" },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    sessionVersion: { type: Number, default: 1 },
    failedLogins: { count: { type: Number, default: 0 }, lockedUntil: { type: Date, default: null } },
  },
  { timestamps: true },
);
export const User = getModel<UserDoc>("User", userSchema);

/* ───────── rate limits (TTL) ───────── */
const rateLimitSchema = makeSchema({ key: { type: String, unique: true }, count: Number, expiresAt: Date });
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = getModel<RateLimitDoc>("RateLimit", rateLimitSchema);

/* ───────── play clicks (self-hosted analytics) ───────── */
const playClickSchema = makeSchema({ slug: String, store: String, at: { type: Date, default: Date.now } });
playClickSchema.index({ at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
playClickSchema.index({ slug: 1, at: -1 });
export const PlayClick = getModel<PlayClickDoc>("PlayClick", playClickSchema);
