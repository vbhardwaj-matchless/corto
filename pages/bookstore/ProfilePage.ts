import { Page, Locator } from "@playwright/test";

export class ProfilePage {
  readonly page: Page;
  readonly deleteAllBtn: Locator;
  readonly dialog: Locator;
  readonly confirmOkBtn: Locator;
  readonly confirmCancelBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.deleteAllBtn = page
      .locator("#submit")
      .filter({ hasText: "Delete All Books" })
      .first();
    this.dialog = page.locator('[role="dialog"]');
    this.confirmOkBtn = page.locator("#closeSmallModal-ok");
    this.confirmCancelBtn = page.locator("#closeSmallModal-cancel");
  }

  /** Returns the delete-icon locator for a specific book ISBN within the table. */
  deleteBookSpan(isbn: string): Locator {
    return this.page.locator(`span[id="delete-record-${isbn}"]`);
  }

  async getCollectionTitles(): Promise<string[]> {
    // DemoQA migrated from React-Table v6 (.rt-tbody/.rt-tr-group) to semantic <table>
    const links = await this.page.locator("table tbody tr td a").all();
    const titles: string[] = [];
    for (const link of links) {
      const title = await link.textContent();
      if (title) titles.push(title.trim());
    }
    return titles;
  }

  async deleteBook(title: string, isbn: string): Promise<void> {
    const row = this.page.locator("tbody tr").filter({ hasText: title });
    await row.locator(this.deleteBookSpan(isbn)).click();
    await this.dialog.waitFor({ state: "visible" });
    await this.confirmOkBtn.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async deleteAllBooks(): Promise<void> {
    const titles = await this.getCollectionTitles();
    if (titles.length === 0) return;
    await this.deleteAllBtn.click();
    await this.dialog.waitFor({ state: "visible" });
    await this.confirmOkBtn.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async isCollectionEmpty(): Promise<boolean> {
    const titles = await this.getCollectionTitles();
    return titles.length === 0;
  }
}
