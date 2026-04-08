// spec: specs/create-booking-api-test-plan.md
// seed: tests/seed.spec.ts

import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { validateSchema } from "../../../../utils/schema-validator";
import bookingSchema from "../../../../data/api/schemas/booking.schema.json";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe('Regression Tests', () => {
  let cleanupId: number | null = null;

  test.afterEach(async ({ bookingService, authToken }) => {
    if (cleanupId !== null) {
      await bookingService.delete(cleanupId, authToken);
      cleanupId = null;
    }
  });

  test('Response time performance validation', async ({ bookingService }) => {
    // 1. Send POST request to create booking and measure response time
    
    const payload = {
      firstname: "Performance",
      lastname: "Test", 
      totalprice: 300,
      depositpaid: true,
      bookingdates: {
        checkin: "2026-08-01",
        checkout: "2026-08-08"
      },
      additionalneeds: "Wi-Fi"
    };

    const startTime = Date.now();
    const response = await bookingService.create(payload);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // expect: Response time is within 3000ms (Heroku free-dyno SLA)
    assertResponseTime(response, 3000);
    expect(responseTime).toBeLessThanOrEqual(3000);
    
    // expect: Booking creation completes successfully within performance threshold
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('bookingid');
    expect(responseBody).toHaveProperty('booking');
    
    // Verify the booking was created correctly
    expect(responseBody.booking.firstname).toBe(payload.firstname);
    expect(responseBody.booking.lastname).toBe(payload.lastname);

    // Store for cleanup
    cleanupId = responseBody.bookingid;
  });
});