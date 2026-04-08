import "dotenv/config";
import { defineConfig } from "@playwright/test";
import { ENV } from "./config/environments";

export default defineConfig({
  projects: [
    {
      name: "smoke",
      grep: /@smoke/,
    },
    {
      name: "regression",
      grep: /@regression/,
    },
    {
      name: "extended",
      grep: /@extended/,
    },
  ],
  use: {
    browserName: "chromium",
    headless: process.env.CI ? true : false,
    baseURL: ENV.ui.baseUrl,
    trace: "on-first-retry",
    video: "on-first-retry",
    actionTimeout: 30000,
  },
  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  timeout: 60000,
  globalTimeout: process.env.CI ? 15 * 60 * 1000 : 0,
  expect: {
    timeout: 5000,
  },
});
