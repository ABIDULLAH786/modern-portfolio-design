"use client";

import { Copy, ExternalLink, Gamepad2, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";
import { ListRow, SortableList } from "@/components/admin/sortable-list";
import { useAction } from "@/components/admin/use-action";
import { GameCoverArt } from "@/components/site/game-cover-art";
import { buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Badge, EmptyState, Input } from "@/components/ui/inputs";
import { Switch } from "@/components/ui/switch";
import type { GameDTO } from "@/lib/types";
import { relativeTime } from "@/lib/utils/text";
import { deleteGame, duplicateGame, reorderGames, setGameFlag } from "@/server/actions/games";

type Filter = "all" | "published" | "drafts" | "featured";

export function GamesList({ games: initial }: { games: GameDTO[] }) {
  const [games, setGames] = useState(initial);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { run } = useAction();
  const confirm = useConfirm();
  const router = useRouter();

  const filtered = games.filter((g) => {
    if (q && !g.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "published") return g.published;
    if (filter === "drafts") return !g.published;
    if (filter === "featured") return g.featured;
    return true;
  });
  const canReorder = !q && filter === "all";

  const reorder = async (next: GameDTO[]) => {
    const prev = games;
    setGames(next);
    const r = await run(() => reorderGames(next.map((g) => g.id)), { success: "Order saved · live site updated", refresh: false });
    if (!r.ok) setGames(prev);
  };

  const flag = async (g: GameDTO, key: "published" | "featured", value: boolean) => {
    const prev = games;
    setGames(games.map((x) => (x.id === g.id ? { ...x, [key]: value } : x)));
    const r = await run(() => setGameFlag({ id: g.id, value }, key), {
      success: key === "published" ? (value ? `“${g.title}” is now live` : `“${g.title}” is now a draft`) : value ? "Marked as featured" : "No longer featured",
      refresh: false,
    });
    if (!r.ok) setGames(prev);
  };

  const remove = async (g: GameDTO) => {
    const hasImages = Boolean(g.cover || g.gallery.length);
    const ok = await confirm({
      title: `Delete “${g.title}”?`,
      body: (
        <>
          This can&apos;t be undone.
          {hasImages ? " Its cover and screenshots will also be deleted from ImageKit (unless they're used somewhere else)." : null}
        </>
      ),
      confirmLabel: "Delete game",
      danger: true,
    });
    if (!ok) return;
    const r = await run(() => deleteGame(g.id, true), { success: `Deleted “${g.title}”` });
    if (r.ok) setGames((list) => list.filter((x) => x.id !== g.id));
  };

  const duplicate = async (g: GameDTO) => {
    const r = await run(() => duplicateGame(g.id), { success: "Duplicated as a draft" });
    if (r.ok) router.push(`/admin/games/${r.data.id}`);
  };

  if (!games.length) {
    return (
      <EmptyState icon={<Gamepad2 />} title="No games yet">
        <Link href="/admin/games/new" className={buttonClass("primary", "sm")}>
          Add your first game
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" aria-label="Search games" />
        <div role="group" aria-label="Filter" className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {(["all", "published", "drafts", "featured"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize ${filter === f ? "bg-primary-soft text-primary" : "text-muted"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {!canReorder ? <p className="text-sm text-muted">Clear the search and filter to drag games into a new order.</p> : null}
      <SortableList
        label="Games"
        items={filtered}
        disabled={!canReorder}
        onReorder={reorder}
        render={(g) => (
          <ListRow
            actions={
              <>
                <label className="hidden items-center gap-2 text-xs text-muted md:flex">
                  Published
                  <Switch checked={g.published} onCheckedChange={(v) => void flag(g, "published", v)} label={`Published: ${g.title}`} />
                </label>
                <button
                  type="button"
                  onClick={() => void flag(g, "featured", !g.featured)}
                  className={`hidden size-9 place-items-center rounded-full md:grid ${g.featured ? "text-warning" : "text-muted hover:text-text"}`}
                  aria-label={g.featured ? `Unfeature ${g.title}` : `Feature ${g.title}`}
                  aria-pressed={g.featured}
                >
                  <Star className="size-4" fill={g.featured ? "currentColor" : "none"} />
                </button>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text" aria-label={`More actions for ${g.title}`}>
                    <MoreHorizontal className="size-4" />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" sideOffset={6} className="z-[70] min-w-48 rounded-xl border border-border bg-surface p-1 shadow-2xl">
                      {[
                        { label: "Edit", icon: Pencil, run: () => router.push(`/admin/games/${g.id}`) },
                        { label: "Duplicate", icon: Copy, run: () => void duplicate(g) },
                        ...(g.published ? [{ label: "View on site", icon: ExternalLink, run: () => window.open(`/games/${g.slug}`, "_blank") }] : []),
                        { label: g.published ? "Unpublish" : "Publish", icon: Gamepad2, run: () => void flag(g, "published", !g.published) },
                        { label: g.featured ? "Unfeature" : "Feature", icon: Star, run: () => void flag(g, "featured", !g.featured) },
                      ].map((it) => (
                        <DropdownMenu.Item key={it.label} onSelect={it.run} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-surface-2">
                          <it.icon className="size-4 text-muted" aria-hidden="true" /> {it.label}
                        </DropdownMenu.Item>
                      ))}
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item onSelect={() => void remove(g)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-danger/10">
                        <Trash2 className="size-4" aria-hidden="true" /> Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            }
          >
            <Link href={`/admin/games/${g.id}`} className="flex items-center gap-3">
              <span className="relative block h-12 w-[76px] shrink-0 overflow-hidden rounded-lg bg-surface-2 [&>svg]:size-full">
                {g.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img src={`${g.cover.url}${g.cover.url.includes("?") ? "&" : "?"}tr=w-160`} alt="" className="size-full object-cover" />
                ) : (
                  <GameCoverArt seed={g.id} style={g.coverStyle} title={g.title} />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{g.title}</span>
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <Badge tone={g.published ? "success" : "neutral"}>{g.published ? "Published" : "Draft"}</Badge>
                  {g.featured ? <Badge tone="warning">★ Featured</Badge> : null}
                  <span>{g.genre}</span>
                  <span className="hidden sm:inline">· {g.platforms.join(", ")}</span>
                  <span className="hidden sm:inline">· updated {relativeTime(g.updatedAt)}</span>
                </span>
              </span>
            </Link>
          </ListRow>
        )}
      />
      {filtered.length === 0 ? <p className="py-8 text-center text-muted">No games match.</p> : null}
      <p className="text-xs text-muted">Tip: drag the handle, or focus it and press Space then the arrow keys.</p>
    </div>
  );
}
