"use client";

import { ImagePlus, Library, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/inputs";
import type { MediaKind } from "@/lib/media-kinds";
import type { MediaRef } from "@/lib/types";
import { registerUpload } from "@/server/actions/media";
import { MediaPickerDialog } from "./media-picker";
import { uploadToImageKit } from "./upload";

/** Upload → ImageKit → register; returns a MediaRef. Shared by ImageField and GalleryField. */
export async function uploadAndRegister(file: File, kind: MediaKind, scope: string | undefined, alt: string, onProgress: (p: number) => void) {
  const up = await uploadToImageKit(file, kind, scope, onProgress);
  const r = await registerUpload({ kind, fileId: up.fileId, scope, alt });
  if (!r.ok) throw new Error(r.error);
  return r.data.ref;
}

export function ImageField({ label, value, onChange, kind, scope, hint, aspect = "aspect-square", error }: { label: string; value: MediaRef; onChange: (v: MediaRef) => void; kind: MediaKind; scope?: string; hint?: string; aspect?: string; error?: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const [picker, setPicker] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setProgress(0);
    try {
      const ref = await uploadAndRegister(file, kind, scope, value?.alt ?? "", setProgress);
      onChange(ref);
      toast.success("Image uploaded. Add alt text, then save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold" id={`${id}-label`}>
        {label}
      </span>
      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`relative grid w-36 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed bg-surface-2 text-center text-xs text-muted transition ${aspect} ${drag ? "border-primary" : "border-border"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void handle(e.dataTransfer.files[0]);
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
            <img src={`${value.url}${value.url.includes("?") ? "&" : "?"}tr=w-400`} alt={value.alt} className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="grid justify-items-center gap-1 p-2">
              <ImagePlus className="size-6" aria-hidden="true" />
              Drop an image here
            </span>
          )}
          {progress !== null ? (
            <div className="absolute inset-x-2 bottom-2 h-2 overflow-hidden rounded-full bg-bg/80" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-full bg-[image:var(--gradient)] transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
        </div>
        <div className="grid min-w-[220px] flex-1 gap-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => input.current?.click()} loading={progress !== null}>
              {progress === null ? <Upload aria-hidden="true" /> : null}
              {progress === null ? (value ? "Replace" : "Upload") : `Uploading ${progress}%`}
            </Button>
            <Button size="sm" onClick={() => setPicker(true)}>
              <Library aria-hidden="true" /> Choose from library
            </Button>
            {value ? (
              <Button size="sm" variant="danger" onClick={() => onChange(null)}>
                <Trash2 aria-hidden="true" /> Remove
              </Button>
            ) : null}
          </div>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" aria-labelledby={`${id}-label`} onChange={(e) => void handle(e.target.files?.[0])} />
          {value ? (
            <label className="grid gap-1 text-sm">
              <span className="font-medium">
                Alt text <span className="text-danger">*</span>
              </span>
              <Input value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} placeholder="Describe the image for screen readers" maxLength={200} aria-invalid={!value.alt.trim()} />
              {!value.alt.trim() ? <span className="text-xs text-warning">Please describe this image (helps accessibility and SEO).</span> : null}
            </label>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : hint ? <p className="text-[0.82rem] text-muted">{hint}</p> : null}
        </div>
      </div>
      <MediaPickerDialog open={picker} onOpenChange={setPicker} onPick={onChange} />
    </div>
  );
}
