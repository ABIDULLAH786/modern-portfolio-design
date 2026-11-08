"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Input } from "./inputs";

interface ConfirmOptions {
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  /** Require typing this word (e.g. "REPLACE") to enable the confirm button. */
  typeToConfirm?: string;
}

const Ctx = createContext<(o: ConfirmOptions) => Promise<boolean>>(() => Promise.resolve(false));

/** In-app confirm dialogs (never window.confirm). */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [typed, setTyped] = useState("");
  const resolver = useRef<(v: boolean) => void>(() => undefined);

  const confirm = useCallback((o: ConfirmOptions) => {
    setTyped("");
    setOpts(o);
    return new Promise<boolean>((res) => {
      resolver.current = res;
    });
  }, []);

  const close = (v: boolean) => {
    resolver.current(v);
    setOpts(null);
  };

  const blocked = Boolean(opts?.typeToConfirm && typed !== opts.typeToConfirm);

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <Dialog
        open={!!opts}
        onOpenChange={(o) => !o && close(false)}
        title={opts?.title ?? ""}
        footer={
          <>
            <Button onClick={() => close(false)}>Cancel</Button>
            <Button variant={opts?.danger ? "danger" : "primary"} disabled={blocked} onClick={() => close(true)}>
              {opts?.confirmLabel ?? "Confirm"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 text-[0.95rem] text-muted">
          {opts?.body}
          {opts?.typeToConfirm ? (
            <label className="grid gap-1.5 text-sm">
              <span>
                Type <b className="text-text">{opts.typeToConfirm}</b> to confirm
              </span>
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus autoComplete="off" />
            </label>
          ) : null}
        </div>
      </Dialog>
    </Ctx.Provider>
  );
}

export const useConfirm = () => useContext(Ctx);
