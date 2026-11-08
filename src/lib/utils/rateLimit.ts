/** Pure fixed-window rate-limit logic; storage lives in server/services/rate-limit.ts. */
export interface Bucket {
  count: number;
  expiresAt: number;
}

export interface RateDecision {
  limited: boolean;
  bucket: Bucket;
  retryAfterMs: number;
}

export function nextBucket(prev: Bucket | null, limit: number, windowMs: number, now = Date.now()): RateDecision {
  const bucket = !prev || prev.expiresAt <= now ? { count: 1, expiresAt: now + windowMs } : { count: prev.count + 1, expiresAt: prev.expiresAt };
  const limited = bucket.count > limit;
  return { limited, bucket, retryAfterMs: limited ? bucket.expiresAt - now : 0 };
}
