import "server-only";
import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { cache } from "react";
import { loginSchema } from "@/lib/validation/account";
import { connectDb } from "@/server/db";
import { User } from "@/server/models";
import { clear, hashIp, hit, peek } from "@/server/services/rate-limit";
import { authConfig } from "./auth.config";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export class LockedError extends CredentialsSignin {
  code = "locked";
}

function clientIp(req: Request | undefined): string {
  const h = req?.headers;
  return h?.get("x-forwarded-for")?.split(",")[0]?.trim() || h?.get("x-real-ip") || "local";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        await connectDb();

        const key = `login:${hashIp(clientIp(request))}:${email}`;
        const limit = await peek(key, MAX_ATTEMPTS);
        const user = await User.findOne({ email });
        const lockedUntil = user?.failedLogins?.lockedUntil ? new Date(user.failedLogins.lockedUntil).getTime() : 0;
        if (limit.limited || lockedUntil > Date.now()) {
          const err = new LockedError();
          err.code = `locked:${Math.ceil(Math.max(limit.retryAfterMs, lockedUntil - Date.now()) / 60000)}`;
          throw err;
        }

        const ok = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
        if (!user || !ok) {
          await hit(key, MAX_ATTEMPTS, LOCK_MS);
          if (user) {
            const count = (user.failedLogins?.count ?? 0) + 1;
            user.failedLogins = { count, lockedUntil: count >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS) : null };
            await user.save();
          }
          return null;
        }

        user.failedLogins = { count: 0, lockedUntil: null };
        user.lastLoginAt = new Date();
        await user.save();
        await clear(key);
        return { id: String(user._id), email: user.email, name: user.name, sv: user.sessionVersion ?? 1 };
      },
    }),
  ],
});

export class AuthRequiredError extends Error {
  constructor() {
    super("Your session has expired. Please log in again.");
  }
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
}

/** Current admin (session + sessionVersion check), memoised per request. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectDb();
  const user = await User.findById(session.user.id).lean().catch(() => null);
  if (!user || (user.sessionVersion ?? 1) !== session.sv) return null;
  return {
    id: String(user._id),
    email: user.email,
    name: user.name ?? "Admin",
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
    passwordChangedAt: user.passwordChangedAt ? new Date(user.passwordChangedAt).toISOString() : null,
  };
});

/** Use in every admin server action / API route. Throws when there is no valid session. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) throw new AuthRequiredError();
  return admin;
}

/** Use in admin pages: redirects to the login page instead of throwing. */
export async function requireAdminPage(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
