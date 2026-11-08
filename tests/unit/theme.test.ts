import { describe, expect, it } from "vitest";
import { contrastRatio, deriveTokens, mix, onColor, relativeLuminance, withAlpha } from "@/lib/theme/derive";
import { PRESETS, PRESET_IDS } from "@/lib/theme/presets";
import { buildTheme, resolveTheme, themeStyleSheet } from "@/lib/theme/resolve";
import type { ThemeSettings } from "@/lib/theme/types";

const base: ThemeSettings = {
  source: { kind: "preset", id: "neon" },
  overrides: {},
  fontPair: "sora",
  radius: 18,
  effect: "starfield",
  animations: true,
  visitorToggle: { enabled: false, darkSource: { kind: "preset", id: "neon" }, lightSource: { kind: "preset", id: "light" } },
};

describe("deriveTokens / onPrimary", () => {
  it.each(["#A3E635", "#EAB308", "#FBBF24"])("uses dark text on bright %s", (hex) => expect(onColor(hex)).toBe("#0B0B10"));
  it.each(["#7C5CFF", "#4F46E5", "#EF4444"])("uses light text on %s", (hex) => expect(onColor(hex)).toBe("#FFFFFF"));
  it("derives every token for every preset as hex/rgba", () => {
    for (const id of PRESET_IDS) {
      const t = deriveTokens(PRESETS[id]);
      expect(t.surface2).toMatch(/^#[0-9A-F]{6}$/);
      expect(t.muted).toMatch(/^#[0-9A-F]{6}$/);
      expect(t.border).toMatch(/^rgba\(/);
      expect(t.gradient).toContain(PRESETS[id].primary);
    }
  });
});

describe("contrast", () => {
  it("neon text on neon background passes easily", () => {
    expect(contrastRatio("#ECECF8", "#0B0B14")).toBeGreaterThan(15);
    expect(contrastRatio("#ECECF8", "#0B0B14")).toBeGreaterThan(4.5);
  });
  it("grey on grey fails", () => expect(contrastRatio("#777777", "#888888")).toBeLessThan(1.5));
  it("is symmetric and luminance is bounded", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(contrastRatio("#000000", "#FFFFFF"));
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1);
  });
});

describe("colour helpers", () => {
  it("mixes like CSS color-mix", () => {
    expect(mix("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    expect(mix("#FF0000", "#0000FF", 1)).toBe("#FF0000");
  });
  it("makes rgba with alpha", () => expect(withAlpha("#7C5CFF", 0.15)).toBe("rgba(124, 92, 255, 0.15)"));
});

describe("theme resolution", () => {
  it("applies overrides over the preset", () => {
    expect(resolveTheme({ ...base, overrides: { primary: "#FB7185" } }, []).primary).toBe("#FB7185");
  });
  it("falls back to neon for unknown sources", () => {
    expect(resolveTheme({ ...base, source: { kind: "custom", id: "missing" } }, []).bg).toBe(PRESETS.neon.bg);
  });
  it("emits CSS variables, radius and fonts", () => {
    const t = buildTheme({ ...base, source: { kind: "preset", id: "sunset" }, radius: 4, fontPair: "arcade" }, []);
    expect(t.vars["--primary"]).toBe("#FB7185");
    expect(t.vars["--radius"]).toBe("4px");
    expect(t.vars["--font-head"]).toBe("var(--font-orbitron)");
    expect(t.vars["--base-size"]).toBe("17px");
  });
  it("emits both light/dark sets when the visitor toggle is on", () => {
    const css = themeStyleSheet(buildTheme({ ...base, visitorToggle: { ...base.visitorToggle, enabled: true } }, []));
    expect(css).toContain('[data-visitor-mode="light"]');
    expect(css).toContain(PRESETS.light.bg);
  });
});

describe("primaryText", () => {
  it("reaches AA on cards and background for every preset", () => {
    for (const id of PRESET_IDS) {
      const t = deriveTokens(PRESETS[id]);
      expect(contrastRatio(t.primaryText, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.primaryText, t.bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
