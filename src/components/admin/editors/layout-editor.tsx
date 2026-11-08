"use client";

import { Lock } from "lucide-react";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { ChipInput } from "@/components/admin/chip-input";
import { SaveBar } from "@/components/admin/save-bar";
import { ListRow, SortableList } from "@/components/admin/sortable-list";
import { errorAt, useEditorForm } from "@/components/admin/use-editor-form";
import { Field, Input, Panel, Select, Textarea } from "@/components/ui/inputs";
import { Switch, SwitchRow } from "@/components/ui/switch";
import type { SectionKey } from "@/lib/constants";
import type { SettingsDTO } from "@/lib/types";
import { copySchema, displaySchema, sectionsSchema } from "@/lib/validation/settings";
import { updateLayout } from "@/server/actions/settings";

const schema = z.object({ sections: sectionsSchema, copy: copySchema, display: displaySchema });
type LayoutInput = z.infer<typeof schema>;

const NAMES: Record<SectionKey, string> = { hero: "Hero", about: "About", games: "Games", skills: "Skills", experience: "Experience", services: "Services", testimonials: "Testimonials", contact: "Contact" };
const HEADINGS: Array<Exclude<SectionKey, "hero">> = ["about", "games", "skills", "experience", "services", "testimonials", "contact"];

export function LayoutEditor({ settings }: { settings: SettingsDTO }) {
  const { form, submit, pending, dirty, discard } = useEditorForm(schema, { sections: settings.sections, copy: settings.copy, display: settings.display } as LayoutInput, updateLayout);
  const { register, control, watch, setValue, formState } = form;
  const e = (p: string) => errorAt(formState.errors, p);
  const sections = watch("sections");
  const hero = sections.find((s) => s.key === "hero");
  const rest = sections.filter((s) => s.key !== "hero");
  const idx = (k: SectionKey) => sections.findIndex((s) => s.key === k);
  const setSections = (next: LayoutInput["sections"]) => setValue("sections", next.map((s, i) => ({ ...s, order: i })), { shouldDirty: true });

  return (
    <form onSubmit={(ev) => (ev.preventDefault(), void submit())} noValidate className="grid gap-6">
      <Panel title="Sections" description="Drag to reorder, switch off to hide, and rename the menu labels. The hero always comes first.">
        <ul className="grid gap-2">
          {hero ? (
            <li>
              <ListRow className="opacity-90">
                <div className="flex items-center gap-3">
                  <Lock className="size-4 text-muted" aria-label="Pinned first" />
                  <span className="w-28 font-semibold">{NAMES.hero}</span>
                  <Input aria-label="Hero menu label" className="max-w-56 py-1.5" {...register(`sections.${idx("hero")}.label`)} />
                  <span className="ml-auto text-xs text-muted">Always visible</span>
                </div>
              </ListRow>
            </li>
          ) : null}
        </ul>
        <SortableList
          label="Sections"
          items={rest.map((s) => ({ ...s, id: s.key }))}
          onReorder={(next) => setSections([...(hero ? [hero] : []), ...next.map(({ id: _id, ...s }) => (void _id, s))])}
          render={(s) => (
            <ListRow
              actions={
                <Switch
                  checked={s.visible}
                  label={`Show ${NAMES[s.key]} section`}
                  onCheckedChange={(v) => setValue(`sections.${idx(s.key)}.visible`, v, { shouldDirty: true })}
                />
              }
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold">{NAMES[s.key]}</span>
                <Input aria-label={`${NAMES[s.key]} menu label`} className="max-w-56 py-1.5" {...register(`sections.${idx(s.key)}.label`)} aria-invalid={!!e(`sections.${idx(s.key)}.label`)} />
                {!s.visible ? <span className="text-xs text-muted">Hidden</span> : null}
                {s.key === "testimonials" && s.visible ? <span className="text-xs text-muted">Shown only when a testimonial is published</span> : null}
              </div>
            </ListRow>
          )}
        />
      </Panel>

      <Panel title="Headings & text" description="The last two words of each title get the gradient colour.">
        <div className="grid gap-2">
          {HEADINGS.map((k) => (
            <details key={k} className="group rounded-xl border border-border open:bg-bg/30">
              <summary className="cursor-pointer px-4 py-3 font-semibold">{NAMES[k]}</summary>
              <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
                <Field label="Eyebrow" htmlFor={`${k}-eb`} hint="Small label above the title">
                  <Input id={`${k}-eb`} {...register(`copy.${k}.eyebrow`)} />
                </Field>
                <Field label="Title" htmlFor={`${k}-t`} error={e(`copy.${k}.title`)} required>
                  <Input id={`${k}-t`} {...register(`copy.${k}.title`)} aria-invalid={!!e(`copy.${k}.title`)} />
                </Field>
                <Field label="Subtitle" htmlFor={`${k}-s`} className="sm:col-span-2">
                  <Textarea id={`${k}-s`} rows={2} {...register(`copy.${k}.subtitle`)} />
                </Field>
              </div>
            </details>
          ))}
        </div>
      </Panel>

      <Panel title="Contact form">
        <Field label="Project type options" htmlFor="ptypes" error={e("copy.contact.projectTypes")}>
          <Controller control={control} name="copy.contact.projectTypes" render={({ field }) => <ChipInput id="ptypes" value={field.value} onChange={field.onChange} max={12} maxLength={60} />} />
        </Field>
        <Controller control={control} name="copy.contact.budgetEnabled" render={({ field }) => <SwitchRow id="budget" label="Show a budget field" checked={field.value} onCheckedChange={field.onChange} />} />
        {watch("copy.contact.budgetEnabled") ? (
          <Field label="Budget options" htmlFor="budgets">
            <Controller control={control} name="copy.contact.budgetOptions" render={({ field }) => <ChipInput id="budgets" value={field.value} onChange={field.onChange} max={12} maxLength={60} />} />
          </Field>
        ) : null}
        <Field label="Success message" htmlFor="succ" error={e("copy.contact.successMessage")} hint="Shown after a visitor sends a message.">
          <Input id="succ" {...register("copy.contact.successMessage")} aria-invalid={!!e("copy.contact.successMessage")} />
        </Field>
        <Controller control={control} name="copy.contact.autoReply.enabled" render={({ field }) => <SwitchRow id="auto" label="Send an automatic reply to visitors" hint="Needs a verified email domain in Resend to reach visitors." checked={field.value} onCheckedChange={field.onChange} />} />
        {watch("copy.contact.autoReply.enabled") ? (
          <div className="grid gap-4">
            <Field label="Auto-reply subject" htmlFor="ar-s">
              <Input id="ar-s" {...register("copy.contact.autoReply.subject")} />
            </Field>
            <Field label="Auto-reply message" htmlFor="ar-b" hint="Use {name} to insert the visitor's name.">
              <Textarea id="ar-b" rows={5} {...register("copy.contact.autoReply.body")} />
            </Field>
          </div>
        ) : null}
      </Panel>

      <Panel title="Display options">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Games shown on the home page" htmlFor="gh" hint="If you have more, a “View all games” button appears.">
            <Input id="gh" type="number" min={3} max={12} {...register("display.gamesOnHome", { valueAsNumber: true })} />
          </Field>
          <Field label="Experience order" htmlFor="es">
            <Select id="es" {...register("display.experienceSort")}>
              <option value="manual">Manual (drag & drop)</option>
              <option value="newest">Newest first (automatic)</option>
            </Select>
          </Field>
        </div>
        <Controller control={control} name="display.featuredFirst" render={({ field }) => <SwitchRow id="ff" label="Show featured games first" checked={field.value} onCheckedChange={field.onChange} />} />
        <Controller control={control} name="display.showSkillPercent" render={({ field }) => <SwitchRow id="sp" label="Show skill percentages" checked={field.value} onCheckedChange={field.onChange} />} />
      </Panel>
      <SaveBar id="layout" dirty={dirty} saving={pending} onSave={() => void submit()} onDiscard={discard} />
    </form>
  );
}
