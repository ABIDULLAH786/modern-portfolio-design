"use client";

import { X } from "lucide-react";
import { Dialog as RDialog } from "radix-ui";
import { cn } from "@/lib/utils/cn";

/** Accessible dialog (focus trap, Esc, returns focus). Full-screen sheet on phones. */
export function Dialog({ open, onOpenChange, title, description, children, footer, wide }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm data-[state=open]:animate-[fade_.2s]" />
        <RDialog.Content
          className={cn(
            "fixed z-[81] flex flex-col border border-border bg-surface text-text shadow-2xl outline-none data-[state=open]:animate-[pop_.3s_var(--ease)]",
            "inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[88vh] sm:w-[min(560px,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[calc(var(--radius)*1.2)]",
            wide && "sm:w-[min(900px,calc(100vw-32px))]",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <RDialog.Title className="font-sans text-lg font-bold tracking-normal">{title}</RDialog.Title>
              {description ? <RDialog.Description className="mt-1 text-sm text-muted">{description}</RDialog.Description> : <RDialog.Description className="sr-only">{title}</RDialog.Description>}
            </div>
            <RDialog.Close className="grid size-9 shrink-0 place-items-center rounded-full border border-border hover:border-primary" aria-label="Close">
              <X className="size-4" />
            </RDialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">{footer}</div> : null}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
