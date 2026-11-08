"use client";

import { Copy, ExternalLink, FileText, Images, Loader2, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadToImageKit } from "@/components/admin/upload";
import { useAction } from "@/components/admin/use-action";
import { Button, buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { EmptyState, Field, Input } from "@/components/ui/inputs";
import type { MediaDTO } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/text";
import { deleteMedia, mediaUsage, registerUpload, updateAlt } from "@/server/actions/media";

export function MediaLibrary({ items: initial, configured, usedBytes, capMb }: { items: MediaDTO[]; configured: boolean; usedBytes: number; capMb: number | null }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "image" | "pdf">("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<MediaDTO | null>(null);
  const [usage, setUsage] = useState<string[] | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState<{ name: string; pct: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { run, pending } = useAction();
  const confirm = useConfirm();

  const list = items.filter((m) => (filter === "all" || m.kind === filter) && (!q || `${m.alt} ${m.name} ${m.folder}`.toLowerCase().includes(q.toLowerCase())));

  const select = async (m: MediaDTO) => {
    setActive(m);
    setAlt(m.alt);
    setUsage(null);
    const r = await mediaUsage(m.id);
    setUsage(r.ok ? r.data : []);
  };

  const upload = async (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return void toast.error("Only images can be uploaded here. Upload your resume from the Profile page.");
    for (const f of arr) {
      setUploading({ name: f.name, pct: 0 });
      try {
        const up = await uploadToImageKit(f, "library", undefined, (pct) => setUploading({ name: f.name, pct }));
        const r = await registerUpload({ kind: "library", fileId: up.fileId, alt: "" });
        if (!r.ok) throw new Error(r.error);
        setItems((l) => [r.data.media, ...l]);
        toast.success(`Uploaded ${f.name}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Could not upload ${f.name}`);
      }
    }
    setUploading(null);
  };

  const remove = async (m: MediaDTO) => {
    if (!(await confirm({ title: "Delete this file?", body: "It's removed from ImageKit and can't be restored.", confirmLabel: "Delete", danger: true }))) return;
    const r = await run(() => deleteMedia(m.id), { success: false, refresh: false });
    if (!r.ok) return;
    if (!r.data.deleted) {
      setUsage(r.data.usedIn);
      toast.error("This file is in use. Remove it from those places first.");
      return;
    }
    toast.success("File deleted");
    setItems((l) => l.filter((x) => x.id !== m.id));
    setActive(null);
  };

  const usedPct = capMb ? Math.min(100, (usedBytes / (capMb * 1024 * 1024)) * 100) : null;

  return (
    <div
      className="relative grid gap-4"
      onDragOver={(e) => {
        if (!configured) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        void upload(e.dataTransfer.files);
      }}
    >
      {!configured ? <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">Uploads are disabled: ImageKit keys are missing in the server environment.</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Type" className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {(["all", "image", "pdf"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", filter === f ? "bg-primary-soft text-primary" : "text-muted")}>
              {f === "all" ? "All" : f === "image" ? "Images" : "Documents"}
            </button>
          ))}
        </div>
        <Input type="search" placeholder="Search alt text or file name" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" aria-label="Search media" />
        <Button variant="primary" className="ml-auto" onClick={() => input.current?.click()} disabled={!configured || !!uploading}>
          {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
          {uploading ? `${uploading.name.slice(0, 18)} ${uploading.pct}%` : "Upload images"}
        </Button>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" aria-label="Upload images" onChange={(e) => void upload(e.target.files)} />
      </div>
      <p className="text-sm text-muted">
        {items.length} files · {formatBytes(usedBytes)} used{capMb ? ` of ${capMb >= 1024 ? `${(capMb / 1024).toFixed(1)} GB` : `${capMb} MB`}` : ""}
        {usedPct !== null ? (
          <span className="ml-3 inline-block h-1.5 w-32 overflow-hidden rounded-full bg-surface-2 align-middle">
            <span className={cn("block h-full", usedPct > 90 ? "bg-danger" : "bg-[image:var(--gradient)]")} style={{ width: `${usedPct}%` }} />
          </span>
        ) : null}
        <span className="ml-3">· Drag & drop files anywhere here</span>
      </p>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        {list.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {list.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => void select(m)} className={cn("block w-full overflow-hidden rounded-xl border-2 bg-surface text-left", active?.id === m.id ? "border-primary" : "border-border")} aria-pressed={active?.id === m.id}>
                  <span className="grid aspect-square place-items-center bg-surface-2">
                    {m.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element -- thumbnail via ImageKit transform
                      <img src={`${m.url}${m.url.includes("?") ? "&" : "?"}tr=w-300,h-300`} alt={m.alt || m.name} className="size-full object-cover" loading="lazy" />
                    ) : (
                      <FileText className="size-10 text-muted" aria-hidden="true" />
                    )}
                  </span>
                  <span className="block truncate px-2 py-1.5 text-xs">{m.alt || m.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Images />} title="No files yet" />
        )}
        {active ? (
          <aside className="grid gap-4 rounded-[var(--radius)] border border-border bg-surface p-4 lg:sticky lg:top-20" aria-label="File details">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate font-semibold">{active.name}</h2>
              <button type="button" onClick={() => setActive(null)} className="grid size-8 place-items-center rounded-lg text-muted hover:text-text" aria-label="Close details">
                <X className="size-4" />
              </button>
            </div>
            {active.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview
              <img src={`${active.url}${active.url.includes("?") ? "&" : "?"}tr=w-640`} alt={active.alt} className="w-full rounded-xl" />
            ) : null}
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted">Size</dt>
              <dd>{formatBytes(active.bytes)}</dd>
              {active.width ? (
                <>
                  <dt className="text-muted">Dimensions</dt>
                  <dd>
                    {active.width}×{active.height}
                  </dd>
                </>
              ) : null}
              <dt className="text-muted">Folder</dt>
              <dd className="break-all">{active.folder}</dd>
            </dl>
            {active.kind === "image" ? (
              <Field label="Alt text" htmlFor="m-alt" hint="Updates everywhere this image is used.">
                <div className="flex gap-2">
                  <Input id="m-alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={200} />
                  <Button
                    size="sm"
                    variant="primary"
                    loading={pending}
                    disabled={alt === active.alt}
                    onClick={async () => {
                      const r = await run(() => updateAlt(active.id, alt), { success: "Alt text saved", refresh: false });
                      if (r.ok) {
                        setItems((l) => l.map((x) => (x.id === active.id ? { ...x, alt } : x)));
                        setActive({ ...active, alt });
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </Field>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(active.url).catch(() => undefined);
                  toast.success("Link copied");
                }}
              >
                <Copy aria-hidden="true" /> Copy link
              </Button>
              <a href={active.url} target="_blank" rel="noopener" className={buttonClass("ghost", "sm")}>
                <ExternalLink aria-hidden="true" /> Open
              </a>
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold">Used in</p>
              {usage === null ? (
                <Loader2 className="size-4 animate-spin text-muted" />
              ) : usage.length ? (
                <ul className="list-disc pl-5 text-sm text-muted">
                  {usage.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Not used anywhere.</p>
              )}
            </div>
            <Button variant="danger" size="sm" onClick={() => void remove(active)} disabled={!!usage?.length}>
              <Trash2 aria-hidden="true" /> {usage?.length ? "In use, can't delete" : "Delete file"}
            </Button>
          </aside>
        ) : null}
      </div>
      {drag ? <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl border-2 border-dashed border-primary bg-primary-soft text-lg font-semibold text-primary">Drop to upload</div> : null}
    </div>
  );
}
