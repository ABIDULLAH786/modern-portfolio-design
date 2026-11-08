"use client";

import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import type { ResumeFile } from "@/lib/types";
import { relativeTime } from "@/lib/utils/text";
import { registerResume, removeResume } from "@/server/actions/media";
import { uploadToImageKit } from "./upload";

/**
 * Single resume (PDF). Uploading a new one deletes the old file from ImageKit,
 * so there is only ever one resume. Saves immediately (independent of the profile form).
 */
export function ResumeField({ value }: { value: ResumeFile | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [cv, setCv] = useState(value);
  const router = useRouter();
  const confirm = useConfirm();

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setPct(0);
    try {
      const up = await uploadToImageKit(file, "resume", undefined, setPct);
      const r = await registerResume({ fileId: up.fileId, fileName: file.name });
      if (!r.ok) throw new Error(r.error);
      setCv(r.data);
      toast.success(value ? "Resume replaced · old file deleted" : "Resume uploaded · live site updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setPct(null);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    if (!(await confirm({ title: "Remove your resume?", body: "The PDF is deleted from storage and the Download CV button disappears from the site.", confirmLabel: "Remove", danger: true }))) return;
    const r = await removeResume();
    if (!r.ok) return void toast.error(r.error);
    setCv(null);
    toast.success("Resume removed");
    router.refresh();
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold">Resume / CV (PDF)</span>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg/40 p-3">
        <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          {cv ? (
            <>
              <p className="truncate font-medium">{cv.fileName}</p>
              <p className="text-xs text-muted">{cv.uploadedAt ? `Uploaded ${relativeTime(cv.uploadedAt)}` : "Uploaded"}</p>
            </>
          ) : (
            <p className="text-sm text-muted">No resume uploaded. The “Download CV” button is hidden.</p>
          )}
          {pct !== null ? (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-full bg-[image:var(--gradient)]" style={{ width: `${pct}%` }} />
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {cv ? (
            <a href={cv.url} target="_blank" rel="noopener" className={buttonClass("ghost", "sm")}>
              <ExternalLink aria-hidden="true" /> View
            </a>
          ) : null}
          <Button size="sm" variant={cv ? "ghost" : "primary"} onClick={() => input.current?.click()} loading={pct !== null}>
            {pct === null ? <Upload aria-hidden="true" /> : null}
            {cv ? "Replace" : "Upload PDF"}
          </Button>
          {cv ? (
            <Button size="sm" variant="danger" onClick={remove} aria-label="Remove resume">
              <Trash2 aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-[0.82rem] text-muted">PDF up to 5 MB. Uploading a new resume replaces (and deletes) the old one. Saves instantly.</p>
      <input ref={input} type="file" accept="application/pdf" className="sr-only" aria-label="Upload resume PDF" onChange={(e) => void upload(e.target.files?.[0])} />
    </div>
  );
}
