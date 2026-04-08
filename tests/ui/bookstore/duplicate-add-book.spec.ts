import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";
import { KNOWN_BOOKS } from "../../../data/ui/bookstore.data";

const { title: BOOK_TITLE } = KNOWN_BOOKS.gitPocketGuide;

test.describe("Collection Management", () => {
  test("Duplicate Add Attempt (Negative) @extended", async ({
    seededCollection: _seed,
    bookStorePage,
  }) => {
    // bookStorePage fixture already navigated to /books; use POM to reach the detail page
    await bookStorePage.clickBook(BOOK_TITLE);
    await expect(
      bookStorePage.page.getByRole("button", {
        name: "Add To Your Collection",
      }),
    ).toBeVisible();

    // 2. Register the dialog handler BEFORE clicking — if registered after, the alert fires
    //    before the handler is attached and the test will hang
    let alertText = "";
    bookStorePage.page.once("dialog", async (dialog) => {
      alertText = dialog.message();
      await dialog.accept();
    });

    await bookStorePage.addToCollection();

    // Native window.alert fires with the duplicate-book message
    await expect
      .poll(() => alertText)
      .toBe("Book already present in the your collection!");
  });
});
