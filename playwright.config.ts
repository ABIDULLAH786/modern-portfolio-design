import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
export const ADMIN = { email: "e2e-admin@example.com", password: "E2e-Test-Password-123" };

/**
 * E2E runs against a production build backed by a separate test database
 * (seeded with --force), with emails logged instead of sent and uploads disabled.
 */
const testEnv = {
  MONGODB_URI: process.env.E2E_MONGODB_URI ?? "mongodb://127.0.0.1:27017/najeeb_portfolio_test",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  EMAIL_TRANSPORT: "log",
  ADMIN_EMAIL: ADMIN.email,
  ADMIN_PASSWORD: ADMIN.password,
  IMAGEKIT_PUBLIC_KEY: "",
  IMAGEKIT_PRIVATE_KEY: "",
  TURNSTILE_SECRET_KEY: "",
  TURNSTILE_SITE_KEY: "",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm seed --force && pnpm create-admin && pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: testEnv,
    stdout: "ignore",
    stderr: "pipe",
  },
});
