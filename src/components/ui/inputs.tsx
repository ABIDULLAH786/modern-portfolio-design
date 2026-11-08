import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const base =
  "w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[0.95rem] outline-none transition placeholder:text-muted/70 focus:border-primary focus:shadow-[0_0_0_4px_var(--ring)] aria-[invalid=true]:border-danger disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(base, className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(base, "min-h-28 resize-y leading-relaxed", className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...p }, ref) {
  return (
    <select ref={ref} className={cn(base, "input pr-10", className)} {...p}>
      {children}
    </select>
  );
});

/** Label + control + hint + error, wired for accessibility. */
export function Field({ label, htmlFor, hint, error, children, className, required, counter }: { label: string; htmlFor?: string; hint?: React.ReactNode; error?: string; children: React.ReactNode; className?: string; required?: boolean; counter?: React.ReactNode }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </label>
        {counter ? <span className="text-xs text-muted tabular-nums">{counter}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-danger" id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[0.82rem] text-muted" id={htmlFor ? `${htmlFor}-hint` : undefined}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Panel({ title, description, children, className, actions }: { title?: string; description?: React.ReactNode; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-[var(--radius)] border border-border bg-surface p-5 sm:p-6", className)}>
      {title || actions ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="font-sans text-base font-bold tracking-normal">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "primary" | "success" | "warning" | "danger"; className?: string }) {
  const tones = {
    neutral: "bg-surface-2 text-muted",
    primary: "bg-primary-soft text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}

export function EmptyState({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="grid place-items-center gap-3 rounded-[var(--radius)] border border-dashed border-border px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary [&_svg]:size-6">{icon}</div>
      <p className="font-semibold">{title}</p>
      {children}
    </div>
  );
}
