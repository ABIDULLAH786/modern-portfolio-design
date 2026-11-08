"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";

interface Opts {
  success?: string | false;
  /** Refresh server components after success (default true). */
  refresh?: boolean;
  viewHref?: string;
}

/** Runs a server action with pending state + success/error toasts. Returns the typed result. */
export function useAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  const run = useCallback(
    async <T,>(fn: () => Promise<ActionResult<T>>, opts: Opts = {}): Promise<ActionResult<T>> => {
      setPending(true);
      try {
        const res = await fn();
        if (res.ok) {
          if (opts.success !== false) {
            toast.success(opts.success ?? "Saved · live site updated", opts.viewHref ? { action: { label: "View live", onClick: () => window.open(opts.viewHref, "_blank") } } : undefined);
          }
          if (opts.refresh !== false) startTransition(() => router.refresh());
        } else {
          toast.error(res.error);
          if (/session has expired/i.test(res.error)) router.push("/admin/login");
        }
        return res;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        toast.error(msg);
        return { ok: false, error: msg };
      } finally {
        setPending(false);
      }
    },
    [router],
  );

  return { run, pending };
}
