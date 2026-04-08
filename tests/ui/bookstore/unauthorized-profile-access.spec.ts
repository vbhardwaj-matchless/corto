import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";

test.describe("Authentication Flow", () => {
  test("Access Profile Without Authentication @regression", async ({
    page,
  }) => {
    // 1. Navigate directly to /profile without logging in
    await page.goto("/profile");

    await expect(
      page.getByText(
        "Currently you are not logged into the Book Store application",
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /login/i }).first(),
    ).toBeVisible();
  });
});
