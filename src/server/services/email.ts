import "server-only";
import { Resend } from "resend";
import { env } from "@/env";

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type EmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(input: EmailInput): Promise<EmailResult> {
  const e = env();
  if (e.EMAIL_TRANSPORT === "log" || !e.RESEND_API_KEY) {
    console.info(`[email:log] to=${input.to} subject="${input.subject}"\n${input.text}`);
    if (e.EMAIL_TRANSPORT !== "log") return { ok: false, error: "RESEND_API_KEY is not set" };
    return { ok: true };
  }
  try {
    const resend = new Resend(e.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: e.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#15151f">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6e6ef">
<div style="height:6px;background:linear-gradient(120deg,#7C5CFF,#22D3EE)"></div>
<div style="padding:28px"><h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>${inner}</div></div></body></html>`;
}

export function notificationEmail(m: { name: string; email: string; projectType: string; budget: string; body: string }) {
  const rows = [
    ["Name", m.name],
    ["Email", m.email],
    ["Project type", m.projectType || "—"],
    ...(m.budget ? [["Budget", m.budget]] : []),
  ];
  const html = layout(
    `New message from ${m.name}`,
    `<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px">${rows
      .map(([k, v]) => `<tr><td style="padding:6px 0;color:#6b6b80;width:120px">${escapeHtml(k!)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v!)}</td></tr>`)
      .join("")}</table>
<div style="white-space:pre-wrap;font-size:15px;line-height:1.6;padding:16px;background:#f7f7fb;border-radius:10px">${escapeHtml(m.body)}</div>
<p style="font-size:13px;color:#6b6b80;margin-top:18px">Reply to this email to answer ${escapeHtml(m.name)} directly.</p>`,
  );
  const text = `New portfolio message\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${m.body}`;
  return { subject: `New portfolio message from ${m.name}`, html, text };
}

export function autoReplyEmail(subject: string, body: string, name: string) {
  const filled = body.replaceAll("{name}", name);
  return {
    subject: subject.replaceAll("{name}", name),
    text: filled,
    html: layout(subject.replaceAll("{name}", name), `<div style="white-space:pre-wrap;font-size:15px;line-height:1.6">${escapeHtml(filled)}</div>`),
  };
}
