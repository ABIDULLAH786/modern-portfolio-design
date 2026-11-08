import "server-only";
import { z } from "zod";

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  MONGODB_URI: z
    .string({ error: "MONGODB_URI is required (MongoDB connection string)" })
    .min(1, "MONGODB_URI is required (MongoDB connection string)"),
  AUTH_SECRET: z
    .string({ error: "AUTH_SECRET is required. Generate one with: openssl rand -base64 32" })
    .min(16, "AUTH_SECRET must be at least 16 characters. Generate one with: openssl rand -base64 32"),
  IMAGEKIT_PUBLIC_KEY: optional,
  IMAGEKIT_PRIVATE_KEY: optional,
  IMAGEKIT_URL_ENDPOINT: optional,
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: optional,
  IMAGEKIT_ROOT_FOLDER: z.string().default("/najeeb-portfolio"),
  /** Optional cap on total ImageKit storage used by this site (MB). Uploads are refused beyond it. */
  IMAGEKIT_MAX_STORAGE_MB: z.coerce.number().positive().optional(),
  RESEND_API_KEY: optional,
  EMAIL_FROM: z.string().default("Portfolio <onboarding@resend.dev>"),
  CONTACT_TO_EMAIL: optional,
  EMAIL_TRANSPORT: z.enum(["resend", "log"]).default("resend"),
  IP_HASH_SALT: z.string().default("dev-salt-change-me"),
  TURNSTILE_SITE_KEY: optional,
  TURNSTILE_SECRET_KEY: optional,
  NEXT_PUBLIC_ANALYTICS: optional,
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Validated server environment. Throws a readable error listing every problem. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`);
    throw new Error(
      `\n❌ Invalid environment variables:\n${lines.join("\n")}\n\nCopy .env.example to .env.local and fill in the values.\n`,
    );
  }
  const data = parsed.data;
  // Accept either IMAGEKIT_URL_ENDPOINT or NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.
  data.IMAGEKIT_URL_ENDPOINT ??= data.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  data.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ??= data.IMAGEKIT_URL_ENDPOINT;
  cached = data;
  return cached;
}

export function imagekitConfigured(): boolean {
  const e = env();
  return Boolean(e.IMAGEKIT_PUBLIC_KEY && e.IMAGEKIT_PRIVATE_KEY && e.IMAGEKIT_URL_ENDPOINT);
}
