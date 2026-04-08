import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/ui.fixtures";

test.describe("Authentication Flow", () => {
  test("Invalid Login Credentials @regression", async ({ loginPage }) => {
    // 1. Navigate to /login is handled by the loginPage fixture

    // 2. Enter invalid credentials and click Login
    await loginPage.login("invaliduser", "wrongpassword");

    expect(new URL(loginPage.page.url()).pathname).toBe("/login");
    await expect(loginPage.page.locator("#name")).toHaveText(
      "Invalid username or password!",
    );
  });
});
