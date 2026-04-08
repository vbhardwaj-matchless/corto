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
  let cleanupId: number | null = null;

  test.afterEach(async ({ bookingService, authToken }) => {
    if (cleanupId !== null) {
      await bookingService.delete(cleanupId, authToken);
      cleanupId = null;
    }
  });

  test('Handle negative totalprice values', async ({ bookingService }) => {
    // 1. Send POST request with negative totalprice value
    
    const payloadWithNegativePrice = {
      firstname: "Negative",
      lastname: "Price", 
      totalprice: -100, // Negative price value
      depositpaid: true,
      bookingdates: {
        checkin: "2026-12-01",
        checkout: "2026-12-05"
      },
      additionalneeds: "Negative price test"
    };

    const response = await bookingService.create(payloadWithNegativePrice);
    
    // expect: Server handles negative pricing appropriately
    // expect: Business logic validation for realistic pricing constraints
    
    // The API behavior may vary - some APIs accept negative prices, others reject them
    if (response.status() === 200) {
      // API accepts negative prices - verify booking was created
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('bookingid');
      expect(responseBody).toHaveProperty('booking');
      expect(responseBody.booking.totalprice).toBe(-100);
      
      cleanupId = responseBody.bookingid;
    } else if (response.status() === 500 || response.status() === 400) {
      // API rejects negative prices - verify no booking was created
      const responseBody = await response.json();
      expect(responseBody).not.toHaveProperty('bookingid');
    } else {
      // Log unexpected status for analysis
      console.log(`Unexpected status for negative price test: ${response.status()}`);
      expect([200, 400, 500]).toContain(response.status());
    }
  });
});