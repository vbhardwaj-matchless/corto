import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { validateSchema } from "../../../../utils/schema-validator";
import tokenSchema from "../../../../data/api/schemas/token.schema.json";
import { AuthService } from "../../../../services/booking/AuthService";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Authentication", () => {
  test("Generate Valid Authentication Token @smoke", async ({ request }) => {
    const authService = new AuthService(request);

    // 1. POST /auth with valid credentials (via AuthService)
    const start = Date.now();
    const response = await authService.createToken(
      ENV.api.adminUsername,
      ENV.api.adminPassword,
    );
    // Heroku free-dyno cold-start regularly takes 800–2000ms; 3000ms is the realistic sandbox SLA
    assertResponseTime(Date.now() - start, 3000);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(typeof body.token).toBe("string");
    await validateSchema(response, tokenSchema as object);
  });
});
