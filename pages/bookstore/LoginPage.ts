import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly userNameDisplay: Locator;
  readonly logoutButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("#userName");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login");
    this.userNameDisplay = page.locator("#userName-value");
    this.logoutButton = page.locator("#submit").filter({ hasText: "Logout" });
    this.errorMessage = page.locator("#name");
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: "visible" });
    // textContent() is awaited explicitly — it returns Promise<string | null>
    return (await this.errorMessage.textContent()) ?? "";
  }
}
