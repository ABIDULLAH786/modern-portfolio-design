import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name (at least 2 characters)").max(80, "Name is too long"),
  email: z.email("Please enter a valid email address").max(120),
  projectType: z.string().trim().max(60).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000, "Message is too long (max 5000)"),
  // anti-spam
  company: z.string().max(200).optional().default(""), // honeypot: must stay empty
  renderedAt: z.number().int().positive(),
  turnstileToken: z.string().max(4096).optional(),
});
export type ContactInput = z.input<typeof contactSchema>;
