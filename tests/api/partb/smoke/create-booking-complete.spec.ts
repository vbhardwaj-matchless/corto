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

  test('Create booking with all valid fields', async ({ bookingService }) => {
    // 1. Send POST request to /booking endpoint with complete valid payload including all required and optional fields
    
    const payload = {
      firstname: "John",
      lastname: "Doe", 
      totalprice: 150,
      depositpaid: true,
      bookingdates: {
        checkin: "2026-05-01",
        checkout: "2026-05-07"
      },
      additionalneeds: "Breakfast"
    };

    const response = await bookingService.create(payload);
    
    // expect: Response returns HTTP 200 status (not 201)
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // expect: Response body contains bookingid as a number
    expect(responseBody).toHaveProperty('bookingid');
    expect(typeof responseBody.bookingid).toBe('number');
    expect(responseBody.bookingid).toBeGreaterThan(0);
    
    // expect: Response body contains booking object with complete payload echo
    expect(responseBody).toHaveProperty('booking');
    expect(responseBody.booking).toBeDefined();
    
    // expect: All submitted fields are accurately reflected in the response
    expect(responseBody.booking.firstname).toBe(payload.firstname);
    expect(responseBody.booking.lastname).toBe(payload.lastname);
    expect(responseBody.booking.totalprice).toBe(payload.totalprice);
    expect(responseBody.booking.depositpaid).toBe(payload.depositpaid);
    expect(responseBody.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(responseBody.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    expect(responseBody.booking.additionalneeds).toBe(payload.additionalneeds);

    // Store for cleanup
    cleanupId = responseBody.bookingid;
  });
});