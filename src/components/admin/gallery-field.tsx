"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/inputs";
import { MAX_GALLERY } from "@/lib/constants";
import type { MediaRef } from "@/lib/types";
import { uploadAndRegister } from "./image-field";
import { MediaPickerDialog } from "./media-picker";
import { DragHandle, SortableList } from "./sortable-list";

type Img = NonNullable<MediaRef>;

/** Screenshots: multi-upload, drag reorder, alt per image, max 12 (Admin §5.2). */
export function GalleryField({ value, onChange, scope }: { value: Img[]; onChange: (v: Img[]) => void; scope: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<Array<{ name: string; pct: number }>>([]);
  const [picker, setPicker] = useState(false);
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_GALLERY - latest.current.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > room) toast.warning(`Only ${MAX_GALLERY} screenshots are allowed. ${files.length - list.length} file(s) skipped.`);
    setQueue(list.map((f) => ({ name: f.name, pct: 0 })));
    for (const [i, f] of list.entries()) {
      try {
        const ref = await uploadAndRegister(f, "game-gallery", scope, "", (pct) => setQueue((q) => q.map((x, j) => (j === i ? { ...x, pct } : x))));
        onChange([...latest.current, ref]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Could not upload ${f.name}`);
      }
    }
    setQueue([]);
    if (input.current) input.current.value = "";
  };

  const items = value.map((v, i) => ({ ...v, id: `${v.mediaId}-${i}` }));

  return (
    <div className="grid gap-3">
      {value.length ? (
        <SortableList
          grid
          label="Screenshots"
          items={items}
          onReorder={(next) => onChange(next.map(({ id: _id, ...rest }) => (void _id, rest)))}
          render={(img, i) => (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="relative aspect-[16/10] bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={`${img.url}${img.url.includes("?") ? "&" : "?"}tr=w-400`} alt={img.alt} className="size-full object-cover" />
                <div className="absolute top-1 left-1 rounded-lg bg-surface/90">
                  <DragHandle label={`Move screenshot ${i + 1}`} />
                </div>
                <button
                  type="button"
                  className="absolute top-1 right-1 grid size-8 place-items-center rounded-lg bg-surface/90 text-danger"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remove screenshot ${i + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Input
                className="rounded-none border-0 border-t px-2 py-1.5 text-xs"
                placeholder="Alt text *"
                value={img.alt}
                maxLength={200}
                aria-label={`Alt text for screenshot ${i + 1}`}
                aria-invalid={!img.alt.trim()}
                onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, alt: e.target.value } : v)))}
              />
            </div>
          )}
        />
      ) : null}
      {queue.length ? (
        <ul className="grid gap-1 text-sm">
          {queue.map((q) => (
            <li key={q.name} className="flex items-center gap-3">
              <span className="w-40 truncate text-muted">{q.name}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span className="block h-full bg-[image:var(--gradient)]" style={{ width: `${q.pct}%` }} />
              </span>
              <span className="w-10 text-right tabular-nums">{q.pct}%</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => input.current?.click()} disabled={value.length >= MAX_GALLERY || queue.length > 0}>
          <ImagePlus aria-hidden="true" /> Add screenshots
        </Button>
        <Button size="sm" onClick={() => setPicker(true)} disabled={value.length >= MAX_GALLERY}>
          Choose from library
        </Button>
        <span className="text-sm text-muted">
          {value.length}/{MAX_GALLERY} · drag to reorder
        </span>
      </div>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" aria-label="Add screenshots" onChange={(e) => void add(e.target.files)} />
      <MediaPickerDialog open={picker} onOpenChange={setPicker} onPick={(ref) => onChange([...value, ref].slice(0, MAX_GALLERY))} />
    </div>
  );
}
