"use client";

import { Briefcase } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { CrudList } from "@/components/admin/crud-list";
import { MarkdownField } from "@/components/admin/markdown-field";
import { useAction } from "@/components/admin/use-action";
import { errorAt } from "@/components/admin/use-editor-form";
import { Badge, Field, Input, Select } from "@/components/ui/inputs";
import { SwitchRow } from "@/components/ui/switch";
import { EXPERIENCE_LABELS, EXPERIENCE_TYPES } from "@/lib/constants";
import type { ExperienceDTO, YearMonth } from "@/lib/types";
import { MONTHS, formatPeriod } from "@/lib/utils/formatPeriod";
import { experienceSchema, type ExperienceInput } from "@/lib/validation/content";
import { deleteExperience, reorderExperiences, saveExperience } from "@/server/actions/lists";
import { updateDisplay } from "@/server/actions/settings";

function DateRow({ label, value, onChange, idp, error }: { label: string; value: YearMonth | null; onChange: (v: YearMonth | null) => void; idp: string; error?: string }) {
  return (
    <Field label={label} htmlFor={`${idp}-year`} error={error}>
      <div className="grid grid-cols-[1fr_110px] gap-2">
        <Select aria-label={`${label} month`} value={value?.month ?? ""} disabled={!value} onChange={(e) => value && onChange({ ...value, month: e.target.value ? Number(e.target.value) : null })}>
          <option value="">Month (optional)</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </Select>
        <Input
          id={`${idp}-year`}
          type="number"
          inputMode="numeric"
          placeholder="Year"
          min={1950}
          max={2100}
          value={value?.year ?? ""}
          onChange={(e) => onChange(e.target.value ? { month: value?.month ?? null, year: Number(e.target.value) } : null)}
        />
      </div>
    </Field>
  );
}

export function ExperienceEditor({ items, sort }: { items: ExperienceDTO[]; sort: "manual" | "newest" }) {
  const [auto, setAuto] = useState(sort === "newest");
  const { run } = useAction();
  return (
    <div className="grid gap-5">
      <SwitchRow
        id="auto-sort"
        label="Sort automatically by date (newest first)"
        hint={auto ? "Dragging is turned off while this is on." : "Drag entries into any order you like."}
        checked={auto}
        onCheckedChange={async (v) => {
          setAuto(v);
          const r = await run(() => updateDisplay({ experienceSort: v ? "newest" : "manual" }));
          if (!r.ok) setAuto(!v);
        }}
      />
      <CrudList<ExperienceDTO, typeof experienceSchema>
        items={items}
        schema={experienceSchema}
        noun="entry"
        emptyIcon={<Briefcase />}
        emptyText="No experience yet"
        sortDisabled={auto}
        save={saveExperience}
        remove={deleteExperience}
        reorder={reorderExperiences}
        name={(x) => x.role}
        summary={(x) => (
          <span className="grid gap-0.5">
            <span className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{EXPERIENCE_LABELS[x.type]}</Badge>
              <span className="font-semibold">{x.role}</span>
            </span>
            <span className="text-sm text-muted">
              {x.organization}
              {formatPeriod(x) ? ` · ${formatPeriod(x)}` : ""}
            </span>
          </span>
        )}
        toForm={(x): ExperienceInput => ({
          type: x?.type ?? "job",
          role: x?.role ?? "",
          organization: x?.organization ?? "",
          location: x?.location ?? "",
          url: x?.url ?? "",
          start: x?.start ?? { month: null, year: new Date().getFullYear() },
          end: x?.end ?? null,
          current: x?.current ?? false,
          periodOverride: x?.periodOverride ?? "",
          description: x?.description ?? "",
        })}
        renderForm={({ register, control, watch, formState }) => {
          const e = (p: string) => errorAt(formState.errors, p);
          const current = watch("current");
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type" htmlFor="x-type">
                  <Select id="x-type" {...register("type")}>
                    {EXPERIENCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {EXPERIENCE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Role / title" htmlFor="x-role" required error={e("role")}>
                  <Input id="x-role" {...register("role")} aria-invalid={!!e("role")} />
                </Field>
                <Field label="Organisation" htmlFor="x-org" required error={e("organization")} hint="Company, school, game jam…">
                  <Input id="x-org" {...register("organization")} aria-invalid={!!e("organization")} />
                </Field>
                <Field label="Location" htmlFor="x-loc">
                  <Input id="x-loc" {...register("location")} />
                </Field>
              </div>
              <Field label="Link" htmlFor="x-url" error={e("url")} hint="Optional. Makes the organisation name clickable.">
                <Input id="x-url" type="url" placeholder="https://" {...register("url")} aria-invalid={!!e("url")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller control={control} name="start" render={({ field }) => <DateRow label="Start" idp="x-start" value={field.value} onChange={field.onChange} error={e("start")} />} />
                {!current ? <Controller control={control} name="end" render={({ field }) => <DateRow label="End" idp="x-end" value={field.value} onChange={field.onChange} />} /> : null}
              </div>
              <Controller control={control} name="current" render={({ field }) => <SwitchRow id="x-current" label="I currently do this" hint="Shows “Present” as the end date." checked={field.value} onCheckedChange={field.onChange} />} />
              <details className="rounded-xl border border-border px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold">Advanced: custom period text</summary>
                <Field label="Period override" htmlFor="x-po" className="mt-3" hint="Replaces the dates, e.g. “Summer 2023” or “Earlier”. Leave empty to use the dates.">
                  <Input id="x-po" {...register("periodOverride")} />
                </Field>
              </details>
              <Field label="Description" htmlFor="x-desc">
                <Controller control={control} name="description" render={({ field }) => <MarkdownField id="x-desc" value={field.value} onChange={field.onChange} rows={5} maxLength={3000} />} />
              </Field>
            </>
          );
        }}
      />
    </div>
  );
}
