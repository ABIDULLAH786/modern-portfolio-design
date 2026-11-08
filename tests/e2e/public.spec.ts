import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home renders all visible sections in order, nav works, filters filter", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Najeeb");
  const ids = await page.locator("main > section").evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(["home", "about", "games", "skills", "experience", "services", "contact"]);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Skills" }).click();
  await expect(page.locator("#skills")).toBeInViewport();

  const cards = page.locator("#games .proj");
  const all = await cards.count();
  await page.getByRole("button", { name: "Puzzle", exact: true }).click();
  await expect(cards).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(cards).toHaveCount(all);
});

test("home has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1000);
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test("game page: details, play link and lightbox-free fallback", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Battle Zone Master" }).first().click();
  await expect(page).toHaveURL(/\/games\/battle-zone-master$/);
  await expect(page.locator("h1")).toHaveText("Battle Zone Master");
  const play = page.getByRole("link", { name: /Play on itch\.io/ });
  await expect(play).toHaveAttribute("href", "https://najo98.itch.io/battle-zone-master");
  await expect(play).toHaveAttribute("target", "_blank");
  await expect(play).toHaveAttribute("rel", /noopener/);
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(ld ?? "{}")["@type"]).toBe("VideoGame");
});

test("unknown game is a 404, sitemap lists games", async ({ page, request }) => {
  const res = await page.goto("/games/does-not-exist");
  expect(res?.status()).toBe(404);
  const sm = await (await request.get("/sitemap.xml")).text();
  expect(sm).toContain("/games/battle-zone-master");
});

test("mobile: hamburger menu opens, navigates and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const burger = page.getByRole("button", { name: "Open menu" });
  await burger.click();
  await expect(page.locator("#nav-links")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#nav-links")).toBeHidden();
  await burger.click();
  await page.locator("#nav-links").getByRole("link", { name: "Contact" }).click();
  await expect(page.locator("#nav-links")).toBeHidden();
  await expect(page.locator("#contact")).toBeInViewport();
});
