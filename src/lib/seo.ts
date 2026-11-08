import { GAME_STATUS_LABELS } from "./constants";
import type { GameDTO, ProfileDTO, SettingsDTO } from "./types";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function personJsonLd(profile: ProfileDTO, settings: SettingsDTO): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: settings.seo.description,
    url: siteUrl,
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    ...(profile.avatar ? { image: profile.avatar.url } : {}),
    ...(profile.location ? { address: { "@type": "PostalAddress", addressLocality: profile.location } } : {}),
    sameAs: profile.socials.map((s) => s.url).filter((u) => /^https?:\/\//.test(u)),
  };
}

export function gameJsonLd(game: GameDTO, profile: ProfileDTO): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.shortDescription,
    url: `${siteUrl}/games/${game.slug}`,
    genre: game.genre,
    gamePlatform: game.platforms,
    applicationCategory: "Game",
    operatingSystem: game.platforms.join(", ") || undefined,
    keywords: game.tags.join(", ") || undefined,
    ...(game.cover ? { image: game.cover.url } : { image: `${siteUrl}/og?slug=${game.slug}` }),
    ...(game.releaseYear ? { datePublished: String(game.releaseYear) } : {}),
    creativeWorkStatus: GAME_STATUS_LABELS[game.status],
    author: { "@type": "Person", name: profile.name, url: siteUrl },
    ...(game.trailerUrl ? { trailer: { "@type": "VideoObject", name: `${game.title} trailer`, embedUrl: game.trailerUrl, thumbnailUrl: game.cover?.url, uploadDate: game.updatedAt } } : {}),
    ...(game.links.length ? { sameAs: game.links.map((l) => l.url) } : {}),
  };
}
