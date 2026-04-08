import { expect } from "@playwright/test";
import { test } from "../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../utils/response-timer";
import { validateSchema } from "../../../utils/schema-validator";
import { AuthService } from "../../../services/booking/AuthService";
import {
  BookingResponseSchema,
  BookingListSchema,
  TokenSchema,
} from "../../../data/api/schemas/booking.schema";
import { ENV } from "../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Data Validation and Edge Cases", () => {
  test("Response Schema Validation @regression", async ({
    request,
    bookingService,
    createdBooking,
    authToken,
  }) => {
    // 1. Validate POST /booking response shape against booking.schema.json
    //    Re-create one booking inline so we can validate the full POST response envelope
    //    {bookingid, booking}. createdBooking is used for its id for the GET assertions below.
    const start = Date.now();
    const createResponse = await bookingService.create(createdBooking.payload);
    assertResponseTime(Date.now() - start, 3000);

    expect(createResponse.status()).toBe(200);
    await validateSchema(createResponse, BookingResponseSchema);
    const createBody = await createResponse.json();
    expect(typeof createBody.bookingid).toBe("number");
    expect(typeof createBody.booking.firstname).toBe("string");
    expect(typeof createBody.booking.lastname).toBe("string");
    expect(typeof createBody.booking.totalprice).toBe("number");
    expect(typeof createBody.booking.depositpaid).toBe("boolean");
    expect(typeof createBody.booking.bookingdates.checkin).toBe("string");
    expect(typeof createBody.booking.bookingdates.checkout).toBe("string");
    // Cleanup the extra booking created above
    await bookingService.delete(createBody.bookingid, authToken);

    // 2. Validate GET /booking response against bookingList.schema.json
    const listResponse = await bookingService.getAll();
    expect(listResponse.status()).toBe(200);
    await validateSchema(listResponse, BookingListSchema);

    // 3. Validate POST /auth response against token.schema.json (via AuthService)
    const authService = new AuthService(request);
    const authResponse = await authService.createToken(
      ENV.api.adminUsername,
      ENV.api.adminPassword,
    );
    expect(authResponse.status()).toBe(200);
    await validateSchema(authResponse, TokenSchema);
    const authBody = await authResponse.json();
    expect(typeof authBody.token).toBe("string");
  });
});
