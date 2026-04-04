import { Page, Locator } from "@playwright/test";

export class ProfilePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getCollectionTitles(): Promise<string[]> {
    const rows = await this.page.locator(".rt-tbody .rt-tr-group").all();
    const titles: string[] = [];
    for (const row of rows) {
      const title = await row.locator("a").textContent();
      if (title) titles.push(title.trim());
    }
    return titles;
  }

  async deleteBook(title: string): Promise<void> {
    const row = this.page.getByRole("row", { name: new RegExp(title, "i") });
    const deleteButton = row.getByRole("button", { name: "Delete" });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      const confirm = this.page.getByRole("button", { name: "OK" });
      await confirm.click();
    }
  }

  async deleteAllBooks(): Promise<void> {
    const deleteAll = this.page.getByRole("button", {
      name: "Delete All Books",
    });
    if (await deleteAll.isVisible()) {
      await deleteAll.click();
      const confirm = this.page.getByRole("button", { name: "OK" });
      await confirm.click();
    }
  }

  async isCollectionEmpty(): Promise<boolean> {
    const titles = await this.getCollectionTitles();
    return titles.length === 0;
  }
}
