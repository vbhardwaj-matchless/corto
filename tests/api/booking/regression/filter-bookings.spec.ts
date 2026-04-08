import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Filter Bookings", () => {
  test("Filter Bookings by Query Params @regression", async ({
    bookingService,
    createdBooking,
  }) => {
    // createdBooking uses the factory which sets firstname/lastname from createBookingPayload()
    const { id, payload } = createdBooking;

    // 1. GET /booking?firstname=<known value> — result must include the booking we just created
    const start = Date.now();
    const firstnameResponse = await bookingService.getAll({
      firstname: payload.firstname,
    });
    assertResponseTime(Date.now() - start, 3000);

    expect(firstnameResponse.status()).toBe(200);
    const firstnameBody: Array<{ bookingid: number }> =
      await firstnameResponse.json();
    expect(Array.isArray(firstnameBody)).toBe(true);
    expect(firstnameBody.some((b) => b.bookingid === id)).toBe(true);

    // 2. GET /booking?lastname=<known value> — result must include the booking we just created
    const lastnameResponse = await bookingService.getAll({
      lastname: payload.lastname,
    });
    expect(lastnameResponse.status()).toBe(200);
    const lastnameBody: Array<{ bookingid: number }> =
      await lastnameResponse.json();
    expect(Array.isArray(lastnameBody)).toBe(true);
    expect(lastnameBody.some((b) => b.bookingid === id)).toBe(true);

    // 3. GET /booking?firstname=ZZZNOMATCH — no-match must return empty array
    const noMatchResponse = await bookingService.getAll({
      firstname: "ZZZNOMATCH",
    });
    expect(noMatchResponse.status()).toBe(200);
    const noMatchBody = await noMatchResponse.json();
    expect(noMatchBody).toEqual([]);
  });
});
