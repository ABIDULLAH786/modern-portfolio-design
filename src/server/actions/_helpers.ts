import "server-only";
import { z } from "zod";
import type { ActionResult } from "@/lib/types";
import { AuthRequiredError, requireAdmin } from "@/server/auth";
import { connectDb } from "@/server/db";

export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export function invalid(error: z.ZodError): ActionResult<never> {
  const fe = fieldErrors(error);
  const first = error.issues[0];
  return { ok: false, error: first ? `${first.path.length ? `${first.path.join(".")}: ` : ""}${first.message}` : "Please check the form", fieldErrors: fe };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

/**
 * Wraps an admin mutation: session check → DB connect → run → map errors to a typed result.
 * The callback is responsible for Zod validation and tag revalidation.
 */
export async function adminAction<T>(name: string, fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    await requireAdmin();
    await connectDb();
    return await fn();
  } catch (e) {
    if (e instanceof AuthRequiredError) return { ok: false, error: e.message };
    if (e instanceof z.ZodError) return invalid(e);
    if (e && typeof e === "object" && "code" in e && (e as { code?: number }).code === 11000) {
      return { ok: false, error: "That value is already in use. Please choose another." };
    }
    console.error(`[action:${name}]`, e);
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
}

/** bulkWrite order = index for a list of ids. */
export function orderOps(ids: string[]) {
  return ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i } } } }));
}
