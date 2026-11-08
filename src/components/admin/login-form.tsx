"use client";

import { Eye, EyeOff, LogIn } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/inputs";
import { login } from "@/server/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Password" htmlFor="password">
        <div className="relative">
          <Input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="pr-11" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-text" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      {state?.error ? (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" loading={pending} className="mt-1 w-full justify-center">
        {!pending ? <LogIn aria-hidden="true" /> : null} Log in
      </Button>
    </form>
  );
}
