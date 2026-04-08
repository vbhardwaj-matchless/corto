/**
 * Seed file for Playwright Planner Agent — Create Booking API
 *
 * Endpoint:  POST https://restful-booker.herokuapp.com/booking
 * Docs:      https://restful-booker.herokuapp.com/apidoc/index.html#api-Booking-CreateBooking
 *
 * Verified facts (source-of-truth for planner):
 *   - Returns 200 (NOT 201) on success
 *   - Response contains `bookingid` (number) + `booking` (the full payload echo)
 *   - `bookingid` is absent from the subsequent GET /booking/{id} response
 *   - No authentication required to create a booking
 *   - All fields in `bookingdates` are required (checkin / checkout, ISO date strings)
 *   - `additionalneeds` is optional; omitting it is valid
 *   - Missing required fields → 500 (server-side validation, not 400)
 *
 * Request shape:
 *   {
 *     "firstname":      string  (required)
 *     "lastname":       string  (required)
 *     "totalprice":     number  (required)
 *     "depositpaid":    boolean (required)
 *     "bookingdates": {
 *       "checkin":      "YYYY-MM-DD" (required)
 *       "checkout":     "YYYY-MM-DD" (required)
 *     }
 *     "additionalneeds": string (optional)
 *   }
 *
 * Response shape (200 OK):
 *   {
 *     "bookingid": 12345,
 *     "booking": { ...full payload echo... }
 *   }
 *
 * Test cases the Planner Agent should generate:
 *   @smoke
 *     1. Create booking with all valid fields → 200, bookingid is a number, body matches payload
 *     2. Create booking without `additionalneeds` (optional field) → 200
 *
 *   @regression
 *     3. Verify booking persists — GET /booking/{id} after creation → 200, body matches payload
 *     4. Verify bookingid is absent from GET /booking/{id} response
 *     5. Create booking with minimum required fields only (no additionalneeds) → 200
 *     6. Response time is within 3000ms (Heroku free-dyno SLA)
 *     7. Response body matches booking.schema.json
 *
 *   @extended (edge cases)
 *     8. Missing required field (`firstname`) → 500
 *     9. Missing `bookingdates` → 500
 *     10. `totalprice` as a string instead of number → 200 (API coerces) or 500
 *     11. `depositpaid` as a string "true" instead of boolean → 200 (API coerces) or 500
 *     12. Duplicate call with same payload → 200, different bookingid each time (no dedup)
 *
 * How tests are structured in this project:
 *   - Use `test` from fixtures/api.fixtures — provides `bookingService`, `authToken`, `createdBooking`
 *   - `createdBooking` fixture auto-creates + auto-deletes (use for GET/PUT/PATCH/DELETE tests)
 *   - For CREATE tests, manage cleanup manually via `test.afterEach` using `cleanupId`
 *   - Import `createBookingPayload` from data/api/booking.factory for reusable payloads
 *   - Use `assertResponseTime` from utils/response-timer for SLA assertions
 *   - Use `validateSchema` + booking.schema.json from utils/schema-validator for schema assertions
 *   - base URL is set via `test.use({ baseURL: ENV.api.baseUrl })`
 */

import { expect } from "@playwright/test";
import { test } from "../fixtures/api.fixtures";
import { createBookingPayload } from "../data/api/booking.factory";
import { assertResponseTime } from "../utils/response-timer";
import { validateSchema } from "../utils/schema-validator";
import { BookingResponseSchema } from "../data/api/schemas/booking.schema";
import { ENV } from "../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Create Booking — seed / reference", () => {
  let cleanupId: number | null = null;

  test.afterEach(async ({ bookingService, authToken }) => {
    if (cleanupId !== null) {
      await bookingService.delete(cleanupId, authToken);
      cleanupId = null;
    }
  });

  // Reference test — demonstrates the full happy-path pattern.
  // The Planner Agent uses this as the baseline for generated tests.
  test("Create booking with all fields @smoke", async ({ bookingService }) => {
    const payload = createBookingPayload();

    const start = Date.now();
    const response = await bookingService.create(payload);
    assertResponseTime(Date.now() - start, 3000);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.bookingid).toBe("number");
    expect(body.booking).toMatchObject(payload as unknown as Record<string, unknown>);
    await validateSchema(response, BookingResponseSchema);

    cleanupId = body.bookingid;
  });
});
