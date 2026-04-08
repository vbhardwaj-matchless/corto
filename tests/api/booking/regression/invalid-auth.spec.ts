import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/api.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";
import { ENV } from "../../../../config/environments";

test.use({ baseURL: ENV.api.baseUrl });

test.describe("Authentication", () => {
  test("Invalid Credentials — Body Assertion Required @regression", async ({
    request,
  }) => {
    // 1. POST /auth with invalid credentials
    // The API returns 200 in both success and failure cases — assert on body not status
    const start = Date.now();
    const response = await request.post("/auth", {
      data: { username: "wrong", password: "wrong" },
    });

    assertResponseTime(Date.now() - start, 3000);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ reason: "Bad credentials" });
    expect(body.token).toBeUndefined();
    // Failed auth must NOT set a session cookie
    const setCookie = response.headers()["set-cookie"];
    expect(setCookie).toBeUndefined();
  });
});
