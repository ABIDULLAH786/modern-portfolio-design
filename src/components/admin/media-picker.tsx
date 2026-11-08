"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/inputs";
import type { MediaDTO, MediaRef } from "@/lib/types";
import { listMedia, mediaRefFor } from "@/server/actions/media";
import { toast } from "sonner";

/** "Choose from media library" dialog (Admin §12). */
export function MediaPickerDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (ref: NonNullable<MediaRef>) => void }) {
  const [items, setItems] = useState<MediaDTO[] | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    void listMedia("image").then((r) => alive && setItems(r.ok ? r.data : []));
    return () => {
      alive = false;
    };
  }, [open]);

  const filtered = (items ?? []).filter((m) => !q || `${m.alt} ${m.name} ${m.folder}`.toLowerCase().includes(q.toLowerCase()));

  const choose = async () => {
    if (!selected) return;
    setBusy(true);
    const r = await mediaRefFor(selected);
    setBusy(false);
    if (!r.ok) return void toast.error(r.error);
    onPick(r.data);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Choose from media library"
      wide
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" disabled={!selected} loading={busy} onClick={choose}>
            Use this image
          </Button>
        </>
      }
    >
      <Input placeholder="Search by alt text or file name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search media" className="mb-4" />
      {items === null ? (
        <div className="grid place-items-center py-16 text-muted">
          <Loader2 className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-muted">No images yet. Upload one first.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setSelected(m.id)}
                aria-pressed={selected === m.id}
                className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 ${selected === m.id ? "border-primary" : "border-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail via ImageKit transform */}
                <img src={`${m.url}${m.url.includes("?") ? "&" : "?"}tr=w-300,h-300,c-at_max`} alt={m.alt || m.name} className="size-full object-cover" loading="lazy" />
                {selected === m.id ? (
                  <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-primary text-on-primary">
                    <Check className="size-4" />
                  </span>
                ) : null}
              </button>
              <p className="mt-1 truncate text-xs text-muted">{m.alt || m.name}</p>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
