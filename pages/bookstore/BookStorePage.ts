import { Page, Locator } from "@playwright/test";

export class BookStorePage {
  readonly page: Page;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator("#searchBox");
  }

  async searchFor(title: string): Promise<void> {
    await this.searchInput.fill(title);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill("");
  }

  async getBookTitles(): Promise<string[]> {
    // DemoQA migrated from React-Table v6 (.rt-tbody/.rt-tr-group) to semantic <table>
    const links = await this.page.locator("table tbody tr td a").all();
    const titles: string[] = [];
    for (const link of links) {
      const title = await link.textContent();
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
    await addButton.waitFor({ state: "visible" });
    await addButton.click();
  }
}
