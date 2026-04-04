import { APIRequestContext, APIResponse } from "@playwright/test";

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export class BookingService {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAll(filters?: {
    firstname?: string;
    lastname?: string;
    checkin?: string;
    checkout?: string;
  }): Promise<APIResponse> {
    return this.request.get("/booking", { params: filters });
  }

  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async create(payload: BookingPayload): Promise<APIResponse> {
    return this.request.post("/booking", { data: payload });
  }

  async update(
    id: number,
    payload: BookingPayload,
    token: string,
  ): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: payload,
      headers: { Cookie: `token=${token}` },
    });
  }

  async partialUpdate(
    id: number,
    payload: Partial<BookingPayload>,
    token: string,
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: payload,
      headers: { Cookie: `token=${token}` },
    });
  }

  async delete(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
  }
}
