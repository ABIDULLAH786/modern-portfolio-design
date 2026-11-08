"use client";

import { AlertTriangle, Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller } from "react-hook-form";
import { ChipInput } from "@/components/admin/chip-input";
import { GalleryField } from "@/components/admin/gallery-field";
import { ImageField } from "@/components/admin/image-field";
import { MarkdownField } from "@/components/admin/markdown-field";
import { SaveBar } from "@/components/admin/save-bar";
import { useAction } from "@/components/admin/use-action";
import { errorAt, useEditorForm } from "@/components/admin/use-editor-form";
import { GameCoverArt } from "@/components/site/game-cover-art";
import { Button, buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Field, Input, Panel, Select } from "@/components/ui/inputs";
import { SwitchRow } from "@/components/ui/switch";
import { COVER_STYLES, ENGINE_OPTIONS, GAME_STATUSES, GAME_STATUS_LABELS, LINK_KINDS, LINK_LABELS, MAX_TAGS, PLATFORM_OPTIONS, type LinkKind } from "@/lib/constants";
import type { GameDTO } from "@/lib/types";
import { slugify } from "@/lib/utils/slugify";
import { youtubeId } from "@/lib/utils/text";
import { gameSchema, type GameInput } from "@/lib/validation/game";
import { createGame, deleteGame, duplicateGame, updateGame } from "@/server/actions/games";

const KIND_NAMES: Record<LinkKind, string> = { itch: "itch.io", playstore: "Google Play", appstore: "App Store", web: "Web / WebGL", steam: "Steam", github: "GitHub", other: "Other" };

function toInput(g: GameDTO | null): GameInput {
  return {
    title: g?.title ?? "",
    slug: g?.slug ?? "",
    status: g?.status ?? "released",
    published: g?.published ?? false,
    featured: g?.featured ?? false,
    genre: g?.genre ?? "",
    platforms: g?.platforms ?? ["Android"],
    engine: g?.engine ?? "Unity",
    releaseYear: g?.releaseYear ?? null,
    shortDescription: g?.shortDescription ?? "",
    description: g?.description ?? "",
    tags: g?.tags ?? [],
    cover: g?.cover ?? null,
    coverStyle: g?.coverStyle ?? "arcade",
    gallery: g?.gallery ?? [],
    trailerUrl: g?.trailerUrl ?? "",
    links: g?.links ?? [],
  };
}

export function GameForm({ game, genres }: { game: GameDTO | null; genres: string[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const { run } = useAction();
  const [slugTouched, setSlugTouched] = useState(Boolean(game));

  const save = useCallback(
    async (v: GameInput) => {
      const r = game ? await updateGame(game.id, v) : await createGame(v);
      if (r.ok && !game) router.replace(`/admin/games/${r.data.id}`);
      return r;
    },
    [game, router],
  );
  const { form, submit, pending, dirty, discard } = useEditorForm(gameSchema, toInput(game), save, {
    success: game ? "Saved · live site updated" : "Game created",
    ...(game?.published ? { viewHref: `/games/${game.slug}` } : {}),
  });
  const { register, control, watch, setValue, formState } = form;
  const e = (p: string) => errorAt(formState.errors, p);
  const v = watch();
  const set = <K extends keyof GameInput>(k: K, val: GameInput[K]) => setValue(k, val as never, { shouldDirty: true, shouldValidate: formState.isSubmitted });
  const yt = youtubeId(v.trailerUrl);
  const scope = v.slug || slugify(v.title) || "unsorted";
  const slugChanged = Boolean(game && v.slug !== game.slug);

  const titleReg = register("title");

  return (
    <form onSubmit={(ev) => (ev.preventDefault(), void submit())} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-6">
        <Panel>
          <Field label="Title" htmlFor="title" required error={e("title")}>
            <Input
              id="title"
              {...titleReg}
              onChange={(ev) => {
                void titleReg.onChange(ev);
                if (!slugTouched) set("slug", slugify(ev.target.value));
              }}
              aria-invalid={!!e("title")}
            />
          </Field>
          <Field label="Short description" htmlFor="short" required error={e("shortDescription")} hint="Shown on the game card. 1–2 sentences." counter={`${v.shortDescription.length}/220`}>
            <Input id="short" maxLength={220} {...register("shortDescription")} aria-invalid={!!e("shortDescription")} />
          </Field>
          <Field label="Full description" htmlFor="desc" error={e("description")} hint="Shown on the game's own page: story, features, controls.">
            <Controller control={control} name="description" render={({ field }) => <MarkdownField id="desc" value={field.value} onChange={field.onChange} rows={10} maxLength={10000} />} />
          </Field>
        </Panel>

        <Panel title="Cover image" description="16:10 works best (1600×1000).">
          <Controller control={control} name="cover" render={({ field }) => <ImageField label="Cover" kind="game-cover" scope={scope} value={field.value} onChange={field.onChange} aspect="aspect-[16/10]" />} />
          {!v.cover ? (
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-semibold">No cover yet? Pick generated art (it follows your theme colours)</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Generated cover style">
                {COVER_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={v.coverStyle === s}
                    onClick={() => set("coverStyle", s)}
                    className={`overflow-hidden rounded-xl border-2 text-left ${v.coverStyle === s ? "border-primary" : "border-border"}`}
                  >
                    <span className="block aspect-[16/10] [&>svg]:size-full">
                      <GameCoverArt seed={game?.id ?? "new"} style={s} title={v.title || "Preview"} />
                    </span>
                    <span className="block px-2 py-1 text-xs font-semibold capitalize">{s}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
        </Panel>

        <Panel title="Screenshots" description="Up to 12. Each needs a short description (alt text).">
          <Controller control={control} name="gallery" render={({ field }) => <GalleryField value={field.value} onChange={field.onChange} scope={scope} />} />
          {e("gallery") ? <p className="text-sm text-danger">{e("gallery")}</p> : null}
        </Panel>

        <Panel title="Trailer">
          <Field label="YouTube link" htmlFor="trailer" error={e("trailerUrl")} hint="Paste a youtube.com or youtu.be link. Optional.">
            <Input id="trailer" type="url" placeholder="https://www.youtube.com/watch?v=…" {...register("trailerUrl")} aria-invalid={!!e("trailerUrl")} />
          </Field>
          {yt ? (
            // eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail preview
            <img src={`https://i.ytimg.com/vi/${yt}/mqdefault.jpg`} alt="Trailer thumbnail" className="w-64 rounded-xl border border-border" />
          ) : null}
        </Panel>

        <Panel
          title="Play / store links"
          description="Buttons on the game page. Only filled links are shown."
          actions={
            <Button size="sm" onClick={() => set("links", [...v.links, { kind: "itch", url: "", label: "" }])} disabled={v.links.length >= 8}>
              <Plus aria-hidden="true" /> Add link
            </Button>
          }
        >
          {v.links.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2.5 text-sm text-warning">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> No links yet. Add at least one so visitors can play your game.
            </p>
          ) : (
            <ul className="grid gap-3">
              {v.links.map((l, i) => (
                <li key={i} className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
                  <Select aria-label="Store" value={l.kind} onChange={(ev) => set("links", v.links.map((x, j) => (j === i ? { ...x, kind: ev.target.value as LinkKind } : x)))}>
                    {LINK_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {KIND_NAMES[k]}
                      </option>
                    ))}
                  </Select>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Input aria-label="Link URL" type="url" placeholder="https://" {...register(`links.${i}.url`)} aria-invalid={!!e(`links.${i}.url`)} />
                    <Input aria-label="Button label (optional)" placeholder={LINK_LABELS[l.kind]} className="sm:w-48" {...register(`links.${i}.label`)} />
                  </div>
                  <Button size="icon" variant="danger" aria-label="Remove link" onClick={() => set("links", v.links.filter((_, j) => j !== i))}>
                    <Trash2 />
                  </Button>
                  {e(`links.${i}.url`) ? <p className="text-sm text-danger sm:col-span-3">{e(`links.${i}.url`)}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <aside className="grid gap-6 lg:sticky lg:top-20">
        <Panel title="Publish">
          <Controller control={control} name="published" render={({ field }) => <SwitchRow id="published" label="Published" hint="Visible on your site" checked={field.value} onCheckedChange={field.onChange} />} />
          <Controller control={control} name="featured" render={({ field }) => <SwitchRow id="featured" label="Featured" hint="Shows a ★ Featured badge" checked={field.value} onCheckedChange={field.onChange} />} />
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register("status")}>
              {GAME_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {GAME_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-2">
            <Button type="submit" variant="primary" loading={pending} className="justify-center">
              {game ? "Save changes" : "Create game"}
            </Button>
            {game ? (
              <a
                href={`/games/${game.slug}`}
                target="_blank"
                rel="noopener"
                className={buttonClass("ghost", "md", `justify-center ${game.published ? "" : "pointer-events-none opacity-50"}`)}
                aria-disabled={!game.published}
              >
                <ExternalLink aria-hidden="true" /> View on site
              </a>
            ) : null}
          </div>
        </Panel>

        <Panel title="Details">
          <Field label="Genre" htmlFor="genre" required error={e("genre")} hint="Used for the filter buttons on your site.">
            <Input id="genre" list="genre-list" {...register("genre")} aria-invalid={!!e("genre")} />
            <datalist id="genre-list">
              {genres.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </Field>
          <Field label="Platforms" htmlFor="platforms">
            <ChipInput id="platforms" value={v.platforms} onChange={(x) => set("platforms", x)} max={10} suggestions={PLATFORM_OPTIONS} maxLength={30} />
          </Field>
          <Field label="Engine" htmlFor="engine">
            <Input id="engine" list="engine-list" {...register("engine")} />
            <datalist id="engine-list">
              {ENGINE_OPTIONS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </Field>
          <Field label="Release year" htmlFor="year" error={e("releaseYear")}>
            <Input id="year" type="number" inputMode="numeric" min={1990} max={2100} {...register("releaseYear", { setValueAs: (x: unknown) => (x === "" || x == null ? null : Number(x)) })} />
          </Field>
          <Field label="Tags" htmlFor="tags" error={e("tags")} hint={`Press Enter or comma to add. Up to ${MAX_TAGS}.`}>
            <ChipInput id="tags" value={v.tags} onChange={(x) => set("tags", x)} max={MAX_TAGS} maxLength={30} />
          </Field>
        </Panel>

        <Panel title="Page address">
          <Field label="URL" htmlFor="slug" error={e("slug")} hint={slugChanged ? "Old links will redirect automatically." : "Created from the title. Lowercase letters, numbers and dashes."}>
            <div className="flex items-center rounded-xl border border-border bg-bg focus-within:border-primary">
              <span className="pl-3 text-sm text-muted">/games/</span>
              <input
                id="slug"
                className="w-full bg-transparent px-1 py-2.5 text-[0.95rem] outline-none"
                {...register("slug", { onChange: () => setSlugTouched(true) })}
                aria-invalid={!!e("slug")}
              />
            </div>
          </Field>
        </Panel>

        {game ? (
          <Panel title="Danger zone">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  const r = await run(() => duplicateGame(game.id), { success: "Duplicated as a draft" });
                  if (r.ok) router.push(`/admin/games/${r.data.id}`);
                }}
              >
                <Copy aria-hidden="true" /> Duplicate
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  const ok = await confirm({ title: `Delete “${game.title}”?`, body: "This can't be undone. Its cover and screenshots are also deleted from ImageKit unless used elsewhere.", confirmLabel: "Delete game", danger: true });
                  if (!ok) return;
                  const r = await run(() => deleteGame(game.id, true), { success: `Deleted “${game.title}”`, refresh: false });
                  if (r.ok) router.push("/admin/games");
                }}
              >
                <Trash2 aria-hidden="true" /> Delete
              </Button>
            </div>
          </Panel>
        ) : null}
      </aside>
      <div className="lg:col-span-2">
        <SaveBar id="game" dirty={dirty} saving={pending} onSave={() => void submit()} onDiscard={discard} label={game ? "Save changes" : "Create game"} />
      </div>
    </form>
  );
}
