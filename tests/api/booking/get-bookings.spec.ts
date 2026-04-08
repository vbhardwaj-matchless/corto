import { expect } from "@playwright/test";
import { test } from "../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../utils/response-timer";
import { validateSchema } from "../../../utils/schema-validator";
import bookingListSchema from "../../../data/api/schemas/bookingList.schema.json";
import { ENV } from "../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Booking Management", () => {
  test("Retrieve All Bookings @smoke", async ({ bookingService }) => {
    // 1. GET /booking
    const start = Date.now();
    const response = await bookingService.getAll();
    // Heroku free-dyno cold-start regularly takes 800–1500ms; 3000ms is the realistic sandbox SLA
    assertResponseTime(Date.now() - start, 3000);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    body.forEach((item: Record<string, unknown>) => {
      expect(typeof item.bookingid).toBe("number");
    });
    await validateSchema(response, bookingListSchema as object);
  });
});
