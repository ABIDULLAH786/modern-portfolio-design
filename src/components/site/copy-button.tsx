"use client";

import { Copy } from "lucide-react";
import { toast } from "./toaster";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  return (
    <button
      type="button"
      className="mini"
      aria-label={label}
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast(done);
        } catch {
          toast("Copy blocked: select the text and copy it manually");
        }
      }}
    >
      <Copy />
    </button>
  );
}
