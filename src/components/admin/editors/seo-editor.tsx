"use client";

import { Controller } from "react-hook-form";
import { ChipInput } from "@/components/admin/chip-input";
import { ImageField } from "@/components/admin/image-field";
import { SaveBar } from "@/components/admin/save-bar";
import { errorAt, useEditorForm } from "@/components/admin/use-editor-form";
import { Field, Input, Panel, Textarea } from "@/components/ui/inputs";
import { SwitchRow } from "@/components/ui/switch";
import type { SeoDTO } from "@/lib/types";
import { seoSchema } from "@/lib/validation/settings";
import { updateSeo } from "@/server/actions/settings";

export function SeoEditor({ seo, siteUrl, analyticsAvailable }: { seo: SeoDTO; siteUrl: string; analyticsAvailable: boolean }) {
  const { form, submit, pending, dirty, discard } = useEditorForm(seoSchema, seo, updateSeo);
  const { register, control, watch, formState } = form;
  const e = (p: string) => errorAt(formState.errors, p);
  const v = watch();
  const descLen = v.description.length;
  const host = siteUrl.replace(/^https?:\/\//, "");

  return (
    <form onSubmit={(ev) => (ev.preventDefault(), void submit())} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-6">
        <Panel title="Search engines">
          <Field label="Site title" htmlFor="st" required error={e("siteTitle")} hint="Shown in browser tabs and Google results.">
            <Input id="st" {...register("siteTitle")} aria-invalid={!!e("siteTitle")} />
          </Field>
          <Field
            label="Meta description"
            htmlFor="md"
            required
            error={e("description")}
            counter={<span className={descLen >= 120 && descLen <= 160 ? "text-success" : "text-warning"}>{descLen} (ideal 120–160)</span>}
          >
            <Textarea id="md" rows={3} maxLength={300} {...register("description")} aria-invalid={!!e("description")} />
          </Field>
          <Field label="Keywords" htmlFor="kw">
            <Controller control={control} name="keywords" render={({ field }) => <ChipInput id="kw" value={field.value} onChange={field.onChange} max={20} maxLength={50} />} />
          </Field>
          <Field label="Google Search Console verification code" htmlFor="gv" hint="Paste only the content value of the meta tag Google gives you.">
            <Input id="gv" {...register("googleVerification")} placeholder="abc123…" />
          </Field>
        </Panel>
        <Panel title="Images">
          <Controller
            control={control}
            name="ogImage"
            render={({ field }) => <ImageField label="Social share image" kind="seo" value={field.value} onChange={field.onChange} aspect="aspect-[1200/630]" hint="1200×630. Shown when your site is shared. If empty, a generated image is used." />}
          />
          <Controller control={control} name="favicon" render={({ field }) => <ImageField label="Favicon" kind="seo" value={field.value} onChange={field.onChange} hint="Square PNG, 512×512 or larger. If empty, your initials are used." />} />
        </Panel>
        <Panel title="Analytics">
          <Controller
            control={control}
            name="analyticsEnabled"
            render={({ field }) => (
              <SwitchRow
                id="an"
                label="Enable analytics"
                hint={analyticsAvailable ? "Counts play-button clicks per game (shown on the Overview) and loads Vercel Web Analytics." : "Counts play-button clicks per game (shown on the Overview). Vercel Web Analytics also needs NEXT_PUBLIC_ANALYTICS=1."}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </Panel>
      </div>
      <aside className="grid gap-6 lg:sticky lg:top-20">
        <Panel title="Google preview">
          <div className="rounded-xl bg-white p-4 font-[arial,sans-serif] text-left">
            <p className="truncate text-xs text-[#202124]">{host}</p>
            <p className="truncate text-lg text-[#1a0dab]">{v.siteTitle || "Site title"}</p>
            <p className="line-clamp-2 text-sm text-[#4d5156]">{v.description || "Description"}</p>
          </div>
        </Panel>
        <Panel title="Social card preview">
          <div className="overflow-hidden rounded-xl border border-border bg-bg">
            {/* eslint-disable-next-line @next/next/no-img-element -- preview of the share image */}
            <img src={v.ogImage ? `${v.ogImage.url}${v.ogImage.url.includes("?") ? "&" : "?"}tr=w-600` : "/og"} alt="" className="aspect-[1200/630] w-full object-cover" />
            <div className="p-3">
              <p className="text-xs text-muted uppercase">{host}</p>
              <p className="truncate font-semibold">{v.siteTitle}</p>
              <p className="line-clamp-2 text-sm text-muted">{v.description}</p>
            </div>
          </div>
        </Panel>
      </aside>
      <div className="lg:col-span-2">
        <SaveBar id="seo" dirty={dirty} saving={pending} onSave={() => void submit()} onDiscard={discard} />
      </div>
    </form>
  );
}
