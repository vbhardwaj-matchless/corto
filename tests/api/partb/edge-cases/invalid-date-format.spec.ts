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

  test('Handle invalid date format', async ({ bookingService }) => {
    // 1. Send POST request with checkin/checkout dates in invalid format (not YYYY-MM-DD ISO format)
    
    const payloadWithInvalidDateFormat = {
      firstname: "Invalid",
      lastname: "DateFormat", 
      totalprice: 200,
      depositpaid: false,
      bookingdates: {
        checkin: "01/15/2026", // Invalid format - should be YYYY-MM-DD
        checkout: "01/20/2026"  // Invalid format - should be YYYY-MM-DD
      },
      additionalneeds: "Date format test"
    };

    const response = await bookingService.create(payloadWithInvalidDateFormat);
    
    // expect: Response returns HTTP 500 status or validation error
    expect(response.status()).toBe(500);
    
    const responseBody = await response.json();
    
    // expect: Server rejects booking with improperly formatted dates
    // expect: Booking is not created
    expect(responseBody).not.toHaveProperty('bookingid');
  });
});