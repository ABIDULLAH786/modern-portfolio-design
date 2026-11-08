"use client";

import { Download, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/components/admin/use-action";
import { Button, buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Panel } from "@/components/ui/inputs";
import { importBackup, previewBackup, resetToSeed } from "@/server/actions/backup";

export function BackupEditor() {
  const input = useRef<HTMLInputElement>(null);
  const { run, pending } = useAction();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      let json: unknown;
      try {
        json = JSON.parse(await file.text());
      } catch {
        throw new Error("That file isn't valid JSON. Choose a backup downloaded from this page.");
      }
      const preview = await previewBackup(json);
      if (!preview.ok) throw new Error(`This backup can't be used: ${preview.error}`);
      const ok = await confirm({
        title: "Replace all content with this backup?",
        body: (
          <div className="grid gap-2">
            <p>Backup from {new Date(preview.data.exportedAt).toLocaleString()}. This will replace:</p>
            <ul className="list-disc pl-5">
              {preview.data.summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p>Messages, media files and your login are not changed.</p>
          </div>
        ),
        confirmLabel: "Replace content",
        danger: true,
        typeToConfirm: "REPLACE",
      });
      if (ok) await run(() => importBackup(json, "REPLACE"), { success: "Backup restored · live site updated" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="grid max-w-3xl gap-6">
      <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">Tip: download a backup once a month and keep it somewhere safe.</p>
      <Panel title="Download a backup" description="All your content and settings as one .json file. Images stay on ImageKit; the backup stores their links.">
        <div>
          <a href="/api/backup/export" className={buttonClass("primary", "md")} download>
            <Download aria-hidden="true" /> Download backup (.json)
          </a>
        </div>
      </Panel>
      <Panel title="Restore a backup" description="Upload a backup file. You'll see what it contains before anything changes.">
        <div>
          <Button onClick={() => input.current?.click()} loading={busy || pending}>
            <Upload aria-hidden="true" /> Choose backup file
          </Button>
          <input ref={input} type="file" accept="application/json,.json" className="sr-only" aria-label="Choose backup file" onChange={(e) => void onFile(e.target.files?.[0])} />
        </div>
      </Panel>
      <Panel title="Reset to starter content" description="Puts back the original content from when the site was set up. Keeps your login, messages and media files.">
        <div>
          <Button
            variant="danger"
            loading={pending}
            onClick={async () => {
              const ok = await confirm({ title: "Reset all content?", body: "Every game, skill, heading and setting goes back to the starter content. Download a backup first if you might want your current content back.", confirmLabel: "Reset content", danger: true, typeToConfirm: "REPLACE" });
              if (ok) await run(() => resetToSeed("REPLACE"), { success: "Content reset to the starter content" });
            }}
          >
            <RotateCcw aria-hidden="true" /> Reset to starter content
          </Button>
        </div>
      </Panel>
    </div>
  );
}
