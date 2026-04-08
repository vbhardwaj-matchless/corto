import { z } from "zod";

// ── Booking payload (request body) ──────────────────────────────────────────
export const BookingDatesSchema = z.object({
  checkin: z.string(),
  checkout: z.string(),
});

export const BookingPayloadSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

// ── POST /booking response ───────────────────────────────────────────────────
export const BookingResponseSchema = z.object({
  bookingid: z.number(),
  booking: BookingPayloadSchema,
});

// ── GET /booking response (list) ─────────────────────────────────────────────
export const BookingListSchema = z.array(z.object({ bookingid: z.number() }));

// ── POST /auth response ───────────────────────────────────────────────────────
export const TokenSchema = z.object({
  token: z.string(),
});

// ── Derived TypeScript types ──────────────────────────────────────────────────
export type BookingDates = z.infer<typeof BookingDatesSchema>;
export type BookingPayloadData = z.infer<typeof BookingPayloadSchema>;
export type BookingResponse = z.infer<typeof BookingResponseSchema>;
export type BookingList = z.infer<typeof BookingListSchema>;
export type TokenResponse = z.infer<typeof TokenSchema>;
