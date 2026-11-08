import { AuthRequiredError, requireAdmin } from "@/server/auth";
import { adminMessages } from "@/server/queries/admin";

export const dynamic = "force-dynamic";

const cell = (v: string) => {
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v; // prevent CSV formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthRequiredError) return new Response("Unauthorized", { status: 401 });
    throw e;
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const rows = await adminMessages({
    status: status === "new" || status === "archived" ? status : "all",
    q: url.searchParams.get("q")?.slice(0, 100) || undefined,
  });
  const header = ["Date", "Name", "Email", "Project type", "Budget", "Status", "Email delivered", "Message"];
  const lines = rows.map((m) => [m.createdAt, m.name, m.email, m.projectType, m.budget, m.status, m.emailDelivered ? "yes" : "no", m.body].map(cell).join(","));
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="messages-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
