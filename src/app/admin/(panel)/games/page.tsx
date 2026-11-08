import { Plus } from "lucide-react";
import Link from "next/link";
import { GamesList } from "@/components/admin/editors/games-list";
import { PageHeader } from "@/components/admin/page-header";
import { buttonClass } from "@/components/ui/button";
import { adminGames } from "@/server/queries/admin";

export default async function GamesAdminPage() {
  const games = await adminGames();
  return (
    <>
      <PageHeader
        title="Games"
        description="Add, edit, reorder and publish your games. The order here is the order on your site."
        actions={
          <Link href="/admin/games/new" className={buttonClass("primary", "md")}>
            <Plus aria-hidden="true" /> Add game
          </Link>
        }
      />
      <GamesList games={games} />
    </>
  );
}
