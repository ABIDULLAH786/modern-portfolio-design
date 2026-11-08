import "server-only";
import { Game, Profile, Settings, Testimonial } from "@/server/models";

/** Where a media item is referenced (Admin §12 "Used in"). */
export async function findUsage(mediaId: string): Promise<string[]> {
  const used: string[] = [];
  const has = (v: unknown) => JSON.stringify(v ?? null).includes(`"${mediaId}"`);
  const [settings, profile, games, testimonials] = await Promise.all([
    Settings.findById("site").select("seo").lean(),
    Profile.findById("profile").select("avatar cv").lean(),
    Game.find().select("title cover gallery").lean(),
    Testimonial.find().select("name avatar").lean(),
  ]);
  if (has(settings?.seo?.ogImage)) used.push("SEO · social share image");
  if (has(settings?.seo?.favicon)) used.push("SEO · favicon");
  if (has(profile?.avatar)) used.push("Profile photo");
  if (has(profile?.cv)) used.push("Profile · resume");
  for (const g of games) {
    if (has(g.cover)) used.push(`Game cover · ${g.title}`);
    if (has(g.gallery)) used.push(`Game screenshots · ${g.title}`);
  }
  for (const t of testimonials) if (has(t.avatar)) used.push(`Testimonial · ${t.name}`);
  return used;
}

