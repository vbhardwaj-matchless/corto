// spec: specs/restful-booker-api-test-plan.md
import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import {
  createZeroPriceBookingPayload,
  createReversedDatesBookingPayload,
} from "../../../../data/api/booking.factory";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Data Validation and Edge Cases", () => {
  // ── Parameterised valid-boundary cases — one test per scenario ──────────
  const validBoundaryCases = [
    {
      label: "zero price boundary",
      payload: createZeroPriceBookingPayload(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert: (body: any) => expect(body.booking.totalprice).toBe(0),
    },
    {
      label: "reversed checkin/checkout dates",
      payload: createReversedDatesBookingPayload(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert: (body: any) =>
        expect(
          new Date(body.booking.bookingdates.checkin) >
            new Date(body.booking.bookingdates.checkout),
        ).toBe(true),
    },
  ];

  for (const { label, payload, assert } of validBoundaryCases) {
    test(`Edge case: ${label} @extended`, async ({
      bookingService,
      authToken,
    }) => {
      const response = await bookingService.create(payload);
      expect(response.status()).toBe(200);
      const body = await response.json();
      assert(body);
      await bookingService.delete(body.bookingid, authToken);
    });
  }

  // ── Missing required field — API returns 500 (confirmed live, not 400) ──
  test("Edge case: missing required field returns 500 @extended", async ({
    request,
  }) => {
    const response = await request.post("/booking", {
      data: {
        firstname: "NoLastname",
        totalprice: 100,
        depositpaid: true,
        bookingdates: { checkin: "2026-01-01", checkout: "2026-01-02" },
      },
    });
    expect(response.status()).toBe(500);
  });

  // ── String ID lookup — API returns 404 (confirmed live) ─────────────────
  test("Edge case: string booking ID returns 404 @extended", async ({
    request,
  }) => {
    const response = await request.get("/booking/abc");
    expect(response.status()).toBe(404);
  });
});
