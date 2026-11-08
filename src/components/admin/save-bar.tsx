"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUnsavedChanges } from "./leave-guard";

/** Sticky "unsaved changes" bar with Ctrl/Cmd+S. Registers the form with the leave guard. */
export function SaveBar({ id, dirty, saving, onSave, onDiscard, label = "Save changes" }: { id: string; dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void; label?: string }) {
  useUnsavedChanges(id, dirty);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, onSave]);

  return (
    <div
      className={`sticky bottom-[72px] z-30 mt-6 transition lg:bottom-4 ${dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      aria-hidden={!dirty}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-[var(--glass-strong)] px-4 py-3 shadow-2xl backdrop-blur-md">
        <p className="text-sm font-medium" role="status">
          <span className="mr-2 inline-block size-2 rounded-full bg-warning align-middle" aria-hidden="true" />
          You have unsaved changes
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={onDiscard} disabled={saving} tabIndex={dirty ? 0 : -1}>
            Discard
          </Button>
          <Button size="sm" variant="primary" onClick={onSave} loading={saving} tabIndex={dirty ? 0 : -1}>
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}
