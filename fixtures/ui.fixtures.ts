import { test as base, Page } from "@playwright/test";
import { ENV } from "../config/environments";
import { LoginPage } from "../pages/bookstore/LoginPage";
import { BookStorePage } from "../pages/bookstore/BookStorePage";
import { ProfilePage } from "../pages/bookstore/ProfilePage";
import { runAxeScan } from "../utils/axe-scanner";

type WorkerFixtures = {
  demoqaAuth: {
    token: string;
    userId: string;
    userName: string;
    expires: string;
  };
};

type TestFixtures = {
  authenticatedPage: Page;
  loginPage: LoginPage;
  bookStorePage: BookStorePage;
  profilePage: ProfilePage;
  seededCollection: string;
  emptyCollection: void;
  autoAxeScan: void;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  demoqaAuth: [
    async ({ playwright }, use) => {
      // Use the DemoQA Account API to obtain a session token and userId directly.
      const apiContext = await playwright.request.newContext({
        baseURL: ENV.ui.baseUrl,
        extraHTTPHeaders: { "Content-Type": "application/json" },
      });
      const response = await apiContext.post("/Account/v1/Login", {
        data: { userName: ENV.ui.username, password: ENV.ui.password },
      });
      const responseText = await response.text();
      if (!response.ok())
        throw new Error(
          `DemoQA login API failed: ${response.status()} ${responseText}`,
        );
      if (!responseText || responseText.trim() === "")
        throw new Error(
          `DemoQA login API returned empty body (status ${response.status()})`,
        );
      let loginData: {
        userId: string;
        token: string;
        username: string;
        expires: string;
      };
      try {
        loginData = JSON.parse(responseText) as typeof loginData;
      } catch {
        throw new Error(
          `DemoQA login API returned invalid JSON (status ${response.status()}): ${responseText.slice(0, 200)}`,
        );
      }
      const { userId, token, username, expires } = loginData;
      await apiContext.dispose();
      if (!token || !userId || !username || !expires)
        throw new Error(
          "DemoQA auth failed: missing required fields in API login response",
        );
      await use({ token, userId, userName: username, expires });
    },
    { scope: "worker", timeout: 30_000 },
  ],

  authenticatedPage: async ({ page, context, demoqaAuth }, use) => {
    const { userId, token, userName, expires } = demoqaAuth;
    // Inject auth into the shared Playwright page/context so the base `page`
    // fixture is the same instance used by all POM fixtures and the autoAxeScan fixture.
    await context.addCookies([
      { name: "token", value: token, domain: "demoqa.com", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" as const },
      { name: "userID", value: userId, domain: "demoqa.com", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" as const },
      { name: "userName", value: userName, domain: "demoqa.com", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" as const },
      { name: "expires", value: expires, domain: "demoqa.com", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" as const },
    ]);
    // addInitScript runs before any page script on every navigation — reliable
    // way to seed localStorage before DemoQA's own scripts execute.
    await page.addInitScript(
      ({ token, userId, userName, expires }: { token: string; userId: string; userName: string; expires: string }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userID", userId);
        localStorage.setItem("userName", userName);
        localStorage.setItem("expires", expires);
      },
      { token, userId, userName, expires },
    );
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await page.goto(`${ENV.ui.baseUrl}/login`);
    await use(new LoginPage(page));
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

  seededCollection: async ({ demoqaAuth, request }, use) => {
    const isbn = "9781449325862";
    await request.delete(
      `${ENV.ui.baseUrl}/BookStore/v1/Books?UserId=${demoqaAuth.userId}`,
      { headers: { Authorization: `Bearer ${demoqaAuth.token}` } },
    );
    const seedResponse = await request.post(`${ENV.ui.baseUrl}/BookStore/v1/Books`, {
      data: { userId: demoqaAuth.userId, collectionOfIsbns: [{ isbn }] },
      headers: { Authorization: `Bearer ${demoqaAuth.token}` },
    });
    if (![200, 201, 400].includes(seedResponse.status())) {
      throw new Error(`Failed to seed collection: HTTP ${seedResponse.status()}`);
    }
    await use(isbn);
    await request.delete(
      `${ENV.ui.baseUrl}/BookStore/v1/Books?UserId=${demoqaAuth.userId}`,
      { headers: { Authorization: `Bearer ${demoqaAuth.token}` } },
    );
  },

  emptyCollection: async ({ demoqaAuth, request }, use) => {
    await request.delete(
      `${ENV.ui.baseUrl}/BookStore/v1/Books?UserId=${demoqaAuth.userId}`,
      { headers: { Authorization: `Bearer ${demoqaAuth.token}` } },
    );
    await use();
    await request.delete(
      `${ENV.ui.baseUrl}/BookStore/v1/Books?UserId=${demoqaAuth.userId}`,
      { headers: { Authorization: `Bearer ${demoqaAuth.token}` } },
    );
  },

  // Auto-use fixture: runs once after every test in this suite.
  // Playwright fixture teardown (after `use()`) runs after all afterEach hooks,
  // so API cleanup in afterEach hooks has already completed before the scan.
  autoAxeScan: [
    async ({ page }, use, testInfo) => {
      await use();
      await runAxeScan(page, testInfo);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
