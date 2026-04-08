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

  test('Handle totalprice as string instead of number', async ({ bookingService }) => {
    // 1. Send POST request with totalprice as string value instead of number
    
    const payloadWithStringPrice = {
      firstname: "String",
      lastname: "Price", 
      totalprice: "150", // String instead of number
      depositpaid: true,
      bookingdates: {
        checkin: "2026-11-01",
        checkout: "2026-11-05"
      },
      additionalneeds: "Type coercion test"
    };

    const response = await bookingService.create(payloadWithStringPrice);
    
    // expect: Response returns HTTP 200 (if API performs type coercion) OR HTTP 500 (if strict validation)
    // expect: Behavior is consistent and documented based on server implementation
    
    if (response.status() === 200) {
      // API performs type coercion - verify the booking was created correctly
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('bookingid');
      expect(responseBody).toHaveProperty('booking');
      
      // Verify the price was converted to number or handled appropriately
      expect(responseBody.booking.totalprice).toBeDefined();
      // The API might convert string to number or keep as string
      expect([typeof responseBody.booking.totalprice === 'number', String(responseBody.booking.totalprice) === '150']).toContain(true);
      
      cleanupId = responseBody.bookingid;
    } else if (response.status() === 500) {
      // API enforces strict validation - verify no booking was created
      const responseBody = await response.json();
      expect(responseBody).not.toHaveProperty('bookingid');
    } else {
      // Unexpected status code - should be either 200 or 500
      throw new Error(`Unexpected response status: ${response.status()}`);
    }
  });
});