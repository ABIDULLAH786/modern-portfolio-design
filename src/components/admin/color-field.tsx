"use client";

import { Popover } from "radix-ui";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

/** Swatch button → popover colour picker with a hex input. */
export function ColorField({ label, value, onChange, overridden }: { label: string; value: string; onChange: (hex: string) => void; overridden?: boolean }) {
  // Local text only while the hex box is being edited; otherwise show the real value.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? value;
  return (
    <Popover.Root>
      <div className="grid justify-items-center gap-1.5 text-center">
        <Popover.Trigger asChild>
          <button type="button" className="h-11 w-full rounded-xl border border-border p-1 hover:border-primary" aria-label={`${label}: ${value}. Change colour`}>
            <span className="block size-full rounded-[9px]" style={{ background: value }} />
          </button>
        </Popover.Trigger>
        <span className="text-xs text-muted">
          {label}
          {overridden ? <span className="text-primary"> •</span> : null}
        </span>
      </div>
      <Popover.Portal>
        <Popover.Content sideOffset={8} className="z-[90] grid gap-3 rounded-2xl border border-border bg-surface p-3 shadow-2xl">
          <HexColorPicker color={value} onChange={(c) => onChange(c.toUpperCase())} />
          <input
            value={text}
            onChange={(e) => {
              const v = e.target.value.trim();
              setDraft(v);
              if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toUpperCase());
            }}
            onBlur={() => setDraft(null)}
            className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 font-mono text-sm uppercase outline-none focus:border-primary"
            aria-label={`${label} hex value`}
            maxLength={7}
          />
          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
