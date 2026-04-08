import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Booking Management", () => {
  test("Partial Update Booking @regression", async ({
    request,
    bookingService,
    createdBooking,
    authToken,
  }) => {
    const patch = { firstname: "Patched", totalprice: 999 };

    // 1. PATCH /booking/{id} with valid Cookie token
    const start = Date.now();
    const patchResponse = await bookingService.partialUpdate(
      createdBooking.id,
      patch,
      authToken,
    );
    assertResponseTime(Date.now() - start, 3000);
    expect(patchResponse.status()).toBe(200);
    const patchBody = await patchResponse.json();
    expect(patchBody.firstname).toBe("Patched");
    expect(patchBody.totalprice).toBe(999);
    // Unchanged fields must match the original payload
    expect(patchBody.lastname).toBe(createdBooking.payload.lastname);
    expect(patchBody.depositpaid).toBe(createdBooking.payload.depositpaid);
    expect(patchBody.bookingdates).toMatchObject({
      checkin: createdBooking.payload.bookingdates.checkin,
      checkout: createdBooking.payload.bookingdates.checkout,
    });

    // 2. PATCH /booking/{id} without auth token — expect 403
    const noAuthResponse = await request.patch(
      `/booking/${createdBooking.id}`,
      {
        data: patch,
      },
    );
    expect(noAuthResponse.status()).toBe(403);
  });
});
