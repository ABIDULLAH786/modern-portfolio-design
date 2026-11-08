"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { contactSchema } from "@/lib/validation/contact";
import { submitContact } from "@/server/actions/contact";

const formSchema = contactSchema.pick({ name: true, email: true, projectType: true, budget: true, message: true, company: true });
type FormIn = z.input<typeof formSchema>;
type FormOut = z.output<typeof formSchema>;

export function ContactForm({ projectTypes, budgetOptions, fallbackEmail, turnstileSiteKey }: { projectTypes: string[]; budgetOptions: string[]; fallbackEmail: string; turnstileSiteKey?: string }) {
  const renderedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", projectType: projectTypes[0] ?? "", budget: "", message: "", company: "" },
  });

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const onSubmit = async (values: FormOut) => {
    setStatus(null);
    const token = formRef.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value;
    const res = await submitContact({ ...values, renderedAt: renderedAt.current || Date.now() - 10_000, ...(token ? { turnstileToken: token } : {}) });
    if (res.ok) {
      setStatus({ kind: "ok", text: res.data.message });
      reset();
      renderedAt.current = Date.now();
      return;
    }
    for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
      if (field in formSchema.shape) setError(field as keyof FormIn, { message: msgs[0] });
    }
    setStatus({ kind: "err", text: res.fieldErrors ? res.error : res.error || `Something went wrong. Email me at ${fallbackEmail}.` });
  };

  const err = (k: keyof FormIn) => errors[k]?.message;

  return (
    <form ref={formRef} className="form" onSubmit={(ev) => void handleSubmit(onSubmit)(ev)} noValidate aria-label="Contact form">
      <div className="row">
        <div className="field">
          <label htmlFor="cf-name">Your name</label>
          <input id="cf-name" className="input" autoComplete="name" placeholder="Jane Doe" aria-invalid={!!err("name")} aria-describedby={err("name") ? "cf-name-e" : undefined} {...register("name")} />
          {err("name") ? (
            <p className="field-error" id="cf-name-e">
              {err("name")}
            </p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" type="email" className="input" autoComplete="email" placeholder="you@studio.com" aria-invalid={!!err("email")} aria-describedby={err("email") ? "cf-email-e" : undefined} {...register("email")} />
          {err("email") ? (
            <p className="field-error" id="cf-email-e">
              {err("email")}
            </p>
          ) : null}
        </div>
      </div>
      <div className={budgetOptions.length ? "row" : undefined}>
        {projectTypes.length ? (
          <div className="field">
            <label htmlFor="cf-type">Project type</label>
            <select id="cf-type" className="input" {...register("projectType")}>
              {projectTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        ) : null}
        {budgetOptions.length ? (
          <div className="field">
            <label htmlFor="cf-budget">Budget (optional)</label>
            <select id="cf-budget" className="input" {...register("budget")}>
              <option value="">Prefer not to say</option>
              {budgetOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor="cf-msg">Message</label>
        <textarea id="cf-msg" className="input" placeholder="Tell me about your game idea..." aria-invalid={!!err("message")} aria-describedby={err("message") ? "cf-msg-e" : undefined} {...register("message")} />
        {err("message") ? (
          <p className="field-error" id="cf-msg-e">
            {err("message")}
          </p>
        ) : null}
      </div>
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>
      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
        </>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ justifySelf: "start" }}>
        {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
      <div role="status" aria-live="polite">
        {status ? <div className={status.kind === "ok" ? "form-ok" : "form-err"}>{status.text}</div> : null}
      </div>
    </form>
  );
}
