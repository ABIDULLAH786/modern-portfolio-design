"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { GameDTO } from "@/lib/types";
import { GameCard } from "./game-card";

/** Genre filter chips + animated card grid (client-side filtering, PRD FR-P2). */
export function GameGrid({ games, animate, headingLevel }: { games: GameDTO[]; animate: boolean; headingLevel?: "h2" | "h3" }) {
  const genres = useMemo(() => ["All", ...Array.from(new Set(games.map((g) => g.genre).filter(Boolean)))], [games]);
  const [filter, setFilter] = useState("All");
  const list = filter === "All" ? games : games.filter((g) => g.genre === filter);

  return (
    <MotionConfig reducedMotion={animate ? "user" : "always"}>
      {genres.length > 2 ? (
        <div className="filters reveal" role="group" aria-label="Filter games by genre">
          {genres.map((g) => (
            <button key={g} type="button" className="filter" aria-pressed={g === filter} onClick={() => setFilter(g)}>
              {g}
            </button>
          ))}
        </div>
      ) : null}
      <motion.ul layout className="proj-grid reveal" style={{ listStyle: "none", margin: 0, padding: 0 }} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((g) => (
            <motion.li
              key={g.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <GameCard game={g} {...(headingLevel ? { headingLevel } : {})} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {list.length === 0 ? <div className="card empty">No games in this category yet.</div> : null}
    </MotionConfig>
  );
}
