"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/inputs";
import type { ActionResult } from "@/lib/types";
import { ListRow, SortableList } from "./sortable-list";
import { useAction } from "./use-action";

export interface CrudConfig<T extends { id: string }, S extends z.ZodType<FieldValues, FieldValues>> {
  items: T[];
  schema: S;
  /** Defaults for a new item, or the form values for an existing one. */
  toForm: (item: T | null) => z.infer<S>;
  save: (id: string | null, values: z.infer<S>) => Promise<ActionResult<T>>;
  remove: (id: string) => Promise<ActionResult>;
  reorder?: (ids: string[]) => Promise<ActionResult>;
  summary: (item: T) => React.ReactNode;
  name: (item: T) => string;
  noun: string;
  emptyIcon: React.ReactNode;
  emptyText: string;
  renderForm: (form: UseFormReturn<z.infer<S>>) => React.ReactNode;
  /** Disable dragging (e.g. auto-sorted lists). */
  sortDisabled?: boolean;
  max?: number;
  rowExtra?: (item: T, update: (next: T) => void) => React.ReactNode;
}

/** Generic list editor: sortable rows (optimistic reorder + rollback), add/edit dialog, delete confirm. */
export function CrudList<T extends { id: string }, S extends z.ZodType<FieldValues, FieldValues>>(cfg: CrudConfig<T, S>) {
  const [items, setItems] = useState(cfg.items);
  const [editing, setEditing] = useState<T | null | undefined>(undefined); // undefined = closed, null = new
  const { run } = useAction();
  const confirm = useConfirm();

  const reorder = async (next: T[]) => {
    if (!cfg.reorder) return;
    const prev = items;
    setItems(next);
    const r = await run(() => cfg.reorder!(next.map((i) => i.id)), { success: "Order saved · live site updated", refresh: false });
    if (!r.ok) setItems(prev);
  };

  const del = async (it: T) => {
    if (!(await confirm({ title: `Delete “${cfg.name(it)}”?`, body: "This can't be undone.", confirmLabel: "Delete", danger: true }))) return;
    const r = await run(() => cfg.remove(it.id), { success: "Deleted · live site updated", refresh: false });
    if (r.ok) setItems((l) => l.filter((x) => x.id !== it.id));
  };

  const atMax = cfg.max !== undefined && items.length >= cfg.max;

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setEditing(null)} disabled={atMax}>
          <Plus aria-hidden="true" /> Add {cfg.noun}
        </Button>
      </div>
      {items.length ? (
        <SortableList
          label={`${cfg.noun} list`}
          items={items}
          disabled={!cfg.reorder || cfg.sortDisabled}
          onReorder={reorder}
          render={(it) => (
            <ListRow
              actions={
                <>
                  {cfg.rowExtra?.(it, (next) => setItems((l) => l.map((x) => (x.id === next.id ? next : x))))}
                  <Button size="icon" variant="subtle" onClick={() => setEditing(it)} aria-label={`Edit ${cfg.name(it)}`}>
                    <Pencil />
                  </Button>
                  <Button size="icon" variant="danger" onClick={() => void del(it)} aria-label={`Delete ${cfg.name(it)}`}>
                    <Trash2 />
                  </Button>
                </>
              }
            >
              <button type="button" className="block w-full text-left" onClick={() => setEditing(it)}>
                {cfg.summary(it)}
              </button>
            </ListRow>
          )}
        />
      ) : (
        <EmptyState icon={cfg.emptyIcon} title={cfg.emptyText}>
          <Button variant="primary" size="sm" onClick={() => setEditing(null)}>
            <Plus aria-hidden="true" /> Add {cfg.noun}
          </Button>
        </EmptyState>
      )}
      {cfg.max !== undefined ? (
        <p className="text-xs text-muted">
          {items.length}/{cfg.max}
        </p>
      ) : null}
      {editing !== undefined ? (
        <ItemDialog
          key={editing?.id ?? "new"}
          title={editing ? `Edit ${cfg.noun}` : `Add ${cfg.noun}`}
          schema={cfg.schema}
          defaults={cfg.toForm(editing)}
          renderForm={cfg.renderForm}
          onClose={() => setEditing(undefined)}
          onSave={async (values) => {
            const r = await run(() => cfg.save(editing?.id ?? null, values), { refresh: false });
            if (r.ok) {
              setItems((l) => (editing ? l.map((x) => (x.id === r.data.id ? r.data : x)) : [...l, r.data]));
              setEditing(undefined);
            }
            return r;
          }}
        />
      ) : null}
    </div>
  );
}

function ItemDialog<S extends z.ZodType<FieldValues, FieldValues>>({
  title,
  schema,
  defaults,
  renderForm,
  onClose,
  onSave,
}: {
  title: string;
  schema: S;
  defaults: z.infer<S>;
  renderForm: (form: UseFormReturn<z.infer<S>>) => React.ReactNode;
  onClose: () => void;
  onSave: (v: z.infer<S>) => Promise<ActionResult<unknown>>;
}) {
  const form = useForm<z.infer<S>>({ resolver: zodResolver(schema as never) as never, defaultValues: defaults as DefaultValues<z.infer<S>>, mode: "onTouched" });
  const confirm = useConfirm();
  const [saving, setSaving] = useState(false);
  const submit = form.handleSubmit(async (values) => {
    setSaving(true);
    const r = await onSave(values);
    setSaving(false);
    if (!r.ok && r.fieldErrors) for (const [k, m] of Object.entries(r.fieldErrors)) form.setError(k as Path<z.infer<S>>, { message: m[0] });
  });
  const close = async () => {
    if (form.formState.isDirty && !(await confirm({ title: "Discard changes?", body: "Your edits in this dialog will be lost.", confirmLabel: "Discard", danger: true }))) return;
    onClose();
  };
  return (
    <Dialog
      open
      onOpenChange={(o) => !o && void close()}
      title={title}
      footer={
        <>
          <Button onClick={() => void close()}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={() => void submit()}>
            Save
          </Button>
        </>
      }
    >
      <form
        className="grid gap-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            void submit();
          }
        }}
      >
        {renderForm(form)}
        <button type="submit" className="sr-only" tabIndex={-1}>
          Save
        </button>
      </form>
    </Dialog>
  );
}
