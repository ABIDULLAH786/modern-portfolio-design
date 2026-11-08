import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { getPublishedGames, getSettings } from "@/server/queries/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, settings] = await Promise.all([getPublishedGames(), getSettings()]);
  return [
    { url: `${siteUrl}/`, lastModified: settings.updatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/games`, changeFrequency: "weekly", priority: 0.7 },
    ...games.map((g) => ({ url: `${siteUrl}/games/${g.slug}`, lastModified: g.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
