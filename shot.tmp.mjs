import { chromium } from "@playwright/test";
const [,, out, ...paths] = process.argv;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push("PAGEERR " + e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 300)));
await p.goto("http://localhost:3000/admin/login");
await p.fill("#email", "najibyarkhan@gmail.com");
await p.fill("#password", "Test-Admin-Pass-2026");
await p.click("button[type=submit]");
await p.waitForURL(/\/admin$/, { timeout: 60000 });
for (const spec of paths) {
  const [path, name, w] = spec.split("|");
  if (w) await p.setViewportSize({ width: Number(w), height: 900 });
  await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: name.endsWith("-full") });
}
console.log("errors:", errs.slice(0, 10));
await b.close();
