"use client";

import { useState } from "react";
import { ICONS } from "@/components/site/icon";
import { Input } from "@/components/ui/inputs";
import { SERVICE_ICONS, type ServiceIcon } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export function IconPicker({ value, onChange }: { value: ServiceIcon; onChange: (v: ServiceIcon) => void }) {
  const [q, setQ] = useState("");
  const list = SERVICE_ICONS.filter((n) => n.includes(q.toLowerCase().trim()));
  return (
    <div className="grid gap-2">
      <Input placeholder="Search icons" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search icons" />
      <div role="radiogroup" aria-label="Icon" className="grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
        {list.map((n) => {
          const Icon = ICONS[n];
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={n.replace(/-/g, " ")}
              title={n}
              onClick={() => onChange(n)}
              className={cn("grid aspect-square place-items-center rounded-xl border text-muted transition hover:text-primary", value === n ? "border-primary bg-primary-soft text-primary" : "border-border")}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
