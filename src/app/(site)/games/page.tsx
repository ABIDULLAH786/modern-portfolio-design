import type { Metadata } from "next";
import { GameGrid } from "@/components/site/game-grid";
import { SectionHeader } from "@/components/site/section-header";
import { getPublishedGames, getSettings, orderGames } from "@/server/queries/public";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: "All games", description: settings.copy.games.subtitle || settings.seo.description, alternates: { canonical: "/games" } };
}

export default async function GamesPage() {
  const [games, settings] = await Promise.all([getPublishedGames(), getSettings()]);
  const copy = settings.copy.games;
  return (
    <section className="section game-hero" aria-labelledby="all-games-title">
      <div className="container">
        <SectionHeader id="all-games-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        {games.length ? (
          <GameGrid games={orderGames(games, settings.display.featuredFirst)} animate={settings.theme.animations} headingLevel="h2" />
        ) : (
          <div className="card empty">New games are coming soon.</div>
        )}
      </div>
    </section>
  );
}
