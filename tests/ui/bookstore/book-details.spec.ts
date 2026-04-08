import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";
import { KNOWN_BOOKS } from "../../../data/ui/bookstore.data";

const {
  title: BOOK_TITLE,
  isbn: BOOK_ISBN,
  author: BOOK_AUTHOR,
} = KNOWN_BOOKS.gitPocketGuide;

test.describe("Book Store Browsing", () => {
  test("Book Detail View @regression", async ({ bookStorePage }) => {
    const page = bookStorePage.page;

    // 1. Click on the title link from the book list
    await bookStorePage.clickBook(BOOK_TITLE);

    await page.waitForURL(`**/books?search=${BOOK_ISBN}`);
    expect(page.url()).toContain(`/books?search=${BOOK_ISBN}`);

    // Verify all detail fields
    await expect(page.locator("#ISBN-wrapper")).toContainText(BOOK_ISBN);
    await expect(page.locator("#title-wrapper")).toContainText(BOOK_TITLE);
    await expect(page.locator("#subtitle-wrapper")).toContainText(
      "A Working Introduction",
    );
    await expect(page.locator("#author-wrapper")).toContainText(BOOK_AUTHOR);
    await expect(page.locator("#publisher-wrapper")).toContainText(
      "O'Reilly Media",
    );
    await expect(page.locator("#pages-wrapper")).toContainText("234");

    // Back To Book Store button is present unauthenticated via #addNewRecordButton
    await expect(
      page
        .locator("#addNewRecordButton")
        .filter({ hasText: "Back To Book Store" }),
    ).toBeVisible();

    // Add To Your Collection button is visible when authenticated (DemoQA duplicate ids — target by role+name)
    await expect(
      page.getByRole("button", { name: "Add To Your Collection" }),
    ).toBeVisible();
  });
});
