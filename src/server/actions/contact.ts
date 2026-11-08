"use server";

import { headers } from "next/headers";
import { env } from "@/env";
import type { ActionResult } from "@/lib/types";
import { contactSchema } from "@/lib/validation/contact";
import { connectDb } from "@/server/db";
import { Message } from "@/server/models";
import { getProfile, getSettings } from "@/server/queries/public";
import { autoReplyEmail, notificationEmail, sendEmail } from "@/server/services/email";
import { hashIp, hit } from "@/server/services/rate-limit";
import { fieldErrors } from "./_helpers";

const MIN_FILL_MS = 3000;
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  }).catch(() => null);
  const json = (await res?.json().catch(() => null)) as { success?: boolean } | null;
  return Boolean(json?.success);
}

/** Public contact form (no auth): honeypot + min fill time + IP rate limit + optional Turnstile. */
export async function submitContact(input: unknown): Promise<ActionResult<{ message: string }>> {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  const success = { ok: true as const, data: { message: settings.copy.contact.successMessage } };
  const fallback = profile.email ? ` You can also email me directly at ${profile.email}.` : "";

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;

  // Bots: pretend everything worked, store nothing.
  if (data.company.trim() !== "" || Date.now() - data.renderedAt < MIN_FILL_MS) return success;

  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
    const ipHash = hashIp(ip);
    await connectDb();

    const rl = await hit(`contact:${ipHash}`, LIMIT, WINDOW_MS);
    if (rl.limited) {
      return { ok: false, error: `You've sent several messages in the last hour. Please try again later.${fallback}` };
    }
    if (!(await verifyTurnstile(data.turnstileToken, ip))) return { ok: false, error: "Please complete the spam check and try again." };

    const c = settings.copy.contact;
    const projectType = c.projectTypes.includes(data.projectType) ? data.projectType : "";
    const budget = c.budgetEnabled && c.budgetOptions.includes(data.budget) ? data.budget : "";

    const msg = await Message.create({
      name: data.name,
      email: data.email,
      projectType,
      budget,
      body: data.message,
      status: "new",
      ipHash,
      userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    });

    const to = env().CONTACT_TO_EMAIL || profile.email;
    const note = notificationEmail({ name: data.name, email: data.email, projectType, budget, body: data.message });
    const sent = to ? await sendEmail({ to, replyTo: data.email, ...note }) : { ok: false as const, error: "No recipient email set in Profile" };
    if (!sent.ok) console.error("[contact] notification email failed:", sent.error);
    await Message.updateOne({ _id: msg._id }, { $set: { emailDelivered: sent.ok, emailError: sent.ok ? "" : sent.error } });

    if (c.autoReply.enabled && c.autoReply.subject && c.autoReply.body) {
      const reply = autoReplyEmail(c.autoReply.subject, c.autoReply.body, data.name);
      const r = await sendEmail({ to: data.email, ...(to ? { replyTo: to } : {}), ...reply });
      if (!r.ok) console.error("[contact] auto-reply failed:", r.error);
    }
    return success;
  } catch (e) {
    console.error("[action:submitContact]", e);
    return { ok: false, error: `Sorry, something went wrong while sending.${fallback}` };
  }
}
