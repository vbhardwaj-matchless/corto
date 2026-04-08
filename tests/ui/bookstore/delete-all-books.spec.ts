import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";
import { ENV } from "../../../config/environments";
import { ProfilePage } from "../../../pages/bookstore/ProfilePage";

test.describe("Collection Management", () => {
  test("Delete All Books from Collection @regression", async ({
    seededCollection: _seed,
    authenticatedPage,
  }) => {
    const profilePage = new ProfilePage(authenticatedPage);
    // Navigate to /profile — book is seeded via seededCollection fixture
    await authenticatedPage.goto(`${ENV.ui.baseUrl}/profile`);

    // 1. Delete All Books button is visible
    await expect(profilePage.deleteAllBtn).toBeVisible();

    // 2. Click Delete All Books — a React modal appears (NOT a native browser dialog)
    await profilePage.deleteAllBtn.click();
    // Confirm the modal opened by verifying the OK and Cancel buttons are visible
    await expect(profilePage.confirmOkBtn).toBeVisible();
    await expect(profilePage.confirmCancelBtn).toBeVisible();

    // 3. Confirm deletion — DemoQA calls the API then dismisses the modal
    await profilePage.confirmOkBtn.click({ force: true });

    // Collection is now empty — proves deletion succeeded and modal was dismissed
    await expect(profilePage.page.getByText("Page 1 of 0")).toBeVisible({
      timeout: 15_000,
    });
  });
});
