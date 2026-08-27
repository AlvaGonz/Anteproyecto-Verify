import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  globalSetup: './e2e/global-setup.ts',
  reporter: [["html", { open: "never", outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: process.env.API_BASE_URL ?? "http://localhost:5000",
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "api",
      testDir: "./e2e/api",
      use: {
        baseURL: process.env.API_BASE_URL ?? "http://localhost:5000",
      },
    },
    {
      name: "auth",
      testDir: "./e2e/auth",
      use: {
        baseURL: process.env.API_BASE_URL ?? "http://localhost:5000",
      },
    },
    {
      name: "frontend",
      testDir: ".",
      testMatch: /(e2e\/projects|tests\/e2e)\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.FRONTEND_URL ?? "http://localhost:3000",
      },
    },
    {
      name: "performance",
      testDir: "./e2e/performance",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.FRONTEND_URL ?? "http://localhost:3000",
      },
    },
  ],
});
