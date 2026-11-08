import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email").max(120),
  password: z.string().min(1, "Enter your password").max(200),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(10, "Use at least 10 characters").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const changeEmailSchema = z.object({
  email: z.email("Enter a valid email").max(120),
  password: z.string().min(1, "Enter your current password"),
});
