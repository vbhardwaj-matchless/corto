import { test as base, APIRequestContext, APIResponse } from "@playwright/test";
import { AuthService } from "../services/booking/AuthService";
import {
  BookingService,
  BookingPayload,
} from "../services/booking/BookingService";
import { createBookingPayload } from "../data/api/booking.factory";

type Fixtures = {
  authToken: string;
  bookingService: BookingService;
  createdBooking: { id: number; payload: BookingPayload };
};

export const test = base.extend<Fixtures>({
  authToken: [
    async ({ request }, use, workerInfo) => {
      const authService = new AuthService(request);
      const response = await authService.createToken(
        process.env.BOOKER_USERNAME || "admin",
        process.env.BOOKER_PASSWORD || "password123",
      );
      if (response.status() !== 200)
        throw new Error("Auth token creation failed");
      const body = await response.json();
      if (!body.token) throw new Error("No token in auth response");
      await use(body.token);
    },
    { scope: "worker" },
  ],
  bookingService: async ({ request }, use) => {
    const service = new BookingService(request);
    await use(service);
  },
  createdBooking: async ({ bookingService, authToken }, use, testInfo) => {
    const payload = createBookingPayload();
    const response = await bookingService.create(payload);
    if (response.status() !== 200) throw new Error("Booking creation failed");
    const body = await response.json();
    const id = body.bookingid || body.id;
    await use({ id, payload });
    // Cleanup after test
    try {
      await bookingService.delete(id, authToken);
    } catch (err) {
      testInfo.annotations.push({
        type: "cleanup",
        description: `Failed to delete booking id ${id}`,
      });
    }
  },
});
