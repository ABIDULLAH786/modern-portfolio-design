import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { GameDTO } from "@/lib/types";
import { GameCover } from "./game-cover";

export function GameCard({ game, headingLevel = "h3" }: { game: GameDTO; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="card proj">
      <div className="cover">
        <GameCover game={game} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 380px" />
        {game.genre ? <span className="badge">{game.genre}</span> : null}
        {game.featured ? <span className="badge feat">★ Featured</span> : null}
      </div>
      <div className="proj-body">
        <H>
          <Link href={`/games/${game.slug}`} className="proj-link">
            {game.title}
          </Link>
        </H>
        <p>{game.shortDescription}</p>
        {game.tags.length ? (
          <ul className="tags" aria-label="Tags">
            {game.tags.map((t) => (
              <li className="tag" key={t}>
                #{t}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="proj-foot">
          <span>{game.platforms.join(" · ")}</span>
          <b aria-hidden="true">
            Details <ArrowUpRight size={14} />
          </b>
        </div>
      </div>
    </article>
  );
}
