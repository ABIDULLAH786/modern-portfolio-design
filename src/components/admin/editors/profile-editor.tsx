"use client";

import { Plus, Trash2 } from "lucide-react";
import { Tabs } from "radix-ui";
import { Controller } from "react-hook-form";
import { ChipInput } from "@/components/admin/chip-input";
import { ImageField } from "@/components/admin/image-field";
import { MarkdownField } from "@/components/admin/markdown-field";
import { ResumeField } from "@/components/admin/resume-field";
import { SaveBar } from "@/components/admin/save-bar";
import { ListRow, SortableList } from "@/components/admin/sortable-list";
import { errorAt, useEditorForm } from "@/components/admin/use-editor-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Panel, Select, Textarea } from "@/components/ui/inputs";
import { SwitchRow } from "@/components/ui/switch";
import { MAX_STATS, SOCIAL_LABELS, SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";
import type { ProfileDTO } from "@/lib/types";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";
import { updateProfile } from "@/server/actions/profile";

const TABS = [
  ["basics", "Basics"],
  ["hero", "Hero"],
  ["contact", "Contact"],
  ["social", "Social links"],
  ["stats", "Stats"],
] as const;

const newId = () => Math.random().toString(36).slice(2, 10);

function toInput(p: ProfileDTO): ProfileInput {
  return {
    name: p.name,
    role: p.role,
    tagline: p.tagline,
    bio: p.bio,
    avatar: p.avatar,
    location: p.location,
    email: p.email,
    phone: p.phone,
    available: p.available,
    availabilityText: p.availabilityText,
    heroBadge: p.heroBadge,
    busyBadge: p.busyBadge,
    primaryEngine: p.primaryEngine,
    heroChip3: p.heroChip3,
    aboutExternal: p.aboutExternal,
    languages: p.languages,
    socials: p.socials,
    stats: p.stats,
  };
}

export function ProfileEditor({ profile, initialTab }: { profile: ProfileDTO; initialTab: string }) {
  const { form, submit, pending, dirty, discard } = useEditorForm(profileSchema, toInput(profile), updateProfile);
  const { register, control, watch, setValue, formState } = form;
  const e = (p: string) => errorAt(formState.errors, p);
  const socials = watch("socials");
  const stats = watch("stats");
  const set = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) => setValue(k, v as never, { shouldDirty: true, shouldValidate: true });
  const tab = TABS.some(([t]) => t === initialTab) ? initialTab : "basics";
  const tabHasError = (t: string) =>
    ({
      basics: ["name", "role", "bio", "location", "avatar", "languages"],
      hero: ["tagline", "heroBadge", "busyBadge", "primaryEngine", "heroChip3", "aboutExternal"],
      contact: ["email", "phone", "availabilityText"],
      social: ["socials"],
      stats: ["stats"],
    })[t]?.some((k) => k in formState.errors);

  return (
    <form onSubmit={(ev) => (ev.preventDefault(), void submit())} noValidate>
      <Tabs.Root defaultValue={tab}>
        <Tabs.List aria-label="Profile sections" className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1">
          {TABS.map(([v, l]) => (
            <Tabs.Trigger key={v} value={v} className="relative shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-muted data-[state=active]:bg-primary-soft data-[state=active]:text-primary">
              {l}
              {tabHasError(v) ? <span className="ml-1.5 inline-block size-2 rounded-full bg-danger" aria-label="has errors" /> : null}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="basics" className="grid gap-6">
          <Panel title="Identity">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="name" required error={e("name")}>
                <Input id="name" {...register("name")} aria-invalid={!!e("name")} />
              </Field>
              <Field label="Role / title" htmlFor="role" required error={e("role")} hint="For example: Mobile Game Developer">
                <Input id="role" {...register("role")} aria-invalid={!!e("role")} />
              </Field>
            </div>
            <Controller control={control} name="avatar" render={({ field }) => <ImageField label="Profile photo" kind="avatar" value={field.value} onChange={field.onChange} hint="A square photo works best (800×800 or larger)." />} />
            <Field label="About me (bio)" htmlFor="bio" required error={e("bio")} hint="Shown in the About section. Use a blank line between paragraphs.">
              <Controller control={control} name="bio" render={({ field }) => <MarkdownField id="bio" value={field.value} onChange={field.onChange} maxLength={5000} invalid={!!e("bio")} />} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Location" htmlFor="location" error={e("location")} hint="Shown in About and Contact.">
                <Input id="location" {...register("location")} />
              </Field>
              <Field label="Languages" htmlFor="languages" hint="Shown in the About section. Optional.">
                <Controller control={control} name="languages" render={({ field }) => <ChipInput id="languages" value={field.value} onChange={field.onChange} max={10} />} />
              </Field>
            </div>
          </Panel>
          <Panel title="Resume">
            <ResumeField value={profile.cv} />
          </Panel>
        </Tabs.Content>

        <Tabs.Content value="hero" className="grid gap-6">
          <Panel title="Hero section" description="The first thing visitors see.">
            <Field label="Tagline" htmlFor="tagline" required error={e("tagline")} counter={`${watch("tagline").length}/200`}>
              <Textarea id="tagline" rows={3} maxLength={200} {...register("tagline")} aria-invalid={!!e("tagline")} />
            </Field>
            <Controller control={control} name="available" render={({ field }) => <SwitchRow id="available" label="Available for work" hint="Shows a green dot (or amber when off) in the hero badge." checked={field.value} onCheckedChange={field.onChange} />} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Badge text when available" htmlFor="heroBadge" error={e("heroBadge")}>
                <Input id="heroBadge" {...register("heroBadge")} />
              </Field>
              <Field label="Badge text when busy" htmlFor="busyBadge" error={e("busyBadge")}>
                <Input id="busyBadge" {...register("busyBadge")} />
              </Field>
            </div>
          </Panel>
          <Panel title="Floating chips" description="The three small cards around your photo. The first one counts your published games automatically.">
            <Field label="Main engine (chip 2)" htmlFor="primaryEngine" hint="Leave empty to use your first skill.">
              <Input id="primaryEngine" {...register("primaryEngine")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Chip 3 title" htmlFor="chip3t" error={e("heroChip3.title")}>
                <Input id="chip3t" {...register("heroChip3.title")} />
              </Field>
              <Field label="Chip 3 subtitle" htmlFor="chip3s" error={e("heroChip3.subtitle")}>
                <Input id="chip3s" {...register("heroChip3.subtitle")} />
              </Field>
            </div>
          </Panel>
          <Panel title="About section button" description="An optional extra button next to “Get in touch”.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Button label" htmlFor="extLabel" error={e("aboutExternal.label")}>
                <Input id="extLabel" {...register("aboutExternal.label")} placeholder="itch.io profile" />
              </Field>
              <Field label="Button link" htmlFor="extUrl" error={e("aboutExternal.url")}>
                <Input id="extUrl" type="url" {...register("aboutExternal.url")} placeholder="https://" aria-invalid={!!e("aboutExternal.url")} />
              </Field>
            </div>
          </Panel>
        </Tabs.Content>

        <Tabs.Content value="contact" className="grid gap-6">
          <Panel title="Contact details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Public email" htmlFor="email" required error={e("email")} hint="Shown on the site, and where contact-form messages are sent.">
                <Input id="email" type="email" {...register("email")} aria-invalid={!!e("email")} />
              </Field>
              <Field label="Phone" htmlFor="phone" error={e("phone")} hint="Optional. Only shown if filled in.">
                <Input id="phone" type="tel" {...register("phone")} />
              </Field>
            </div>
            <Field label="Availability text" htmlFor="availabilityText" error={e("availabilityText")} hint="Shown in the About and Contact sections.">
              <Input id="availabilityText" {...register("availabilityText")} />
            </Field>
          </Panel>
        </Tabs.Content>

        <Tabs.Content value="social" className="grid gap-6">
          <Panel
            title="Social links"
            description="Shown in the hero and footer. Drag to reorder."
            actions={
              <Button size="sm" onClick={() => set("socials", [...socials, { id: newId(), platform: "website", label: "Website", url: "https://" }])} disabled={socials.length >= 16}>
                <Plus aria-hidden="true" /> Add link
              </Button>
            }
          >
            {socials.length ? (
              <SortableList
                label="Social links"
                items={socials}
                onReorder={(next) => set("socials", next)}
                render={(s, i) => (
                  <ListRow
                    actions={
                      <Button size="icon" variant="danger" aria-label={`Delete ${s.label}`} onClick={() => set("socials", socials.filter((x) => x.id !== s.id))}>
                        <Trash2 />
                      </Button>
                    }
                  >
                    <div className="grid gap-2 sm:grid-cols-[150px_1fr_1.5fr]">
                      <Select
                        aria-label="Platform"
                        value={s.platform}
                        onChange={(ev) => {
                          const platform = ev.target.value as SocialPlatform;
                          set("socials", socials.map((x) => (x.id === s.id ? { ...x, platform, label: x.label === SOCIAL_LABELS[x.platform] || !x.label ? SOCIAL_LABELS[platform] : x.label } : x)));
                        }}
                      >
                        {SOCIAL_PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {SOCIAL_LABELS[p]}
                          </option>
                        ))}
                      </Select>
                      <Input aria-label="Label" {...register(`socials.${i}.label`)} aria-invalid={!!e(`socials.${i}.label`)} />
                      <Input aria-label="URL" type="url" placeholder="https://" {...register(`socials.${i}.url`)} aria-invalid={!!e(`socials.${i}.url`)} />
                    </div>
                    {e(`socials.${i}.url`) || e(`socials.${i}.label`) ? <p className="mt-1 text-sm text-danger">{e(`socials.${i}.url`) ?? e(`socials.${i}.label`)}</p> : null}
                  </ListRow>
                )}
              />
            ) : (
              <p className="text-sm text-muted">No social links yet.</p>
            )}
          </Panel>
        </Tabs.Content>

        <Tabs.Content value="stats" className="grid gap-6">
          <Panel
            title="About stats"
            description="Big numbers next to your bio. Use real numbers only. With no stats, the bio fills the full width."
            actions={
              <Button size="sm" onClick={() => set("stats", [...stats, { id: newId(), value: "1", label: "New stat" }])} disabled={stats.length >= MAX_STATS}>
                <Plus aria-hidden="true" /> Add stat
              </Button>
            }
          >
            {stats.length ? (
              <SortableList
                label="Stats"
                items={stats}
                onReorder={(next) => set("stats", next)}
                render={(s, i) => (
                  <ListRow
                    actions={
                      <Button size="icon" variant="danger" aria-label={`Delete stat ${s.label}`} onClick={() => set("stats", stats.filter((x) => x.id !== s.id))}>
                        <Trash2 />
                      </Button>
                    }
                  >
                    <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                      <Input aria-label="Big value" maxLength={10} placeholder="3+" {...register(`stats.${i}.value`)} aria-invalid={!!e(`stats.${i}.value`)} />
                      <Input aria-label="Label" maxLength={40} placeholder="Games published" {...register(`stats.${i}.label`)} aria-invalid={!!e(`stats.${i}.label`)} />
                    </div>
                  </ListRow>
                )}
              />
            ) : (
              <p className="text-sm text-muted">No stats. The bio card will use the full width.</p>
            )}
            <p className="text-xs text-muted">
              {stats.length}/{MAX_STATS}
            </p>
          </Panel>
        </Tabs.Content>
      </Tabs.Root>
      <SaveBar id="profile" dirty={dirty} saving={pending} onSave={() => void submit()} onDiscard={discard} />
    </form>
  );
}
