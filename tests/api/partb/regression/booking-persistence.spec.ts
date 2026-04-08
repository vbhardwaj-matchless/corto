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

  test('Verify booking persistence after creation', async ({ bookingService }) => {
    // 1. Create a booking via POST /booking and capture the returned bookingid
    
    const originalPayload = {
      firstname: "Persistence",
      lastname: "Test", 
      totalprice: 250,
      depositpaid: true,
      bookingdates: {
        checkin: "2026-07-01",
        checkout: "2026-07-10"
      },
      additionalneeds: "Late checkout"
    };

    const createResponse = await bookingService.create(originalPayload);
    
    // expect: Booking creation returns HTTP 200 with valid bookingid
    expect(createResponse.status()).toBe(200);
    
    const createResponseBody = await createResponse.json();
    expect(createResponseBody).toHaveProperty('bookingid');
    expect(typeof createResponseBody.bookingid).toBe('number');
    expect(createResponseBody.bookingid).toBeGreaterThan(0);
    
    const bookingId = createResponseBody.bookingid;
    cleanupId = bookingId;

    // 2. Retrieve the created booking using GET /booking/{id} with the captured bookingid
    const getResponse = await bookingService.getById(bookingId);
    
    // expect: GET request returns HTTP 200 status
    expect(getResponse.status()).toBe(200);
    
    const getResponseBody = await getResponse.json();
    
    // expect: Response body matches the original booking payload
    expect(getResponseBody.firstname).toBe(originalPayload.firstname);
    expect(getResponseBody.lastname).toBe(originalPayload.lastname);
    expect(getResponseBody.totalprice).toBe(originalPayload.totalprice);
    expect(getResponseBody.depositpaid).toBe(originalPayload.depositpaid);
    expect(getResponseBody.bookingdates.checkin).toBe(originalPayload.bookingdates.checkin);
    expect(getResponseBody.bookingdates.checkout).toBe(originalPayload.bookingdates.checkout);
    expect(getResponseBody.additionalneeds).toBe(originalPayload.additionalneeds);
    
    // expect: bookingid field is absent from the GET response body (as documented)
    expect(getResponseBody).not.toHaveProperty('bookingid');
  });
});