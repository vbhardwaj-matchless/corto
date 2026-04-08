import { expect } from "@playwright/test";
import { test } from "../../../fixtures/ui.fixtures";
import { KNOWN_BOOKS } from "../../../data/ui/bookstore.data";

const { title: BOOK_TITLE } = KNOWN_BOOKS.gitPocketGuide;

test.describe("Book Store Browsing", () => {
  test("Search Functionality @regression", async ({ bookStorePage }) => {
    // bookStorePage fixture already navigated to /books

    // 1. Type "Git" into #searchBox — list should filter
    await bookStorePage.searchFor("Git");

    await expect(
      bookStorePage.page.getByRole("link", { name: BOOK_TITLE }),
    ).toBeVisible();
    const titlesAfterSearch = await bookStorePage.getBookTitles();
    for (const title of titlesAfterSearch) {
      expect(title.toLowerCase()).toContain("git");
    }

    // 2. Clear the search box — all 8 books should be displayed again
    await bookStorePage.clearSearch();

    const titlesAfterClear = await bookStorePage.getBookTitles();
    expect(titlesAfterClear.length).toBe(8);
  });
});
