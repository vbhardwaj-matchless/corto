import { APIRequestContext, APIResponse } from "@playwright/test";

export class AuthService {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async createToken(username: string, password: string): Promise<APIResponse> {
    return this.request.post("/auth", {
      data: { username, password },
    });
  }
}
