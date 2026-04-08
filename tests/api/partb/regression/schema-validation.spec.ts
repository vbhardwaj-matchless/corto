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

  test('Response schema validation', async ({ bookingService }) => {
    // 1. Create booking and validate response against booking.schema.json
    
    const payload = {
      firstname: "Schema",
      lastname: "Validation", 
      totalprice: 175,
      depositpaid: false,
      bookingdates: {
        checkin: "2026-09-01",
        checkout: "2026-09-07"
      },
      additionalneeds: "Airport transfer"
    };

    const response = await bookingService.create(payload);
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // expect: Response body structure matches booking.schema.json specification
    expect(() => validateSchema(responseBody, bookingSchema)).not.toThrow();
    
    // expect: All required fields are present with correct data types
    expect(responseBody).toHaveProperty('bookingid');
    expect(typeof responseBody.bookingid).toBe('number');
    expect(responseBody).toHaveProperty('booking');
    expect(typeof responseBody.booking).toBe('object');
    
    const booking = responseBody.booking;
    expect(typeof booking.firstname).toBe('string');
    expect(typeof booking.lastname).toBe('string');
    expect(typeof booking.totalprice).toBe('number');
    expect(typeof booking.depositpaid).toBe('boolean');
    expect(typeof booking.bookingdates).toBe('object');
    expect(typeof booking.bookingdates.checkin).toBe('string');
    expect(typeof booking.bookingdates.checkout).toBe('string');
    
    // expect: Response format is consistent and valid
    expect(booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(booking.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Verify optional field type if present
    if (booking.additionalneeds) {
      expect(typeof booking.additionalneeds).toBe('string');
    }

    // Store for cleanup
    cleanupId = responseBody.bookingid;
  });
});