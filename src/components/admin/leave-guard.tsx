"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { useConfirm } from "@/components/ui/confirm";

type Ctx = { setDirty: (key: string, dirty: boolean) => void; isDirty: () => boolean };
const LeaveCtx = createContext<Ctx>({ setDirty: () => undefined, isDirty: () => false });

/**
 * Tracks unsaved forms across the admin. Blocks tab close (beforeunload) and intercepts
 * in-app link clicks with an in-app confirm dialog.
 */
export function LeaveGuardProvider({ children }: { children: React.ReactNode }) {
  const dirty = useRef(new Set<string>());
  const confirm = useConfirm();
  const router = useRouter();

  const setDirty = useCallback((key: string, d: boolean) => {
    if (d) dirty.current.add(key);
    else dirty.current.delete(key);
  }, []);
  const isDirty = useCallback(() => dirty.current.size > 0, []);

  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => {
      if (dirty.current.size) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onClick = async (e: MouseEvent) => {
      if (!dirty.current.size || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      e.stopPropagation();
      const ok = await confirm({ title: "Leave without saving?", body: "You have unsaved changes on this page. If you leave now, they will be lost.", confirmLabel: "Leave page", danger: true });
      if (ok) {
        dirty.current.clear();
        router.push(url.pathname + url.search + url.hash);
      }
    };
    window.addEventListener("beforeunload", onBefore);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBefore);
      document.removeEventListener("click", onClick, true);
    };
  }, [confirm, router]);

  return <LeaveCtx.Provider value={{ setDirty, isDirty }}>{children}</LeaveCtx.Provider>;
}

export function useUnsavedChanges(key: string, isDirty: boolean) {
  const { setDirty } = useContext(LeaveCtx);
  useEffect(() => {
    setDirty(key, isDirty);
    return () => setDirty(key, false);
  }, [key, isDirty, setDirty]);
}
