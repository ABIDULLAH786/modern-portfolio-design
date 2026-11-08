import { notFound } from "next/navigation";
import { GameForm } from "@/components/admin/editors/game-form";
import { PageHeader } from "@/components/admin/page-header";
import { adminGame, adminGenres } from "@/server/queries/admin";

export default async function EditGamePage({ params }: PageProps<"/admin/games/[id]">) {
  const { id } = await params;
  const [game, genres] = await Promise.all([adminGame(id), adminGenres()]);
  if (!game) notFound();
  return (
    <>
      <PageHeader title={`Edit “${game.title}”`} />
      <GameForm key={game.id + game.updatedAt} game={game} genres={genres} />
    </>
  );
}
