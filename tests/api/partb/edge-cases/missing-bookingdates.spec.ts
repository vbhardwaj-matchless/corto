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

  test('Handle missing bookingdates object', async ({ bookingService }) => {
    // 1. Send POST request with payload missing the entire bookingdates object
    
    const payloadWithoutBookingdates = {
      firstname: "Missing",
      lastname: "Dates", 
      totalprice: 150,
      depositpaid: true,
      // bookingdates: intentionally omitted
      additionalneeds: "Test validation"
    };

    const response = await bookingService.create(payloadWithoutBookingdates);
    
    // expect: Response returns HTTP 500 status
    expect(response.status()).toBe(500);
    
    const responseBody = await response.json();
    
    // expect: Server rejects request due to missing required nested object
    // expect: Booking is not created
    expect(responseBody).not.toHaveProperty('bookingid');
  });
});