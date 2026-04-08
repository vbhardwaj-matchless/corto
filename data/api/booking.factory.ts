import { BookingPayload } from "../../services/booking/BookingService";
import { shortId } from "../../utils/uuid";

/** ISO date string offset by `daysFromNow` relative to today. */
function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

/** Standard valid booking — safe default for most tests. */
export function createBookingPayload(
  overrides: Partial<BookingPayload> = {},
): BookingPayload {
  const id = shortId();
  return {
    firstname: `Test-${id}`,
    lastname: `Test-${id}`,
    totalprice: 100,
    depositpaid: true,
    bookingdates: {
      checkin: isoDate(1),
      checkout: isoDate(7),
    },
    additionalneeds: "Breakfast",
    ...overrides,
  };
}

/** Boundary: totalprice = 0, depositpaid = false. */
export function createZeroPriceBookingPayload(
  overrides: Partial<BookingPayload> = {},
): BookingPayload {
  return createBookingPayload({
    firstname: "Zero",
    lastname: "Price",
    totalprice: 0,
    depositpaid: false,
    ...overrides,
  });
}

/** Edge case: checkin date is after checkout (API accepts this without validation). */
export function createReversedDatesBookingPayload(
  overrides: Partial<BookingPayload> = {},
): BookingPayload {
  return createBookingPayload({
    firstname: "Reversed",
    lastname: "Dates",
    bookingdates: {
      checkin: isoDate(30),
      checkout: isoDate(1),
    },
    ...overrides,
  });
}
