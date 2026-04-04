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
    baseURL: ENV.ui.baseUrl,
    trace: "on-first-retry",
    video: "on-first-retry",
    actionTimeout: 30000,
  },
  timeout: 60000,
  workers: process.env.CI ? 4 : 2,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
});
