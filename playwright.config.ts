import { config } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

const { parsed } = config({ path: ".env.e2e" });
const e2eDatabaseUrl = parsed?.DATABASE_URL;

if (!e2eDatabaseUrl) {
  throw new Error(".env.e2e does not define DATABASE_URL");
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  globalSetup: "./e2e/support/global-setup.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { DATABASE_URL: e2eDatabaseUrl, LLM_MODE: "mock", NODE_ENV: "production" },
  },
  projects: [
    { name: "api", testDir: "./e2e/api" },
    { name: "browser", testDir: "./e2e/browser", use: { ...devices["Desktop Chrome"] } },
  ],
});
