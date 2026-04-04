import {
  test as base,
  Page,
  BrowserContext,
  APIRequestContext,
} from "@playwright/test";
import { ENV } from "../config/environments";
import { LoginPage } from "../pages/bookstore/LoginPage";
import { BookStorePage } from "../pages/bookstore/BookStorePage";
import { ProfilePage } from "../pages/bookstore/ProfilePage";

type Fixtures = {
  authenticatedPage: Page;
  loginPage: LoginPage;
  bookStorePage: BookStorePage;
  profilePage: ProfilePage;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ browser, request }, use) => {
    // Login via API
    const response = await request.post("https://demoqa.com/Account/v1/Login", {
      data: {
        userName: ENV.ui.username,
        password: ENV.ui.password,
      },
    });
    const body = await response.json();
    const { userId, token } = body;
    // Create context with storage state
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "token",
        value: token,
        domain: "demoqa.com",
        path: "/",
        httpOnly: false,
        secure: true,
        sameSite: "Lax",
      },
    ]);
    // Set localStorage for session
    const page = await context.newPage();
    await page.goto(ENV.ui.baseUrl);
    await page.evaluate(
      (tokenValue, userIdValue) => {
        localStorage.setItem("token", tokenValue);
        localStorage.setItem("userID", userIdValue);
      },
      token,
      userId,
    );
    await use(page);
    await context.close();
  },
  loginPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${ENV.ui.baseUrl}/login`);
    const loginPage = new LoginPage(page);
    await use(loginPage);
    await context.close();
  },
  bookStorePage: async ({ authenticatedPage }, use) => {
    await authenticatedPage.goto(`${ENV.ui.baseUrl}/books`);
    const bookStorePage = new BookStorePage(authenticatedPage);
    await use(bookStorePage);
  },
  profilePage: async ({ authenticatedPage }, use) => {
    await authenticatedPage.goto(`${ENV.ui.baseUrl}/profile`);
    const profilePage = new ProfilePage(authenticatedPage);
    await profilePage.deleteAllBooks();
    await use(profilePage);
  },
});
