"use client";

import { Sparkles } from "lucide-react";
import { Controller } from "react-hook-form";
import { CrudList } from "@/components/admin/crud-list";
import { IconPicker } from "@/components/admin/icon-picker";
import { errorAt } from "@/components/admin/use-editor-form";
import { ServiceIconView } from "@/components/site/icon";
import { Field, Input, Textarea } from "@/components/ui/inputs";
import { MAX_SERVICES } from "@/lib/constants";
import type { ServiceDTO } from "@/lib/types";
import { serviceSchema } from "@/lib/validation/content";
import { deleteService, reorderServices, saveService } from "@/server/actions/lists";

export function ServicesEditor({ items }: { items: ServiceDTO[] }) {
  return (
    <CrudList<ServiceDTO, typeof serviceSchema>
      items={items}
      schema={serviceSchema}
      noun="service"
      max={MAX_SERVICES}
      emptyIcon={<Sparkles />}
      emptyText="No services yet. The section is hidden until you add one."
      save={saveService}
      remove={deleteService}
      reorder={reorderServices}
      name={(x) => x.title}
      summary={(x) => (
        <span className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
            <ServiceIconView name={x.icon} />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold">{x.title}</span>
            <span className="block truncate text-sm text-muted">{x.description}</span>
          </span>
        </span>
      )}
      toForm={(x) => ({ title: x?.title ?? "", icon: x?.icon ?? "sparkles", description: x?.description ?? "" })}
      renderForm={({ register, control, watch, formState }) => {
        const e = (p: string) => errorAt(formState.errors, p);
        return (
          <>
            <Field label="Icon">
              <Controller control={control} name="icon" render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />} />
            </Field>
            <Field label="Title" htmlFor="s-title" required error={e("title")}>
              <Input id="s-title" {...register("title")} aria-invalid={!!e("title")} />
            </Field>
            <Field label="Description" htmlFor="s-desc" required error={e("description")} counter={`${watch("description").length}/200`}>
              <Textarea id="s-desc" rows={3} maxLength={200} {...register("description")} aria-invalid={!!e("description")} />
            </Field>
          </>
        );
      }}
    />
  );
}
