export const SECTION_KEYS = ["hero", "about", "games", "skills", "experience", "services", "testimonials", "contact"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SOCIAL_PLATFORMS = ["itch", "github", "linkedin", "x", "youtube", "discord", "instagram", "playstore", "appstore", "coursera", "website", "other"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  itch: "itch.io",
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X / Twitter",
  youtube: "YouTube",
  discord: "Discord",
  instagram: "Instagram",
  playstore: "Google Play",
  appstore: "App Store",
  coursera: "Coursera",
  website: "Website",
  other: "Link",
};

export const GAME_STATUSES = ["released", "in-development", "prototype"] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];
export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  released: "Released",
  "in-development": "In development",
  prototype: "Prototype",
};

export const COVER_STYLES = ["space", "battle", "jet", "arcade"] as const;
export type CoverStyle = (typeof COVER_STYLES)[number];

export const LINK_KINDS = ["itch", "playstore", "appstore", "web", "steam", "github", "other"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];
export const LINK_LABELS: Record<LinkKind, string> = {
  itch: "Play on itch.io",
  playstore: "Get it on Google Play",
  appstore: "Download on the App Store",
  web: "Play in browser",
  steam: "View on Steam",
  github: "Source on GitHub",
  other: "Open link",
};

export const EXPERIENCE_TYPES = ["job", "freelance", "education", "jam", "achievement", "project"] as const;
export type ExperienceType = (typeof EXPERIENCE_TYPES)[number];
export const EXPERIENCE_LABELS: Record<ExperienceType, string> = {
  job: "Job",
  freelance: "Freelance",
  education: "Education",
  jam: "Game Jam",
  achievement: "Achievement",
  project: "Project",
};

export const PLATFORM_OPTIONS = ["Android", "iOS", "Web", "Windows", "macOS", "Linux"];
export const ENGINE_OPTIONS = ["Unity", "Godot", "Unreal", "GameMaker", "Defold", "Custom"];

/** Curated lucide icons for Services (Admin §8). Names are kebab-case lucide ids. */
export const SERVICE_ICONS = [
  "gamepad-2", "joystick", "smartphone", "tablet", "monitor", "code", "code-xml", "box", "boxes", "sparkles",
  "rocket", "palette", "brush", "layers", "cpu", "trophy", "wand-sparkles", "zap", "globe", "bug",
  "rotate-cw", "store", "megaphone", "puzzle", "swords", "target", "users", "cloud", "wifi", "shield",
  "trending-up", "chart-bar", "pen-tool", "image", "film", "music", "headphones", "lightbulb", "settings", "wrench",
] as const;
export type ServiceIcon = (typeof SERVICE_ICONS)[number];

export const MAX_GALLERY = 12;
export const MAX_STATS = 6;
export const MAX_SERVICES = 12;
export const MAX_TAGS = 8;
