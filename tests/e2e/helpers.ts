import { expect, type Page } from "@playwright/test";
import { ADMIN } from "../../playwright.config";

export async function login(page: Page) {
  await page.goto("/admin/login");
  await page.fill("#email", ADMIN.email);
  await page.fill("#password", ADMIN.password);
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/\/admin$/);
}

/** Saves the current admin form via the sticky save bar. */
export async function saveForm(page: Page) {
  await page.getByRole("button", { name: /^(Save changes|Create game)$/ }).last().click();
  await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
}

export async function cssVar(page: Page, name: string) {
  return page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}
