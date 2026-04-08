import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";
import { KNOWN_BOOKS } from "../../../data/ui/bookstore.data";
import { ENV } from "../../../config/environments";

const { title: BOOK_TITLE } = KNOWN_BOOKS.gitPocketGuide;

test.describe("Collection Management", () => {
  test.setTimeout(120_000);

  test("Add Book to Collection @smoke", async ({
    emptyCollection: _empty,
    bookStorePage,
  }) => {
    const page = bookStorePage.page;
    // bookStorePage fixture already navigated to /books

    // 1. Filter the list and open the book's detail page
    await bookStorePage.searchFor(BOOK_TITLE);
    await bookStorePage.clickBook(BOOK_TITLE);

    // 2. Verify the detail page loaded with the Add button
    await expect(
      page.getByRole("button", { name: "Add To Your Collection" }),
    ).toBeVisible();

    // 3. DemoQA shows a browser alert dialog after a successful add — accept it
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Add To Your Collection" }).click();

    // 4. Navigate to profile and confirm the book appears in the collection
    await page.goto(`${ENV.ui.baseUrl}/profile`);
    await expect(page.getByRole("link", { name: BOOK_TITLE })).toBeVisible();
    await expect(page.getByText("Page 1 of 1")).toBeVisible();
  });
});
