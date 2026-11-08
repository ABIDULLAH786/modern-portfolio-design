"use client";

import { Switch as RSwitch } from "radix-ui";
import { cn } from "@/lib/utils/cn";

export function Switch({ checked, onCheckedChange, id, disabled, label, className }: { checked: boolean; onCheckedChange: (v: boolean) => void; id?: string; disabled?: boolean; label?: string; className?: string }) {
  return (
    <RSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "relative h-6 w-[42px] shrink-0 cursor-pointer rounded-full border border-border bg-surface-2 transition data-[state=checked]:border-transparent data-[state=checked]:bg-primary disabled:opacity-50",
        className,
      )}
    >
      <RSwitch.Thumb className="block size-[18px] translate-x-[2px] rounded-full bg-text transition data-[state=checked]:translate-x-[20px] data-[state=checked]:bg-on-primary" />
    </RSwitch.Root>
  );
}

/** A labelled row with a switch on the right. */
export function SwitchRow({ label, hint, checked, onCheckedChange, id, disabled }: { label: string; hint?: string; checked: boolean; onCheckedChange: (v: boolean) => void; id: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg/40 px-4 py-3">
      <div>
        <label htmlFor={id} className="cursor-pointer text-[0.95rem] font-medium">
          {label}
        </label>
        {hint ? <p className="text-[0.82rem] text-muted">{hint}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
