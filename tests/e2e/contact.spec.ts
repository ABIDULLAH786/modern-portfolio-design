import { expect, test } from "@playwright/test";
import { login } from "./helpers";

async function fill(page: import("@playwright/test").Page, name: string) {
  await page.fill("#cf-name", name);
  await page.fill("#cf-email", "visitor@studio.com");
  await page.fill("#cf-msg", "Hello Najeeb, I'd like a mobile game built.");
}

test("contact form → inbox (unread) → opening marks it read", async ({ page }) => {
  await page.goto("/#contact");
  await page.waitForTimeout(3200); // minimum time-to-submit
  await fill(page, "E2E Visitor");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".form-ok")).toContainText("Thanks!");

  await login(page);
  await page.goto("/admin/messages");
  const row = page.getByRole("button", { name: /E2E Visitor/ });
  await expect(row).toBeVisible();
  await expect(row.getByLabel("Unread")).toBeVisible();
  await row.click();
  await expect(page.getByRole("heading", { name: "E2E Visitor" })).toBeVisible();
  await page.goto("/admin/messages?status=all");
  await expect(page.getByRole("button", { name: /E2E Visitor/ }).getByLabel("Unread")).toHaveCount(0);
});

test("honeypot submissions report success but store nothing; 6th message is rate-limited", async ({ page }) => {
  await page.goto("/#contact");
  await page.waitForTimeout(3200);
  await fill(page, "Honeypot Bot");
  await page.evaluate(() => {
    const el = document.querySelector<HTMLInputElement>("#cf-company")!;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    setter.call(el, "Spam Inc");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".form-ok")).toBeVisible();

  // One message was sent by the previous test; send until the limit (5/hour) is hit.
  let limited = false;
  for (let i = 0; i < 6 && !limited; i++) {
    await page.waitForTimeout(3200);
    await fill(page, `Rate ${i}`);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator(".form-ok, .form-err")).toBeVisible();
    limited = await page.locator(".form-err").isVisible();
  }
  expect(limited).toBe(true);
  await expect(page.locator(".form-err")).toContainText("try again later");

  await login(page);
  await page.goto("/admin/messages?status=all");
  await expect(page.getByRole("button", { name: /Honeypot Bot/ })).toHaveCount(0);
});
