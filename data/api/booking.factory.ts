import { BookingPayload } from "../../services/booking/BookingService";
import { shortId } from "../../utils/uuid";

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
      checkin: "2025-01-01",
      checkout: "2025-01-07",
    },
    additionalneeds: "Breakfast",
    ...overrides,
  };
}
