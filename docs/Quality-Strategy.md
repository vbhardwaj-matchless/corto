# Test Strategy Brief

**Author:** Varun

---

## Introduction

This covers the quality approach for both assessment tasks: Web UI (`demoqa.com/books`) and REST API (`restful-booker.herokuapp.com`). Both are public sandboxes with real constraints around stability and shared data. This is not a tool list. It is how the framework is built to last.

---

## 1. Risk-Based Test Layering

Tests are split into three layers based on business impact:

- **`@smoke`** — Golden path journeys. Blocks the PR if they fail. Runs on every push.
- **`@regression`** — Broader functional coverage. Triggered by a successful deployment to staging, not a nightly schedule. In a dynamic team shipping multiple times a day, a nightly run tests yesterday's code, not today's.
- **`@extended`** — Negative scenarios, edge cases, boundary values. Runs pre-release or on-demand.

Every `@smoke` test is also portable as a **post-deploy synthetic check** in staging. Failures produce a Playwright **Trace Viewer** file: frame-by-frame replay with screenshots, network calls, and console logs attached to the alert. No manual reproduction needed.

---

## 2. Framework and Tool Choices

**Playwright with TypeScript** for both UI and API. One toolchain, one config, one reporter. Aligns with CORTO's existing Electron/Playwright investment and enables API-to-browser state sharing, which removes slow UI login flows from E2E tests.

**Tools considered and ruled out:**

**Postman/Newman/Bruno/Insomnia** is a legitimate tool for exploratory testing and backend teams sharing collections for manual smoke tests. It is not an automation framework. There is no type safety, no reusable Service Objects, and no IDE support. Test logic lives in a text box. When the API changes, every request is updated manually.

**Cypress** runs inside the browser's JavaScript context. It cannot handle new tabs, file downloads, or native dialogs. Parallelism requires their paid cloud. TypeScript support was bolted on, not built in. None of this fits a scaling team on Playwright.

**Selenium** was ruled out. Mature ecosystem, but setup overhead and manual wait management are a poor fit for a fast-moving team.

**Record-and-playback tools** (Katalon, Testim) were not considered. They optimise for the first 10 minutes and create years of maintenance pain.

**Axios with TypeScript** is the right choice if the API suite grows to need complex interceptors or contract testing. For this assessment, Playwright's `request` context is sufficient. Axios is the natural next step.

**Network Strategy:** This suite uses **Live Integration Testing** (hitting real endpoints) to validate the full stack. **Network Mocking** via `page.route()` is reserved for `@extended` scenarios (e.g., simulating 500 errors or slow network conditions) to keep the `@smoke` layer as a true production-readiness signal.

**Contract Validation:** API structural integrity is enforced via **JSON Schema Matching** on every response. This is a "consumer-side" contract check. For a production environment with multiple teams, a dedicated contract testing tool (e.g., **Pact**) would be the next step to prevent breaking changes before they reach the integration environment.

**Architecture:** Page Object Model for UI, Service Object pattern for API. Tests read like business actions (`bookingService.create(payload)`). Changes are made in one place.

**Repo structure:** Both UI and API suites live in a single QA mono-repo for this assessment. In a production context where frontend and backend are in separate repos, the API tests move to the backend repo and the UI tests to the frontend repo. The tagging strategy (`@smoke`, `@regression`, `@extended`) and CI trigger patterns remain consistent across both repos as a team-wide governance standard. The Service Object pattern used here is portable — `BookingService` can be extracted into a backend repo's test suite without structural changes.

---

## 3. Architectural Patterns & Principles
**Page Object Model (POM):** Encapsulates UI locators and user actions into classes to separate test logic from implementation details.
**Service Object Model (SOM):** Encapsulates API endpoints and request logic into classes for reusable, thread-safe interaction.
**Dependency Injection (Fixtures):** Leverages Playwright's native test.extend to inject authenticated page and request contexts, ensuring clean test isolation.
**Data Factory Pattern:** Centralizes the creation of UUID-prefixed payloads to prevent data collisions during parallel execution.
**Singleton Configuration:** Single source of truth for environment variables and secrets via config/environments.ts, ensuring zero hardcoding.

---

## 4. Selector Strategy

Priority order:

1. **User-facing locators** (`getByRole`, `getByLabel`) — stable and a passive accessibility check.
2. **`data-testid`** — for dynamic components where role-based locators are too ambiguous. This is a Dev/QE shared contract agreed upfront, not retrofitted.
3. **ID/CSS/XPath** — off the table unless working with third-party components we don't own.

**DemoQA DOM reality (validated live):** DemoQA has no `data-testid` attributes and no `aria-label` attributes. All `<label>` elements have a `null` `for` attribute — they are not bound to any input, so `getByLabel` will not match any form field on this site. For DemoQA inputs, `#id` selectors (`#userName`, `#password`, `#searchBox`) are the correct and reliable choice — they are stable element contracts, not aesthetic CSS. For interactive elements, `getByRole('button', { name: '...' })` and `getByPlaceholder` are applicable where the DOM provides them.

**Browser coverage:** Chromium only. This is a deliberate scope decision for the assessment. CORTO's Electron products are Chromium-based, which makes this defensible beyond the assessment too. Cross-browser and compatibility testing across Firefox and WebKit is a production concern, not an assessment deliverable.

**Playwright Test Agents** (Playwright 1.56, VS Code v1.105): The **Planner** produces a Markdown test plan, the **Generator** turns it into test files with live selector verification, and the **Healer** patches broken locators by inspecting the accessibility tree. All agent output is a first draft. Locator changes go through PR review, not silent agent commits. The Healer fixes selectors; it does not fix poor architecture.

---

## 5. Data Isolation, Independence, and Non-Functional Baselines

**Test independence:** Every test must be runnable in any order and in isolation. No test relies on state left by another.

**Parallel safety (API):** Every worker generates UUID-prefixed booking data. Each test uses its own `request` context. Auth tokens do not bleed between workers. `afterEach` hooks clean up, but tests pass even if cleanup fails because data is unique.

**UI tests (DemoQA):** No data API exists. Tests rely on idempotent flows: the profile is reset to a known state using "Delete All Books" before each run.

**Schema validation:** API responses are validated against a schema, not just a status code. Silent structural breaks are caught before they reach the assertion layer.

**Security:** 401/403 responses are asserted for all authenticated endpoints. Full DAST scanning (OWASP ZAP) is the next step, not in scope for this assessment.

**Accessibility:** `@axe-core/playwright` scans Login, Book Store, and Profile pages for WCAG compliance. Scans are triggered via `runAxeScan(page)` from `utils/axe-scanner.ts`, called in the `afterEach` hook of each UI test so every visited page is scanned automatically without bloating test step logic.

**Performance:** API response times and UI "Time to Actionable" are asserted under 500ms as a regression guard. "Time to Actionable" is measured from navigation start to the visibility of the primary interactive element: `const start = Date.now(); await page.goto(url); await page.waitForSelector(keySelector); assertResponseTime(Date.now() - start, 500)` — using `assertResponseTime` from `utils/response-timer.ts`. This is not a load test. JMeter is the right tool for that and is out of scope here.

**Lighthouse Audits:** For this assessment, performance is measured via functional timings. In a production context, **Lighthouse** could be used for **Nightly Synthetic Audits** (Page Speed, SEO, and Best Practices). It is kept *outside* the functional test suite to maintain pipeline speed and prevent flaky functional failures due to the overhead of the Lighthouse engine.

---

## 6. CI/CD and Observability

**GitHub Actions:** `@smoke` on every PR (blocking), `@regression` triggered by a successful staging deployment, `@extended` pre-release or on-demand. Max 2 retries in CI only, to handle sandbox flakiness without masking real bugs.

**Reporting:** Playwright's native HTML Reporter with Trace Viewer. Zero config. Self-contained. Includes video, screenshots, and network traces. Allure was considered but requires a Java runtime and extra pipeline steps. Not worth it for this scope.

**Coverage:** Tests are tagged via Playwright's annotation API to map to features. This produces a Requirement Coverage Matrix. Codecov is not applicable here; it measures instrumented unit test line coverage, not black-box E2E coverage.

**Test health:** Flaky test rate and pass/fail trends are visible in the HTML report history. A dedicated dashboard (e.g., Grafana + test results DB) is the next step for a production team.

**Rollback:** `@smoke` failures are hard-blocking. `@regression` and `@extended` failures are non-blocking but tracked. A persistent `@smoke` failure post-merge triggers a stop-the-line alert before the next deployment.

**Parallelization:** Initial baseline set to workers - 4 for CI and 2 for local, (fullyParallel: true). This is a "Good Citizen" approach for public sandboxes (DemoQA/Booker) to avoid 429 rate-limiting while proving thread-safety.

**Global Timeout:** Set to 300,000ms (5 minutes). This prevents "zombie" runs from hanging the pipeline and burning CI credits.

**Dynamic Review:** These baselines are not "set and forget." They are reviewed against P95 execution data after every release cycle. If the suite consistently finishes in 3 minutes, the timeout is tightened to 4 to maintain a fast failure signal.

---

## 7. Framework Governance

A framework only one person understands is a liability.

- **Biome** enforced on commit via pre-commit hook. Style is not a conversation.
- **Base fixtures** abstract common setup (authenticated context, pre-created booking). Test authors write tests, not boilerplate.
- **Naming conventions:** `feature.spec.ts`, `FeaturePage.ts`, `FeatureService.ts`. Navigable without a guided tour.
- **`CONTRIBUTING.md`:** How to add a test, how to add a Page Object, PR checklist.
- **README standard:** A new engineer must be able to run the suite within 10 minutes of cloning. If they can't, the README has failed.

---

| Area | Decision |
| :--- | :--- |
| Framework | Playwright + TypeScript |
| API Library | Playwright `request` (Axios next) |
| Architecture | POM + Service Objects |
| Selectors | `getByRole` first; `#id` for DemoQA inputs (no linked labels or `aria-label` attributes present) |
| Data Isolation | UUID-tagged + idempotent UI flows |
| Test Independence | Every test runs in isolation, any order |
| Schema Validation | JSON schema assertions on all API responses |
| Security | 401/403 assertions; DAST is next step |
| Reporting | Native HTML + Trace Viewer |
| Coverage | Requirement mapping via annotations |
| Retries | CI-only, max 2 |
| Execution | `@smoke` per PR, `@regression` on staging deploy, `@extended` pre-release |
| Browser Coverage | Chromium only (assessment scope); full browser matrix is a production concern |
| Network | Live Integration (Mocking for edge cases only) |
| Contract | JSON Schema matching (Pact for next step) |
| Performance | Functional timings < 500ms (Lighthouse for synthetics) |
| Governance | Fixtures + Standards + Docs |
