import { expect } from "@playwright/test";
import { test } from "../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../utils/response-timer";
import { ENV } from "../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Booking Management", () => {
  test("Update Booking (Full Replace) @regression", async ({
    request,
    bookingService,
    createdBooking,
    authToken,
  }) => {
    const updatedPayload = {
      firstname: "Updated",
      lastname: "Payload",
      totalprice: 999,
      depositpaid: false,
      bookingdates: { checkin: "2026-06-01", checkout: "2026-06-10" },
      additionalneeds: "Dinner",
    };

    // 1. PUT /booking/{id} with valid Cookie token
    const start = Date.now();
    const putResponse = await bookingService.update(
      createdBooking.id,
      updatedPayload,
      authToken,
    );
    // Heroku free-dyno cold-start regularly takes 800–2000ms; 3000ms is the realistic sandbox SLA
    assertResponseTime(Date.now() - start, 3000);

    expect(putResponse.status()).toBe(200);
    const putBody = await putResponse.json();
    expect(putBody).toMatchObject(updatedPayload);

    // 2. PUT /booking/{id} without auth token — expect 403
    const noAuthResponse = await request.put(`/booking/${createdBooking.id}`, {
      data: updatedPayload,
    });
    expect(noAuthResponse.status()).toBe(403);

    // 3. GET /booking/{id} to confirm update persisted
    const getResponse = await bookingService.getById(createdBooking.id);
    expect(getResponse.status()).toBe(200);
    const getBody = await getResponse.json();
    expect(getBody).toMatchObject(updatedPayload);
  });
});
