/** Upload kinds: each maps to its own ImageKit sub-folder (shared by client + server). */
export const MEDIA_KINDS = ["avatar", "resume", "game-cover", "game-gallery", "testimonial", "seo", "library"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const PDF_MAX_BYTES = 5 * 1024 * 1024;

export function kindRules(kind: MediaKind): { accept: string[]; maxBytes: number; label: string } {
  if (kind === "resume") return { accept: ["application/pdf"], maxBytes: PDF_MAX_BYTES, label: "PDF up to 5 MB" };
  return { accept: IMAGE_TYPES, maxBytes: IMAGE_MAX_BYTES, label: "JPG, PNG, WebP, GIF or AVIF up to 8 MB" };
}

/** Sanitises a sub-folder scope such as a game slug. */
export function cleanScope(scope: string | undefined | null): string {
  const s = (scope ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return s || "unsorted";
}

/**
 * Folder layout inside the ImageKit root folder:
 *   /profile               avatar photo
 *   /resume                the single current resume PDF
 *   /games/<slug>/cover    game cover images
 *   /games/<slug>/screenshots
 *   /testimonials          testimonial avatars
 *   /seo                   social share image + favicon
 *   /library               anything uploaded from the Media page
 */
export function folderFor(root: string, kind: MediaKind, scope?: string | null): string {
  const r = `/${root.replace(/^\/+|\/+$/g, "")}`;
  switch (kind) {
    case "avatar":
      return `${r}/profile`;
    case "resume":
      return `${r}/resume`;
    case "game-cover":
      return `${r}/games/${cleanScope(scope)}/cover`;
    case "game-gallery":
      return `${r}/games/${cleanScope(scope)}/screenshots`;
    case "testimonial":
      return `${r}/testimonials`;
    case "seo":
      return `${r}/seo`;
    default:
      return `${r}/library`;
  }
}
