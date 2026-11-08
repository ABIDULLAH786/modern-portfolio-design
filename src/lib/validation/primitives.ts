import { z } from "zod";

export const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #7C5CFF");

export const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a full link starting with https://");

/** Empty string or a valid http(s) URL. */
export const optionalUrl = z.union([z.literal(""), httpUrl]);

export const youtubeUrl = z.union([
  z.literal(""),
  httpUrl.refine((v) => {
    const host = new URL(v).hostname.replace(/^www\.|^m\./, "");
    return host === "youtube.com" || host === "youtu.be";
  }, "Only YouTube links are supported (youtube.com or youtu.be)"),
]);

export const slug = z
  .string()
  .trim()
  .min(2, "At least 2 characters")
  .max(80, "At most 80 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

export const text = (max: number, label = "This field") =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`);

export const required = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

export const mediaRef = z
  .object({
    mediaId: z.string().min(1),
    url: httpUrl,
    width: z.number().int().nonnegative(),
    height: z.number().int().nonnegative(),
    alt: text(200, "Alt text"),
    blurDataUrl: z.string().max(4000).optional(),
  })
  .nullable();
export type MediaRef = z.infer<typeof mediaRef>;

export const idList = z.array(z.string().min(1)).max(500);
