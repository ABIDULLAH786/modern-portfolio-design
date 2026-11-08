"use client";

import { Quote } from "lucide-react";
import { Controller } from "react-hook-form";
import { CrudList } from "@/components/admin/crud-list";
import { ImageField } from "@/components/admin/image-field";
import { useAction } from "@/components/admin/use-action";
import { errorAt } from "@/components/admin/use-editor-form";
import { Badge, Field, Input, Textarea } from "@/components/ui/inputs";
import { Switch, SwitchRow } from "@/components/ui/switch";
import type { TestimonialDTO } from "@/lib/types";
import { testimonialSchema } from "@/lib/validation/content";
import { deleteTestimonial, reorderTestimonials, saveTestimonial, setTestimonialPublished } from "@/server/actions/lists";

export function TestimonialsEditor({ items }: { items: TestimonialDTO[] }) {
  const { run } = useAction();
  return (
    <CrudList<TestimonialDTO, typeof testimonialSchema>
      items={items}
      schema={testimonialSchema}
      noun="testimonial"
      emptyIcon={<Quote />}
      emptyText="No testimonials yet"
      save={saveTestimonial}
      remove={deleteTestimonial}
      reorder={reorderTestimonials}
      name={(x) => x.name}
      rowExtra={(x, update) => (
        <Switch
          checked={x.published}
          label={`Published: ${x.name}`}
          onCheckedChange={async (v) => {
            update({ ...x, published: v });
            const r = await run(() => setTestimonialPublished(x.id, v), { success: v ? "Published" : "Hidden", refresh: false });
            if (!r.ok) update(x);
          }}
        />
      )}
      summary={(x) => (
        <span className="grid gap-0.5">
          <span className="flex items-center gap-2">
            <span className="font-semibold">{x.name}</span>
            {!x.published ? <Badge>Hidden</Badge> : null}
          </span>
          <span className="truncate text-sm text-muted">“{x.quote}”</span>
        </span>
      )}
      toForm={(x) => ({ quote: x?.quote ?? "", name: x?.name ?? "", role: x?.role ?? "", company: x?.company ?? "", avatar: x?.avatar ?? null, url: x?.url ?? "", published: x?.published ?? true })}
      renderForm={({ register, control, watch, formState }) => {
        const e = (p: string) => errorAt(formState.errors, p);
        return (
          <>
            <Field label="Quote" htmlFor="t-quote" required error={e("quote")} counter={`${watch("quote").length}/400`}>
              <Textarea id="t-quote" rows={4} maxLength={400} {...register("quote")} aria-invalid={!!e("quote")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Name" htmlFor="t-name" required error={e("name")}>
                <Input id="t-name" {...register("name")} aria-invalid={!!e("name")} />
              </Field>
              <Field label="Role" htmlFor="t-role">
                <Input id="t-role" {...register("role")} />
              </Field>
              <Field label="Company" htmlFor="t-co">
                <Input id="t-co" {...register("company")} />
              </Field>
            </div>
            <Field label="Link" htmlFor="t-url" error={e("url")} hint="Optional, e.g. their LinkedIn.">
              <Input id="t-url" type="url" placeholder="https://" {...register("url")} aria-invalid={!!e("url")} />
            </Field>
            <Controller control={control} name="avatar" render={({ field }) => <ImageField label="Photo (optional)" kind="testimonial" value={field.value} onChange={field.onChange} />} />
            <Controller control={control} name="published" render={({ field }) => <SwitchRow id="t-pub" label="Published" checked={field.value} onCheckedChange={field.onChange} />} />
          </>
        );
      }}
    />
  );
}
