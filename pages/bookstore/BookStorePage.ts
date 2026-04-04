import { Page, Locator } from "@playwright/test";

export class BookStorePage {
  private readonly page: Page;
  private readonly searchInput: Locator;
  private readonly bookRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder("Type to search");
    this.bookRows = page.getByRole("row", { name: /\w+/ });
  }

  async searchFor(title: string): Promise<void> {
    await this.searchInput.fill(title);
  }

  async getBookTitles(): Promise<string[]> {
    const rows = await this.page.locator(".rt-tbody .rt-tr-group").all();
    const titles: string[] = [];
    for (const row of rows) {
      const title = await row.locator("a").textContent();
      if (title) titles.push(title.trim());
    }
    return titles;
  }

  async clickBook(title: string): Promise<void> {
    await this.page.getByRole("link", { name: title }).click();
  }

  async addToCollection(): Promise<void> {
    const addButton = this.page.getByRole("button", {
      name: "Add To Your Collection",
    });
    if (await addButton.isVisible()) {
      await addButton.click();
    }
  }
}
