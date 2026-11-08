import "server-only";
import crypto from "node:crypto";
import { env } from "@/env";
import { nextBucket } from "@/lib/utils/rateLimit";
import { RateLimit } from "@/server/models";

export function hashIp(ip: string): string {
  return crypto.createHmac("sha256", env().IP_HASH_SALT).update(ip).digest("hex").slice(0, 32);
}

/** Counts a hit for `key` and reports whether it exceeded `limit` in the window. */
export async function hit(key: string, limit: number, windowMs: number): Promise<{ limited: boolean; retryAfterMs: number }> {
  const now = Date.now();
  const prev = await RateLimit.findOne({ key }).lean();
  const decision = nextBucket(prev ? { count: prev.count ?? 0, expiresAt: new Date(prev.expiresAt ?? 0).getTime() } : null, limit, windowMs, now);
  await RateLimit.updateOne({ key }, { $set: { count: decision.bucket.count, expiresAt: new Date(decision.bucket.expiresAt) } }, { upsert: true });
  return { limited: decision.limited, retryAfterMs: decision.retryAfterMs };
}

export async function peek(key: string, limit: number): Promise<{ limited: boolean; retryAfterMs: number }> {
  const doc = await RateLimit.findOne({ key }).lean();
  if (!doc || new Date(doc.expiresAt ?? 0).getTime() <= Date.now()) return { limited: false, retryAfterMs: 0 };
  const limited = (doc.count ?? 0) >= limit;
  return { limited, retryAfterMs: limited ? new Date(doc.expiresAt ?? 0).getTime() - Date.now() : 0 };
}

export async function clear(key: string): Promise<void> {
  await RateLimit.deleteOne({ key });
}
