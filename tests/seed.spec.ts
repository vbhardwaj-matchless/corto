import { test, expect } from "@playwright/test";

/**
 * Seed test for Playwright Planner Agent
 *
 * This test provides the Planner Agent with authenticated context
 * and demonstrates the basic structure of the test suite.
 *
 * The Planner Agent uses this as a reference when generating test plans.
 */

test.describe("Seed Test for Agent Context", () => {
  test("should demonstrate authenticated UI flow @smoke", async ({ page }) => {
    // This is a placeholder seed test
    // The Planner Agent uses this to understand:
    // 1. Import structure
    // 2. Test organization
    // 3. Tagging convention (@smoke, @regression, @extended)
    // 4. Authentication context

    await page.goto("https://demoqa.com/books");
    await expect(page).toHaveTitle(/Book Store/);
  });

  test("should demonstrate API flow structure @smoke", async ({ request }) => {
    // Placeholder API test structure
    // Shows the Planner Agent how API tests are organized

    const response = await request.get(
      "https://restful-booker.herokuapp.com/booking",
    );
    expect(response.ok()).toBeTruthy();
  });
});
