// spec: specs/create-booking-api-test-plan.md
// seed: tests/seed.spec.ts

import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { validateSchema } from "../../../../utils/schema-validator";
import bookingSchema from "../../../../data/api/schemas/booking.schema.json";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe('Edge Cases and Error Handling', () => {

  test('Handle missing required firstname field', async ({ bookingService }) => {
    // 1. Send POST request with payload missing the required firstname field
    
    const payloadWithoutFirstname = {
      // firstname: intentionally omitted
      lastname: "MissingFirstname", 
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: "2026-10-01",
        checkout: "2026-10-05"
      },
      additionalneeds: "Test validation"
    };

    const response = await bookingService.create(payloadWithoutFirstname);
    
    // expect: Response returns HTTP 500 status (server-side validation)
    expect(response.status()).toBe(500);
    
    // expect: Booking is not created due to missing required field
    // expect: Error response indicates validation failure
    // Note: Server should reject the request and not create a booking
    const responseBody = await response.json();
    
    // Verify no booking was created - response should not contain a valid bookingid
    expect(responseBody).not.toHaveProperty('bookingid');
    
    // Response may contain error information indicating validation failure
    // The exact error format may vary, but the status code is the primary indicator
  });
});