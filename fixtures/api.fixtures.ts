import { test as base } from "@playwright/test";
import { AuthService } from "../services/booking/AuthService";
import {
  BookingService,
  BookingPayload,
} from "../services/booking/BookingService";
import { createBookingPayload } from "../data/api/booking.factory";
import { ENV } from "../config/environments";

type WorkerFixtures = {
  authToken: string;
};

type TestFixtures = {
  bookingService: BookingService;
  createdBooking: { id: number; payload: BookingPayload };
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  authToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext({
        baseURL: ENV.api.baseUrl,
      });
      const authService = new AuthService(context);
      const response = await authService.createToken(
        ENV.api.adminUsername,
        ENV.api.adminPassword,
      );
      if (response.status() !== 200)
        throw new Error("Auth token creation failed");
      const body = await response.json();
      if (!body.token) throw new Error("No token in auth response");
      await use(body.token);
      await context.dispose();
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
    const id = body.bookingid ?? body.id;
    await use({ id, payload });
    // Cleanup after test
    try {
      await bookingService.delete(id, authToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      testInfo.annotations.push({
        type: "cleanup",
        description: `Failed to delete booking id ${id}: ${message}`,
      });
    }
  },
});
