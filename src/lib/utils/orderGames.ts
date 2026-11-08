import type { GameDTO } from "@/lib/types";

/** Manual order, optionally with featured games pinned first. */
export function orderGames(games: GameDTO[], featuredFirst: boolean): GameDTO[] {
  if (!featuredFirst) return games;
  return [...games].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
}
