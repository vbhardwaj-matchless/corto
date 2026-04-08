export const ENV = {
  ui: {
    baseUrl: process.env.UI_BASE_URL ?? "https://demoqa.com",
    username: process.env.DEMOQA_USERNAME ?? "",
    password: process.env.DEMOQA_PASSWORD ?? "",
  },
  api: {
    baseUrl: process.env.API_BASE_URL ?? "https://restful-booker.herokuapp.com",
    adminUsername: process.env.BOOKER_USERNAME ?? "admin",
    adminPassword: process.env.BOOKER_PASSWORD ?? "password123",
  },
  axe: {
    // Set AXE_FAIL_ON_VIOLATION=true in CI to hard-fail on critical/serious a11y regressions.
    // Default is false: violations are annotated in the report but do not block the test.
    failOnViolation: process.env.AXE_FAIL_ON_VIOLATION === "true",
  },
};
