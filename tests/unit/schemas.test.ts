import { describe, expect, it } from "vitest";
import { backupSchema } from "@/lib/validation/backup";
import { contactSchema } from "@/lib/validation/contact";
import { gameSchema } from "@/lib/validation/game";
import { profileSchema } from "@/lib/validation/profile";

const game = {
  title: "Battle Zone Master",
  slug: "battle-zone-master",
  status: "released",
  published: true,
  featured: false,
  genre: "Shooter",
  platforms: ["Android"],
  engine: "Unity",
  releaseYear: null,
  shortDescription: "A shooter.",
  description: "",
  tags: [],
  cover: null,
  coverStyle: "battle",
  gallery: [],
  trailerUrl: "",
  links: [{ kind: "itch", url: "https://najo98.itch.io/battle-zone-master", label: "" }],
};

describe("gameSchema", () => {
  it("accepts a valid game", () => expect(gameSchema.safeParse(game).success).toBe(true));
  it("accepts a YouTube trailer", () => expect(gameSchema.safeParse({ ...game, trailerUrl: "https://youtu.be/abcdefghijk" }).success).toBe(true));
  it("rejects a non-YouTube trailer", () => expect(gameSchema.safeParse({ ...game, trailerUrl: "https://vimeo.com/123" }).success).toBe(false));
  it("rejects a slug with spaces", () => expect(gameSchema.safeParse({ ...game, slug: "battle zone" }).success).toBe(false));
  it("rejects a > 220-char short description", () => expect(gameSchema.safeParse({ ...game, shortDescription: "x".repeat(221) }).success).toBe(false));
  it("rejects javascript: links", () => expect(gameSchema.safeParse({ ...game, links: [{ kind: "web", url: "javascript:alert(1)", label: "" }] }).success).toBe(false));
  it("rejects more than 8 tags", () => expect(gameSchema.safeParse({ ...game, tags: Array.from({ length: 9 }, (_, i) => `t${i}`) }).success).toBe(false));
});

describe("profileSchema", () => {
  it("rejects a bad hex-free email", () => {
    const r = profileSchema.shape.email.safeParse("not-an-email");
    expect(r.success).toBe(false);
  });
});

describe("contactSchema", () => {
  const ok = { name: "Jane", email: "jane@studio.com", message: "Hello, I have a game idea.", renderedAt: 1 };
  it("accepts a valid message", () => expect(contactSchema.safeParse(ok).success).toBe(true));
  it("rejects a short message", () => expect(contactSchema.safeParse({ ...ok, message: "hi" }).success).toBe(false));
  it("rejects a 1-letter name", () => expect(contactSchema.safeParse({ ...ok, name: "J" }).success).toBe(false));
});

describe("backupSchema", () => {
  it("rejects a missing version", () => expect(backupSchema.safeParse({ exportedAt: "x" }).success).toBe(false));
  it("rejects a wrong shape", () => expect(backupSchema.safeParse({ version: 1, exportedAt: "x", games: "nope" }).success).toBe(false));
});
