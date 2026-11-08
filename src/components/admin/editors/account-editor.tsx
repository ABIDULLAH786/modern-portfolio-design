"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Field, Input, Panel } from "@/components/ui/inputs";
import { relativeTime } from "@/lib/utils/text";
import { changeEmail, changePassword, logoutEverywhere } from "@/server/actions/auth";

function strength(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 10) s++;
  if (pw.length >= 14) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return { score: Math.min(4, s), label: ["Too weak", "Weak", "Okay", "Good", "Strong"][Math.min(4, s)]! };
}

export function AccountEditor({ email, lastLoginAt }: { email: string; lastLoginAt: string | null }) {
  const { run, pending } = useAction();
  const confirm = useConfirm();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [em, setEm] = useState({ email, password: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const st = strength(pw.next);

  const savePw = async () => {
    setErrs({});
    const r = await run(() => changePassword(pw), { success: "Password changed" });
    if (r.ok) setPw({ current: "", next: "", confirm: "" });
    else if (r.fieldErrors) setErrs(Object.fromEntries(Object.entries(r.fieldErrors).map(([k, v]) => [k, v[0] ?? ""])));
  };
  const saveEmail = async () => {
    setErrs({});
    const r = await run(() => changeEmail(em), { success: "Login email changed" });
    if (r.ok) setEm({ ...em, password: "" });
    else if (r.fieldErrors) setErrs(Object.fromEntries(Object.entries(r.fieldErrors).map(([k, v]) => [`e-${k}`, v[0] ?? ""])));
  };

  return (
    <div className="grid max-w-2xl gap-6">
      <Panel title="Sign-in details" description={lastLoginAt ? `Last login: ${relativeTime(lastLoginAt)} (${new Date(lastLoginAt).toLocaleString()})` : undefined}>
        <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), void saveEmail())}>
          <Field label="Login email" htmlFor="le" error={errs["e-email"]}>
            <Input id="le" type="email" autoComplete="username" value={em.email} onChange={(e) => setEm({ ...em, email: e.target.value })} />
          </Field>
          <Field label="Current password (to confirm)" htmlFor="lep" error={errs["e-password"]}>
            <Input id="lep" type="password" autoComplete="current-password" value={em.password} onChange={(e) => setEm({ ...em, password: e.target.value })} />
          </Field>
          <div>
            <Button type="submit" variant="primary" loading={pending} disabled={!em.password || em.email === email}>
              Change email
            </Button>
          </div>
        </form>
      </Panel>
      <Panel title="Change password">
        <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), void savePw())}>
          <Field label="Current password" htmlFor="cp" error={errs.current}>
            <Input id="cp" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </Field>
          <Field label="New password" htmlFor="np" error={errs.next} hint="At least 10 characters. A short sentence is easy to remember and strong.">
            <Input id="np" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </Field>
          {pw.next ? (
            <div className="grid gap-1" aria-live="polite">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < st.score ? (st.score >= 3 ? "bg-success" : "bg-warning") : "bg-surface-2"}`} />
                ))}
              </div>
              <span className="text-xs text-muted">Strength: {st.label}</span>
            </div>
          ) : null}
          <Field label="Confirm new password" htmlFor="cnp" error={errs.confirm}>
            <Input id="cnp" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </Field>
          <div>
            <Button type="submit" variant="primary" loading={pending} disabled={!pw.current || pw.next.length < 10 || pw.next !== pw.confirm}>
              Change password
            </Button>
          </div>
        </form>
      </Panel>
      <Panel title="Security">
        <p className="text-sm text-muted">Signs you out everywhere, including this browser. Use it if you logged in on a computer you don&apos;t own.</p>
        <div>
          <Button
            variant="danger"
            onClick={async () => {
              if (await confirm({ title: "Log out of all devices?", body: "You'll need to log in again on every device, including this one.", confirmLabel: "Log out everywhere", danger: true })) await logoutEverywhere();
            }}
          >
            <LogOut aria-hidden="true" /> Log out of all devices
          </Button>
        </div>
      </Panel>
    </div>
  );
}
