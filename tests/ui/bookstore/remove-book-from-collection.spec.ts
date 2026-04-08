import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";
import { assertResponseTime } from "../../../utils/response-timer";
import { ENV } from "../../../config/environments";

test.describe("Collection Management", () => {
  test("Remove Single Book from Collection @regression", async ({
    seededCollection,
    profilePage,
  }) => {
    const BOOK_ISBN = seededCollection;
    const page = profilePage.page;

    // Navigate to /profile — book is already seeded via seededCollection fixture
    const navStart = Date.now();
    await page.goto(`${ENV.ui.baseUrl}/profile`);
    // Timeout matches the performance budget: a breach gives a clear response-time
    // error rather than a misleading "not visible" assertion failure.
    await expect(
      page.getByRole("link", { name: "Git Pocket Guide" }),
    ).toBeVisible({ timeout: 10_000 });
    assertResponseTime(Date.now() - navStart, 10_000);

    // 1. Delete icon is visible in the Action column
    await expect(profilePage.deleteBookSpan(BOOK_ISBN).first()).toBeVisible();

    // 2. Click the delete icon for the Git Pocket Guide row
    await profilePage.deleteBookSpan(BOOK_ISBN).click();

    // A React modal appears — NOT a native browser dialog
    await expect(profilePage.dialog).toBeVisible();
    await expect(profilePage.dialog).toContainText("Delete Book");
    await expect(
      profilePage.dialog.getByText("Do you want to delete this book?"),
    ).toBeVisible();
    await expect(profilePage.confirmOkBtn).toBeVisible();
    await expect(profilePage.confirmCancelBtn).toBeVisible();

    // 3. Click OK to confirm deletion
    await profilePage.confirmOkBtn.click();
    await expect(profilePage.dialog).toBeHidden({ timeout: 10_000 });
    await expect(
      page.getByRole("link", { name: "Git Pocket Guide" }),
    ).not.toBeVisible({ timeout: 10_000 });
  });
});
