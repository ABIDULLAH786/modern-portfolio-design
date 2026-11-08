"use server";

import bcrypt from "bcryptjs";
import { AuthError, CredentialsSignin } from "next-auth";
import type { ActionResult } from "@/lib/types";
import { changeEmailSchema, changePasswordSchema } from "@/lib/validation/account";
import { requireAdmin, signIn, signOut } from "@/server/auth";
import { User } from "@/server/models";
import { adminAction, fail, invalid } from "./_helpers";

function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function login(_prev: { error: string } | null, formData: FormData): Promise<{ error: string } | null> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: safeNext(formData.get("next")),
    });
    return null;
  } catch (e) {
    if (e instanceof CredentialsSignin) {
      if (e.code?.startsWith("locked")) {
        const mins = Number(e.code.split(":")[1] ?? 15) || 15;
        return { error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` };
      }
      return { error: "Email or password is incorrect." };
    }
    if (e instanceof AuthError) return { error: "Login failed. Please try again." };
    throw e; // NEXT_REDIRECT on success
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  return adminAction("changePassword", async () => {
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const admin = await requireAdmin();
    const user = await User.findById(admin.id);
    if (!user) return fail("User not found.");
    if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) return { ok: false, error: "Your current password is incorrect.", fieldErrors: { current: ["Incorrect password"] } };
    user.passwordHash = await bcrypt.hash(parsed.data.next, 12);
    user.passwordChangedAt = new Date();
    await user.save();
    return { ok: true, data: null };
  });
}

export async function changeEmail(input: unknown): Promise<ActionResult> {
  return adminAction("changeEmail", async () => {
    const parsed = changeEmailSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const admin = await requireAdmin();
    const user = await User.findById(admin.id);
    if (!user) return fail("User not found.");
    if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return { ok: false, error: "Your password is incorrect.", fieldErrors: { password: ["Incorrect password"] } };
    user.email = parsed.data.email.toLowerCase();
    await user.save();
    return { ok: true, data: null };
  });
}

/** Rotates sessionVersion so every existing session (including this one) is signed out. */
export async function logoutEverywhere(): Promise<void> {
  const res = await adminAction("logoutEverywhere", async () => {
    const admin = await requireAdmin();
    await User.updateOne({ _id: admin.id }, { $inc: { sessionVersion: 1 } });
    return { ok: true, data: null };
  });
  if (res.ok) await signOut({ redirectTo: "/admin/login" });
}
