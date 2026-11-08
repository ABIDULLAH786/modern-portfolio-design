import "server-only";
import { revalidateTag } from "next/cache";

export const TAGS = {
  settings: "settings",
  profile: "profile",
  games: "games",
  game: (slug: string) => `game:${slug}`,
  skills: "skills",
  experience: "experience",
  services: "services",
  testimonials: "testimonials",
  themes: "custom-themes",
} as const;

export const ALL_TAGS = [TAGS.settings, TAGS.profile, TAGS.games, TAGS.skills, TAGS.experience, TAGS.services, TAGS.testimonials, TAGS.themes];

/** Expire tags immediately so the next visitor sees the change (no stale window). */
export function expire(...tags: string[]): void {
  for (const t of tags) {
    try {
      revalidateTag(t, { expire: 0 });
    } catch (e) {
      // Outside a request (e.g. the seed CLI) there is no cache to revalidate.
      if (!(e instanceof Error && /static generation store|outside a request|Invariant/i.test(e.message))) throw e;
    }
  }
}
