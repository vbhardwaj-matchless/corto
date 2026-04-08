import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { validateSchema } from "../../../../utils/schema-validator";
import bookingSchema from "../../../../data/api/schemas/booking.schema.json";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Booking Management", () => {
  let cleanupId: number | null = null;

  test.afterEach(async ({ bookingService, authToken }) => {
    if (cleanupId !== null) {
      await bookingService.delete(cleanupId, authToken);
      cleanupId = null;
    }
  });

  test("Create New Booking @smoke", async ({ bookingService }) => {
    const payload = {
      firstname: "Varun",
      lastname: "TestQE",
      totalprice: 150,
      depositpaid: true,
      bookingdates: { checkin: "2026-01-01", checkout: "2026-01-10" },
      additionalneeds: "Breakfast",
    };

    // 1. POST /booking with a valid payload — expect 200 (not 201)
    const start = Date.now();
    const createResponse = await bookingService.create(payload);
    // Heroku free-dyno cold-start regularly takes 800–2000ms; 3000ms is the realistic sandbox SLA
    assertResponseTime(Date.now() - start, 3000);

    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    expect(typeof createBody.bookingid).toBe("number");
    expect(createBody.booking).toMatchObject(payload);
    await validateSchema(createResponse, bookingSchema as object);
    cleanupId = createBody.bookingid;

    // 2. GET /booking/{id} to confirm persistence — bookingid is absent from the GET response
    const getResponse = await bookingService.getById(createBody.bookingid);
    expect(getResponse.status()).toBe(200);
    const getBody = await getResponse.json();
    expect(getBody).toMatchObject(payload);
    expect((getBody as Record<string, unknown>).bookingid).toBeUndefined();
  });
});
