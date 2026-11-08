import { z } from "zod";
import { connectDb } from "@/server/db";
import { Game, PlayClick } from "@/server/models";
import { getSettings } from "@/server/queries/public";
import { hashIp, hit } from "@/server/services/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,80}$/), store: z.string().regex(/^[a-z]{2,20}$/) });

/** Records a play/store button click (PRD §9). Only when analytics are switched on in SEO settings. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 204 });
  const settings = await getSettings();
  if (!settings.seo.analyticsEnabled) return new Response(null, { status: 204 });
  await connectDb();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = await hit(`track:${hashIp(ip)}`, 60, 60 * 60 * 1000);
  if (rl.limited || !(await Game.exists({ slug: parsed.data.slug, published: true }))) return new Response(null, { status: 204 });
  await PlayClick.create(parsed.data);
  return new Response(null, { status: 204 });
}
