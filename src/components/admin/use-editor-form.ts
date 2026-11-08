"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path } from "react-hook-form";
import type { z } from "zod";
import type { ActionResult } from "@/lib/types";
import { useAction } from "./use-action";

/**
 * RHF + shared Zod schema + server action + toasts + dirty tracking.
 * Server field errors are mapped back onto the form.
 */
export function useEditorForm<S extends z.ZodType<FieldValues, FieldValues>>(schema: S, defaults: z.infer<S>, save: (values: z.infer<S>) => Promise<ActionResult<unknown>>, opts: { success?: string; viewHref?: string } = {}) {
  type V = z.infer<S>;
  const form = useForm<V>({
    // Resolver generics can't follow a generic schema parameter; the schema is still fully applied at runtime.
    resolver: zodResolver(schema as never) as never,
    defaultValues: defaults as DefaultValues<V>,
    mode: "onTouched",
  });
  const { run, pending } = useAction();

  const submit = useCallback(
    () =>
      form.handleSubmit(
        async (values) => {
          const res = await run(() => save(values), opts);
          if (res.ok) form.reset(values);
          else if (res.fieldErrors) {
            for (const [k, msgs] of Object.entries(res.fieldErrors)) form.setError(k as Path<V>, { message: msgs[0] });
          }
        },
        () => {
          const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
          first?.focus();
        },
      )(),
    [form, run, save, opts],
  );

  return { form, submit, pending, dirty: form.formState.isDirty, discard: () => form.reset() };
}

/** Reads a nested RHF error message by dotted path. */
export function errorAt(errors: unknown, path: string): string | undefined {
  let cur: unknown = errors;
  for (const k of path.split(".")) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  const msg = cur && typeof cur === "object" ? (cur as { message?: unknown }).message : undefined;
  return typeof msg === "string" ? msg : undefined;
}
