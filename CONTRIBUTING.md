# CONTRIBUTING

See the project documentation for contribution guidelines.

# Contributing

## 1. Prerequisites
- Node.js 20+
- VS Code with Playwright extension
- GitHub Copilot (optional)

## 2. Local setup
1. Clone the repo
2. Run `npm ci`
3. Copy `.env.example` to `.env` and fill in values
4. Run `npx playwright install chromium`

## 3. Running tests locally
- `npm run test:smoke`
- `npm run test:regression`
- `npm run test:extended`

## 4. How to add a UI test
1. Add method to the relevant Page Object in `pages/`
2. Add fixture if new setup/teardown is needed in `fixtures/ui.fixtures.ts`
3. Create spec file in `tests/ui/bookstore/`
4. Tag with `@smoke`, `@regression`, or `@extended`

## 5. How to add an API test
1. Add method to the relevant Service Object in `services/booking/`
2. Add schema to `data/api/schemas/` if validating a new response shape
3. Create spec file in `tests/api/booking/`
4. Tag with `@smoke`, `@regression`, or `@extended`

## 6. PR checklist
- Tests pass locally (`npm run test:smoke` at minimum)
- No linting errors (`npm run lint`)
- New test is tagged with exactly one layer tag
- No hardcoded credentials or URLs
- No assertions inside Page Objects or Service Objects
