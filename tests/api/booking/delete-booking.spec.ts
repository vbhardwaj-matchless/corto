import { expect } from "@playwright/test";
import { test } from "../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../utils/response-timer";
import { ENV } from "../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Booking Management", () => {
  test("Delete Booking @regression", async ({
    request,
    bookingService,
    createdBooking,
    authToken,
  }) => {
    // 1. DELETE /booking/{id} with valid token — returns 201 "Created" (API quirk, confirmed live)
    const start = Date.now();
    const deleteResponse = await bookingService.delete(
      createdBooking.id,
      authToken,
    );
    assertResponseTime(Date.now() - start, 3000);
    expect(deleteResponse.status()).toBe(201);
    const deleteBody = await deleteResponse.text();
    expect(deleteBody).toContain("Created");

    // 2. GET /booking/{id} after deletion — expect 404
    const getAfterDelete = await bookingService.getById(createdBooking.id);
    expect(getAfterDelete.status()).toBe(404);
    const getBody = await getAfterDelete.text();
    expect(getBody).toContain("Not Found");

    // 3. DELETE /booking/{id} without auth token — expect 403 (booking is already gone; 403 from auth check is returned first)
    const noAuthResponse = await request.delete(
      `/booking/${createdBooking.id}`,
    );
    expect(noAuthResponse.status()).toBe(403);

    // 4. DELETE /booking/999999 with valid token — non-existent ID returns 405 (confirmed live)
    const noExistResponse = await bookingService.delete(999999, authToken);
    expect(noExistResponse.status()).toBe(405);
  });
});
