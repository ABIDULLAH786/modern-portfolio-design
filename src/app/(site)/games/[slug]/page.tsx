import { ArrowLeft, Download, Gamepad2, Globe, Link2, Smartphone, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { GameCard } from "@/components/site/game-card";
import { GameCover } from "@/components/site/game-cover";
import { Gallery } from "@/components/site/gallery";
import { JsonLd } from "@/components/site/json-ld";
import { Markdown } from "@/components/site/markdown";
import { PlayLink } from "@/components/site/play-link";
import { YouTubeLite } from "@/components/site/youtube-lite";
import { GAME_STATUS_LABELS, LINK_LABELS, type LinkKind } from "@/lib/constants";
import { gameJsonLd } from "@/lib/seo";
import { safeHttpUrl, youtubeId } from "@/lib/utils/text";
import { getGameBySlug, getProfile, getPublishedGames, getSettings } from "@/server/queries/public";

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return (await getPublishedGames()).map((g) => ({ slug: g.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const res = await getGameBySlug(slug);
  if (res.kind !== "game") return { title: "Game not found" };
  const g = res.game;
  return {
    title: g.title,
    description: g.shortDescription,
    alternates: { canonical: `/games/${g.slug}` },
    openGraph: {
      type: "article",
      title: g.title,
      description: g.shortDescription,
      url: `/games/${g.slug}`,
      images: g.cover ? [{ url: g.cover.url, alt: g.cover.alt || g.title }] : [{ url: `/og?slug=${g.slug}`, width: 1200, height: 630, alt: g.title }],
    },
  };
}

const LINK_ICONS: Record<LinkKind, React.ComponentType<{ "aria-hidden"?: boolean }>> = {
  itch: Gamepad2,
  playstore: Smartphone,
  appstore: Download,
  web: Globe,
  steam: Store,
  github: Link2,
  other: Link2,
};

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const { slug } = await params;
  const res = await getGameBySlug(slug);
  if (res.kind === "redirect") permanentRedirect(`/games/${res.slug}`);
  if (res.kind === "missing") notFound();
  const game = res.game;
  const [all, profile, settings] = await Promise.all([getPublishedGames(), getProfile(), getSettings()]);
  const more = all.filter((g) => g.id !== game.id).slice(0, 3);
  const yt = youtubeId(game.trailerUrl);
  const links = game.links.filter((l) => safeHttpUrl(l.url));
  const specs = [
    ["Genre", game.genre],
    ["Platforms", game.platforms.join(", ")],
    ["Engine", game.engine],
    ["Release year", game.releaseYear ? String(game.releaseYear) : ""],
    ["Status", GAME_STATUS_LABELS[game.status]],
  ].filter(([, v]) => v);

  return (
    <>
      <JsonLd data={gameJsonLd(game, profile)} />
      <section className="section game-hero" aria-labelledby="game-title">
        <div className="container">
          <Link href="/#games" className="crumbs">
            <ArrowLeft size={16} aria-hidden="true" /> All games
          </Link>
          <div className="card game-banner rise">
            <div className="cover">
              <GameCover game={game} sizes="(max-width: 1240px) 100vw, 1200px" priority />
              {game.genre ? <span className="badge">{game.genre}</span> : null}
              {game.featured ? <span className="badge feat">★ Featured</span> : null}
            </div>
          </div>
          <div className="game-layout">
            <article className="card game-main reveal">
              <span className="eyebrow">{game.genre || "Game"}</span>
              <h1 id="game-title">{game.title}</h1>
              {game.tags.length ? (
                <ul className="tags" aria-label="Tags">
                  {game.tags.map((t) => (
                    <li className="tag" key={t}>
                      #{t}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="lead">{game.shortDescription}</p>
              {game.description ? <Markdown headingLevel={2}>{game.description}</Markdown> : null}
              {yt ? (
                <>
                  <h2 className="block-title">Trailer</h2>
                  <YouTubeLite id={yt} title={`${game.title} trailer`} />
                </>
              ) : null}
              {game.gallery.length ? (
                <>
                  <h2 className="block-title">Screenshots</h2>
                  <Gallery images={game.gallery} title={game.title} />
                </>
              ) : null}
            </article>
            <aside className="card game-side reveal" aria-label="Game details">
              <dl className="specs" style={{ margin: 0 }}>
                {specs.map(([k, v]) => (
                  <div className="meta" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {links.length ? (
                <div className="store-btns">
                  {links.map((l, i) => {
                    const Icon = LINK_ICONS[l.kind] ?? Link2;
                    return (
                      <PlayLink key={i} href={l.url} slug={game.slug} store={l.kind} track={settings.seo.analyticsEnabled} className={`btn ${i === 0 ? "btn-primary" : "btn-ghost"}`}>
                        <Icon aria-hidden /> {l.label || LINK_LABELS[l.kind]}
                      </PlayLink>
                    );
                  })}
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
      {more.length ? (
        <section className="section" aria-labelledby="more-title" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head reveal" style={{ marginBottom: 32 }}>
              <span className="eyebrow">Keep playing</span>
              <h2 id="more-title">
                More <span className="grad-text">games</span>
              </h2>
            </div>
            <ul className="proj-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {more.map((g) => (
                <li key={g.id} className="reveal">
                  <GameCard game={g} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
