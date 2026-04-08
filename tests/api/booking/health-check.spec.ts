import { expect } from "@playwright/test";
import { test } from "../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../utils/response-timer";
import { ENV } from "../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Health Check", () => {
  test("API Health Check @smoke", async ({ request }) => {
    // 1. GET /ping
    const start = Date.now();
    const response = await request.get("/ping");
    // Heroku free-dyno cold-start regularly takes 800–1500ms; 3000ms is the realistic sandbox SLA
    assertResponseTime(Date.now() - start, 3000);

    expect(response.status()).toBe(201);
    const body = await response.text();
    expect(body).toContain("Created");
  });
});
