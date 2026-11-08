import { expect, test } from "@playwright/test";
import { cssVar, login, saveForm } from "./helpers";

test.describe.configure({ mode: "serial" });

test("auth: redirect, bad password, login, logout; lockout after 5 failures", async ({ page }) => {
  await page.goto("/admin/games");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fgames/);
  await page.fill("#email", "e2e-admin@example.com");
  await page.fill("#password", "wrong-password");
  await page.click("button[type=submit]");
  await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
  await login(page);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);

  const attempt = async (pw: string) => {
    await page.fill("#email", "nobody@example.com");
    await page.fill("#password", pw);
    await Promise.all([page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/admin/login")), page.click("button[type=submit]")]);
    await expect(page.getByRole("button", { name: "Log in" })).toBeEnabled();
  };
  for (let i = 0; i < 5; i++) await attempt(`bad-${i}`);
  await attempt("bad-again");
  await expect(page.getByText(/Too many attempts. Try again in \d+ minutes?/)).toBeVisible();
});

test("edit content → live: hero tagline", async ({ page }) => {
  await login(page);
  await page.goto("/admin/profile?tab=hero");
  const tagline = `I build games, tested at ${Date.now()}.`;
  await page.fill("#tagline", tagline);
  await saveForm(page);
  await page.goto("/");
  await expect(page.locator(".tagline")).toHaveText(tagline);
});

test("games CRUD: create, publish, slug change redirects, unpublish, delete", async ({ page }) => {
  await login(page);
  await page.goto("/admin/games/new");
  await page.fill("#title", "E2E Test Game");
  await expect(page.locator("#slug")).toHaveValue("e2e-test-game");
  await page.fill("#short", "A game created by the end-to-end test.");
  await page.fill("#genre", "Testing");
  await page.locator("#published").click();
  await saveForm(page);
  await expect(page).toHaveURL(/\/admin\/games\/[a-f0-9]{24}$/);

  await page.goto("/");
  await expect(page.getByRole("link", { name: /View all 9 games/ })).toBeVisible();
  await page.goto("/games");
  await expect(page.getByRole("button", { name: "Testing", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "E2E Test Game" })).toBeVisible();

  await page.goto("/admin/games");
  await page.getByRole("link", { name: /E2E Test Game/ }).click();
  await page.fill("#slug", "e2e-renamed");
  await saveForm(page);
  const res = await page.goto("/games/e2e-test-game");
  expect(res?.url()).toMatch(/\/games\/e2e-renamed$/);

  await page.goto("/admin/games");
  await page.getByRole("switch", { name: "Published: E2E Test Game" }).click();
  await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
  expect((await page.goto("/games/e2e-renamed"))?.status()).toBe(404);

  await page.goto("/admin/games");
  await page.getByRole("button", { name: "More actions for E2E Test Game" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete game" }).click();
  await expect(page.getByRole("link", { name: /E2E Test Game/ })).toHaveCount(0);
});

test("reorder with the keyboard → home shows the new first game", async ({ page }) => {
  await login(page);
  await page.goto("/admin/games");
  const handles = page.getByRole("button", { name: "Drag to reorder" });
  const third = await page.locator("ul[aria-label=Games] > li").nth(2).locator("a span.font-semibold").first().textContent();
  await handles.nth(2).focus();
  for (const key of ["Space", "ArrowUp", "ArrowUp", "Space"]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(300); // let dnd-kit measure between moves
  }
  await expect(page.getByText("Order saved · live site updated")).toBeVisible();
  await page.goto("/");
  await expect(page.locator("#games .proj h3").first()).toHaveText(third ?? "");
});

test("layout: hide Services, rename Games label", async ({ page }) => {
  await login(page);
  await page.goto("/admin/layout-sections");
  await page.getByRole("switch", { name: "Show Services section" }).click();
  await page.getByLabel("Games menu label").fill("Projects");
  await saveForm(page);
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Services" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Projects" })).toBeVisible();
  await expect(page.locator("#services")).toHaveCount(0);

  await page.goto("/admin/layout-sections");
  await page.getByRole("switch", { name: "Show Services section" }).click();
  await page.getByLabel("Games menu label").fill("Games");
  await saveForm(page);
});

test("theme: preset → preview updates, live unchanged until Publish", async ({ page }) => {
  await login(page);
  await page.goto("/admin/theme");
  await page.getByRole("button", { name: /Sunset Synth/ }).click();
  const frame = page.frameLocator('iframe[title="Live preview of your site"]');
  await expect(frame.locator("h1")).toBeVisible();
  await expect.poll(async () => (await page.locator("iframe").elementHandle())!.contentFrame().then((f) => f!.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()))).toBe("#FB7185");
  await page.waitForTimeout(1200); // draft autosave

  const visitor = await page.context().browser()!.newPage();
  await visitor.goto("http://localhost:3100/");
  expect(await cssVar(visitor, "--primary")).toBe("#7C5CFF");

  await page.getByRole("button", { name: "Publish theme" }).click();
  await expect(page.getByText("Theme published · live site updated")).toBeVisible();
  await visitor.goto("http://localhost:3100/");
  expect(await cssVar(visitor, "--primary")).toBe("#FB7185");

  await page.getByRole("button", { name: /Neon Arcade/ }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Publish theme" }).click();
  await expect(page.getByText("Theme published · live site updated")).toBeVisible();
  await visitor.close();
});

test("backup: export then import the same file leaves content unchanged", async ({ page }) => {
  await login(page);
  const before = await (await page.request.get("/api/backup/export")).json();
  await page.goto("/admin/backup");
  await page.locator('input[type=file]').setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(before)) });
  await page.getByLabel("Type REPLACE to confirm").fill("REPLACE");
  await page.getByRole("button", { name: "Replace content" }).click();
  await expect(page.getByText("Backup restored · live site updated")).toBeVisible();
  const after = await (await page.request.get("/api/backup/export")).json();
  delete before.exportedAt;
  delete after.exportedAt;
  expect(after).toEqual(before);
});

test("admin actions reject calls without a session", async ({ request }) => {
  expect((await request.post("/api/upload/auth", { data: { kind: "avatar" } })).status()).toBe(401);
  expect((await request.get("/api/backup/export")).status()).toBe(401);
  expect((await request.get("/api/messages/export")).status()).toBe(401);
});

test("mobile admin: game form is usable and the save bar shows", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto("/admin/games");
  await page.getByRole("link", { name: /Block Puzzle/ }).click();
  await page.fill("#short", "A relaxing block puzzle (mobile edit).");
  await expect(page.getByText("You have unsaved changes")).toBeVisible();
  await page.getByRole("button", { name: "Discard" }).click();
});
