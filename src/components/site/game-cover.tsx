import Image from "next/image";
import type { GameDTO } from "@/lib/types";
import { GameCoverArt } from "./game-cover-art";

/** Uploaded cover image, or the generated theme-aware SVG art. */
export function GameCover({ game, sizes, priority = false }: { game: Pick<GameDTO, "id" | "title" | "cover" | "coverStyle">; sizes: string; priority?: boolean }) {
  if (game.cover) {
    return (
      <Image
        src={game.cover.url}
        alt={game.cover.alt || `${game.title} cover`}
        fill
        sizes={sizes}
        priority={priority}
        {...(game.cover.blurDataUrl ? { placeholder: "blur" as const, blurDataURL: game.cover.blurDataUrl } : {})}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <GameCoverArt seed={game.id} style={game.coverStyle} title={game.title} />;
}
