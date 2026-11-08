import { AuthRequiredError, requireAdmin } from "@/server/auth";
import { buildBackup } from "@/server/services/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthRequiredError) return new Response("Unauthorized", { status: 401 });
    throw e;
  }
  const backup = await buildBackup();
  const date = new Date().toISOString().slice(0, 10);
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(JSON.stringify(backup, null, 2)));
      controller.close();
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="portfolio-backup-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
