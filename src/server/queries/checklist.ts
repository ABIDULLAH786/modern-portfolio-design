import "server-only";
import { seedHash } from "@/server/services/seed";
import { adminGames, adminProfile, adminSettings } from "./admin";

export interface ChecklistItem {
  label: string;
  href: string;
}

/** Fields that still hold seed/placeholder values or are missing (Admin §2). */
export async function setupChecklist(passwordChangedAt: string | null): Promise<ChecklistItem[]> {
  const [settings, profile, games] = await Promise.all([adminSettings(), adminProfile(), adminGames()]);
  const items: ChecklistItem[] = [];
  const h = settings.seedHashes;
  if (!profile.email || /example\.com$/i.test(profile.email) || (h["profile:email"] && seedHash(profile.email) === h["profile:email"])) {
    items.push({ label: "Set your real public email address", href: "/admin/profile?tab=contact" });
  }
  if (!profile.avatar) items.push({ label: "Upload a profile photo", href: "/admin/profile" });
  if (!profile.cv) items.push({ label: "Upload your resume (PDF)", href: "/admin/profile" });
  for (const g of games) {
    if (!g.published) continue;
    const todo: string[] = [];
    if (h[`game:${g.slug}:description`] && seedHash(g.description) === h[`game:${g.slug}:description`]) todo.push("real description");
    if (!g.cover) todo.push("cover image");
    if (!g.gallery.length) todo.push("screenshots");
    if (todo.length) items.push({ label: `${g.title}: add ${todo.join(", ").replace(/, ([^,]*)$/, " and $1")}`, href: `/admin/games/${g.id}` });
  }
  for (const s of profile.socials) {
    if (/^https?:\/\/(www\.)?(github\.com|linkedin\.com)\/?$/i.test(s.url)) items.push({ label: `Finish your ${s.label} link (it points to the bare website)`, href: "/admin/profile?tab=social" });
  }
  if (!settings.seo.ogImage) items.push({ label: "Add a social share image (optional, a generated one is used meanwhile)", href: "/admin/seo" });
  if (!passwordChangedAt) items.push({ label: "Change the admin password from the one used at setup", href: "/admin/account" });
  return items;
}
