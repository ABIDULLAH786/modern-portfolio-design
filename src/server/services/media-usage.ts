import "server-only";
import type { MediaUsage } from "@/lib/types";
import { Game, Profile, Settings, Testimonial } from "@/server/models";

/** Where a media item is referenced (Admin §12 "Used in"), with a link to the editor for each place. */
export async function findUsage(mediaId: string): Promise<MediaUsage[]> {
  const used: MediaUsage[] = [];
  const has = (v: unknown) => JSON.stringify(v ?? null).includes(`"${mediaId}"`);
  const [settings, profile, games, testimonials] = await Promise.all([
    Settings.findById("site").select("seo").lean(),
    Profile.findById("profile").select("avatar cv").lean(),
    Game.find().select("title cover gallery").lean(),
    Testimonial.find().select("name avatar").lean(),
  ]);
  if (has(settings?.seo?.ogImage)) used.push({ label: "SEO · social share image", href: "/admin/seo" });
  if (has(settings?.seo?.favicon)) used.push({ label: "SEO · favicon", href: "/admin/seo" });
  if (has(profile?.avatar)) used.push({ label: "Profile photo", href: "/admin/profile" });
  if (has(profile?.cv)) used.push({ label: "Profile · resume", href: "/admin/profile" });
  for (const g of games) {
    const href = `/admin/games/${String(g._id)}`;
    if (has(g.cover)) used.push({ label: `Game cover · ${g.title}`, href });
    if (has(g.gallery)) used.push({ label: `Game screenshots · ${g.title}`, href });
  }
  for (const t of testimonials) if (has(t.avatar)) used.push({ label: `Testimonial · ${t.name}`, href: "/admin/testimonials" });
  return used;
}
