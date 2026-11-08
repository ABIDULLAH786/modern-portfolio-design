import { describe, expect, it } from "vitest";
import { folderFor, kindRules } from "@/lib/media-kinds";
import { formatPeriod, periodSortKey } from "@/lib/utils/formatPeriod";
import { nextBucket } from "@/lib/utils/rateLimit";
import { slugify } from "@/lib/utils/slugify";
import { splitGradient, youtubeId } from "@/lib/utils/text";

describe("formatPeriod", () => {
  it("month/year to present", () => expect(formatPeriod({ start: { month: 3, year: 2023 }, current: true })).toBe("Mar 2023 – Present"));
  it("year only", () => expect(formatPeriod({ start: { year: 2020 }, end: { year: 2024 } })).toBe("2020 – 2024"));
  it("override wins", () => expect(formatPeriod({ start: { year: 2020 }, periodOverride: "Earlier" })).toBe("Earlier"));
  it("sorts current first", () => expect(periodSortKey({ current: true })).toBeGreaterThan(periodSortKey({ end: { year: 2024, month: 12 } })));
});

describe("slugify", () => {
  it("handles the spec example", () => expect(slugify("2D Air Shooter!")).toBe("2d-air-shooter"));
  it("strips accents and apostrophes", () => expect(slugify("Shoot 'em Up — Café")).toBe("shoot-em-up-cafe"));
});

describe("rate limiter", () => {
  it("limits the 6th call inside the window", () => {
    let b = null as ReturnType<typeof nextBucket>["bucket"] | null;
    const now = 1_000_000;
    const results = Array.from({ length: 6 }, () => {
      const d = nextBucket(b, 5, 3600_000, now);
      b = d.bucket;
      return d.limited;
    });
    expect(results).toEqual([false, false, false, false, false, true]);
  });
  it("resets after the window", () => {
    const d = nextBucket({ count: 99, expiresAt: 10 }, 5, 1000, 20);
    expect(d.limited).toBe(false);
    expect(d.bucket.count).toBe(1);
  });
});

describe("text helpers", () => {
  it("gradient applies to the last two words", () => expect(splitGradient("Games I've built & shipped")).toEqual({ lead: "Games I've built", tail: "& shipped" }));
  it("single word gets the whole gradient", () => expect(splitGradient("Skills")).toEqual({ lead: "", tail: "Skills" }));
  it("parses YouTube ids", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://vimeo.com/1")).toBeNull();
  });
});

describe("ImageKit folders", () => {
  it("gives every kind its own sub-folder", () => {
    expect(folderFor("/najeeb-portfolio", "resume")).toBe("/najeeb-portfolio/resume");
    expect(folderFor("najeeb-portfolio/", "game-gallery", "Battle Zone!")).toBe("/najeeb-portfolio/games/battle-zone/screenshots");
    expect(folderFor("/x", "game-cover", "")).toBe("/x/games/unsorted/cover");
  });
  it("only allows PDFs for resumes", () => {
    expect(kindRules("resume").accept).toEqual(["application/pdf"]);
    expect(kindRules("avatar").accept).not.toContain("application/pdf");
  });
});
