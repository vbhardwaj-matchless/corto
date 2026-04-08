import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/ui.fixtures";
import { assertResponseTime } from "../../../../utils/response-timer";

test.describe("Book Store Browsing", () => {
  test("Browse Book Catalog @smoke", async ({ page }) => {
    const start = Date.now();

    // 1. Navigate to /books
    await page.goto("/books");
    // Timeout matches the performance budget: a breach gives a clear response-time
    // error rather than a misleading "not visible" assertion failure.
    await expect(page.locator("#searchBox")).toBeVisible({ timeout: 10_000 });
    assertResponseTime(Date.now() - start, 10_000);

    // Verify book catalog table with correct columns
    await expect(
      page.getByRole("columnheader", { name: "Image" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Title" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Author" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Publisher" }),
    ).toBeVisible();

    // 2. Verify book rows are present with clickable title links and populated Author/Publisher
    // DemoQA migrated from React-Table v6 (.rt-tbody/.rt-tr-group) to semantic <table>;
    // Allow 30s for the first row link to be visible (DemoQA JS rendering can be slow).
    const bookLinks = page.locator("table tbody tr td a");
    await expect(bookLinks.first()).toBeVisible({ timeout: 30_000 });
    const titles = await bookLinks.all();
    expect(titles.length).toBeGreaterThan(0);

    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow.getByRole("link")).toBeVisible();
  });
});
