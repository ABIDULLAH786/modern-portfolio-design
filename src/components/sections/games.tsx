import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GameGrid } from "@/components/site/game-grid";
import { SectionHeader } from "@/components/site/section-header";
import type { GameDTO, SettingsDTO } from "@/lib/types";

export function Games({ games, copy, limit, animate }: { games: GameDTO[]; copy: SettingsDTO["copy"]["games"]; limit: number; animate: boolean }) {
  const shown = games.slice(0, limit);
  return (
    <section className="section" id="games" aria-labelledby="games-title">
      <div className="container">
        <SectionHeader id="games-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        {shown.length ? <GameGrid games={shown} animate={animate} /> : <div className="card empty">New games are coming soon.</div>}
        {games.length > limit ? (
          <div className="view-all">
            <Link className="btn btn-ghost" href="/games">
              View all {games.length} games <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
