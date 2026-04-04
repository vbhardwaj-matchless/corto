# AGENT_CONSTRAINTS.md

These rules apply to all Playwright Agent (Planner, Generator, Healer) operations in this repo.

## Planner
- Produce Markdown plans in specs/ only.
- Each plan must identify the test layer: @smoke, @regression, or @extended.
- Do not include User Registration flows. Login flows are in scope.

## Generator
- Place UI test files in tests/ui/bookstore/.
- Place API test files in tests/api/booking/.
- Use existing Page Objects from pages/ and Service Objects from services/. Do not create inline page interaction logic inside test files.
- Use fixtures from fixtures/. Do not write beforeEach/afterEach setup inline in test files.
- Tag every test with exactly one of: @smoke, @regression, @extended.
- Do not hardcode credentials, base URLs, or IDs. Use ENV from config/environments.ts.

## Healer
- Fix broken locators only.
- Do not restructure test files, rename methods, or change fixture usage.
- All healer patches require PR review before merge.
- Do not introduce CSS selectors or XPath unless no user-facing locator exists.
