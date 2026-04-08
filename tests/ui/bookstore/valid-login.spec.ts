import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";
import { ENV } from "../../../config/environments";

test.describe("Authentication Flow", () => {
  // Global 60s timeout applies. CI retries (--retries=2) handle sandbox cold-start flakes.
  test("Valid User Login @smoke", async ({ loginPage }) => {
    // 1. Navigate to /login — verify form elements are present via POM locators
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // 2. Enter valid credentials and click Login
    await loginPage.login(ENV.ui.username, ENV.ui.password);

    await loginPage.page.waitForURL("**/profile");
    await expect(loginPage.userNameDisplay).toBeVisible();
    await expect(loginPage.logoutButton).toBeVisible();
  });

});
