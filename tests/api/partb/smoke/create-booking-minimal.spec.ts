// spec: specs/create-booking-api-test-plan.md
// seed: tests/seed.spec.ts

import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { validateSchema } from "../../../../utils/schema-validator";
import bookingSchema from "../../../../data/api/schemas/booking.schema.json";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe('Smoke Tests', () => {
  let cleanupId: number | null = null;

  test.afterEach(async ({ bookingService, authToken }) => {
    if (cleanupId !== null) {
      await bookingService.delete(cleanupId, authToken);
      cleanupId = null;
    }
  });

  test('Create booking without optional additionalneeds field', async ({ bookingService }) => {
    // 1. Send POST request to /booking endpoint with only required fields (firstname, lastname, totalprice, depositpaid, bookingdates)
    
    const payload = {
      firstname: "Jane",
      lastname: "Smith", 
      totalprice: 200,
      depositpaid: false,
      bookingdates: {
        checkin: "2026-06-01",
        checkout: "2026-06-05"
      }
      // Note: additionalneeds is intentionally omitted
    };

    const response = await bookingService.create(payload);
    
    // expect: Response returns HTTP 200 status
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // expect: Response body contains bookingid as a number
    expect(responseBody).toHaveProperty('bookingid');
    expect(typeof responseBody.bookingid).toBe('number');
    expect(responseBody.bookingid).toBeGreaterThan(0);
    
    // expect: Response body contains booking object without additionalneeds field
    expect(responseBody).toHaveProperty('booking');
    expect(responseBody.booking).toBeDefined();
    
    // expect: All required fields are present and match submitted data
    expect(responseBody.booking.firstname).toBe(payload.firstname);
    expect(responseBody.booking.lastname).toBe(payload.lastname);
    expect(responseBody.booking.totalprice).toBe(payload.totalprice);
    expect(responseBody.booking.depositpaid).toBe(payload.depositpaid);
    expect(responseBody.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(responseBody.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    
    // Verify additionalneeds is not present or is acceptable value
    expect(responseBody.booking.additionalneeds).toBeFalsy();

    // Store for cleanup
    cleanupId = responseBody.bookingid;
  });
});