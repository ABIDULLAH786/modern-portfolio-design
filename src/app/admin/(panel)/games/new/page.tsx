import { GameForm } from "@/components/admin/editors/game-form";
import { PageHeader } from "@/components/admin/page-header";
import { adminGenres } from "@/server/queries/admin";

export default async function NewGamePage() {
  const genres = await adminGenres();
  return (
    <>
      <PageHeader title="Add game" description="Fill in the details, then switch on “Published” to show it on your site." />
      <GameForm game={null} genres={genres} />
    </>
  );
}
