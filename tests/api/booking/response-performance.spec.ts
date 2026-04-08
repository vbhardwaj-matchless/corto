import { expect } from "@playwright/test";
import { test } from "../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../utils/response-timer";
import { createBookingPayload } from "../../../data/api/booking.factory";
import { ENV } from "../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("API Response Performance", () => {
  // Budget: 3000ms — Heroku free-dyno SLA for this sandbox environment.
  // Production SLO is 500ms; update the budget constant below when running against a production-grade host.
  const BUDGET_MS = 3000;

  test("Response Time Baselines @extended", async ({
    request,
    bookingService,
    createdBooking,
    authToken,
  }) => {
    let start: number;

    // 1. GET /ping
    start = Date.now();
    await request.get("/ping");
    assertResponseTime(Date.now() - start, BUDGET_MS);

    // 2. GET /booking
    start = Date.now();
    await bookingService.getAll();
    assertResponseTime(Date.now() - start, BUDGET_MS);

    // 3. POST /booking
    const postPayload = createBookingPayload();
    start = Date.now();
    const postResponse = await bookingService.create(postPayload);
    assertResponseTime(Date.now() - start, BUDGET_MS);
    const postBody = await postResponse.json();
    await bookingService.delete(postBody.bookingid, authToken);

    // 4. GET /booking/{id}
    start = Date.now();
    await bookingService.getById(createdBooking.id);
    assertResponseTime(Date.now() - start, BUDGET_MS);

    // 5. DELETE /booking/{id} (fixture cleanup will silently handle the 404)
    start = Date.now();
    await bookingService.delete(createdBooking.id, authToken);
    assertResponseTime(Date.now() - start, BUDGET_MS);

    expect(true).toBe(true);
  });
});
