import { NextResponse } from "next/server";
import { z } from "zod";
import { env, imagekitConfigured } from "@/env";
import { MEDIA_KINDS, folderFor, kindRules } from "@/lib/media-kinds";
import { AuthRequiredError, requireAdmin } from "@/server/auth";
import { media } from "@/server/services/media";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ kind: z.enum(MEDIA_KINDS), scope: z.string().max(80).optional() });

/** Admin-only: returns short-lived ImageKit upload credentials + the folder for this kind. */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthRequiredError) return NextResponse.json({ error: e.message }, { status: 401 });
    throw e;
  }
  if (!imagekitConfigured()) {
    return NextResponse.json({ error: "Image uploads are not set up yet (ImageKit keys are missing)." }, { status: 503 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  const { kind, scope } = parsed.data;
  const auth = media.uploadAuth();
  const rules = kindRules(kind);
  return NextResponse.json(
    { ...auth, folder: folderFor(env().IMAGEKIT_ROOT_FOLDER, kind, scope), maxBytes: rules.maxBytes, accept: rules.accept },
    { headers: { "Cache-Control": "no-store" } },
  );
}
