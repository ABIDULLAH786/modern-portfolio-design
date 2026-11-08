"use client";

import { X } from "lucide-react";
import { useState } from "react";

/** Chips: Enter or comma adds, Backspace on empty removes the last one. */
export function ChipInput({ id, value, onChange, max = 20, placeholder = "Type and press Enter", suggestions = [], maxLength = 40 }: { id: string; value: string[]; onChange: (v: string[]) => void; max?: number; placeholder?: string; suggestions?: string[]; maxLength?: number }) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const v = raw.trim().replace(/,$/, "").trim();
    if (!v || value.some((x) => x.toLowerCase() === v.toLowerCase()) || value.length >= max) return;
    onChange([...value, v.slice(0, maxLength)]);
    setText("");
  };
  const remaining = suggestions.filter((s) => !value.includes(s));
  return (
    <div className="grid gap-2">
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-border bg-bg px-2 py-1.5 focus-within:border-primary focus-within:shadow-[0_0_0_4px_var(--ring)]">
        {value.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 py-1 pr-1 pl-2.5 text-sm">
            {c}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== c))} className="grid size-5 place-items-center rounded text-muted hover:text-danger" aria-label={`Remove ${c}`}>
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          maxLength={maxLength}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => text && add(text)}
          placeholder={value.length >= max ? `Maximum ${max}` : placeholder}
          disabled={value.length >= max}
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-[0.95rem] outline-none"
        />
      </div>
      {remaining.length ? (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted hover:border-primary hover:text-primary">
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
