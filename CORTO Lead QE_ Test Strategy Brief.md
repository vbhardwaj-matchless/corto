# CORTO Lead QE: Test Strategy Brief

**Author:** Varun | **Date:** April 2026

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

**Postman/Newman** is a legitimate tool for exploratory testing and backend teams sharing collections for manual smoke tests. It is not an automation framework. There is no type safety, no reusable Service Objects, and no IDE support. Test logic lives in a text box. When the API changes, every request is updated manually.

**Cypress** runs inside the browser's JavaScript context. It cannot handle new tabs, file downloads, or native dialogs. Parallelism requires their paid cloud. TypeScript support was bolted on, not built in. None of this fits a scaling team on Playwright.

**Selenium** was ruled out. Mature ecosystem, but setup overhead and manual wait management are a poor fit for a fast-moving team.

**Record-and-playback tools** (Katalon, Testim) were not considered. They optimise for the first 10 minutes and create years of maintenance pain.

**Axios with TypeScript** is the right choice if the API suite grows to need complex interceptors or contract testing. For this assessment, Playwright's `request` context is sufficient. Axios is the natural next step.

**Architecture:** Page Object Model for UI, Service Object pattern for API. Tests read like business actions (`bookingService.create(payload)`). Changes are made in one place.

**Repo structure:** Both UI and API suites live in a single QA mono-repo for this assessment. In a production context where frontend and backend are in separate repos, the API tests move to the backend repo and the UI tests to the frontend repo. The tagging strategy (`@smoke`, `@regression`, `@extended`) and CI trigger patterns remain consistent across both repos as a team-wide governance standard. The Service Object pattern used here is portable — `BookingService` can be extracted into a backend repo's test suite without structural changes.

---

## 3. Selector Strategy

Priority order:

1. **User-facing locators** (`getByRole`, `getByLabel`) — stable and a passive accessibility check.
2. **`data-testid`** — for dynamic components where role-based locators are too ambiguous. This is a Dev/QE shared contract agreed upfront, not retrofitted.
3. **CSS/XPath** — off the table unless working with third-party components we don't own.

DemoQA has no `data-testid` attributes. This suite uses user-facing locators only.

**Browser coverage:** Chromium only. This is a deliberate scope decision for the assessment. CORTO's Electron products are Chromium-based, which makes this defensible beyond the assessment too. Cross-browser and compatibility testing across Firefox and WebKit is a production concern, not an assessment deliverable.

**Playwright Test Agents** (Playwright 1.56, VS Code v1.105): The **Planner** produces a Markdown test plan, the **Generator** turns it into test files with live selector verification, and the **Healer** patches broken locators by inspecting the accessibility tree. All agent output is a first draft. Locator changes go through PR review, not silent agent commits. The Healer fixes selectors; it does not fix poor architecture.

---

## 4. Data Isolation, Independence, and Non-Functional Baselines

**Test independence:** Every test must be runnable in any order and in isolation. No test relies on state left by another.

**Parallel safety (API):** Every worker generates UUID-prefixed booking data. Each test uses its own `request` context. Auth tokens do not bleed between workers. `afterEach` hooks clean up, but tests pass even if cleanup fails because data is unique.

**UI tests (DemoQA):** No data API exists. Tests rely on idempotent flows: the profile is reset to a known state using "Delete All Books" before each run.

**Schema validation:** API responses are validated against a schema, not just a status code. Silent structural breaks are caught before they reach the assertion layer.

**Security:** 401/403 responses are asserted for all authenticated endpoints. Full DAST scanning (OWASP ZAP) is the next step, not in scope for this assessment.

**Accessibility:** `@axe-core/playwright` scans Login, Book Store, and Profile pages for WCAG compliance in CI.

**Performance:** API response times are asserted under 500ms as a regression guard. This is not a load test. JMeter is the right tool for that and is out of scope here.

---

## 5. CI/CD and Observability

**GitHub Actions:** `@smoke` on every PR (blocking), `@regression` triggered by a successful staging deployment, `@extended` pre-release or on-demand. Max 2 retries in CI only, to handle sandbox flakiness without masking real bugs.

**Reporting:** Playwright's native HTML Reporter with Trace Viewer. Zero config. Self-contained. Includes video, screenshots, and network traces. Allure was considered but requires a Java runtime and extra pipeline steps. Not worth it for this scope.

**Coverage:** Tests are tagged via Playwright's annotation API to map to features. This produces a Requirement Coverage Matrix. Codecov is not applicable here; it measures instrumented unit test line coverage, not black-box E2E coverage.

**Test health:** Flaky test rate and pass/fail trends are visible in the HTML report history. A dedicated dashboard (e.g., Grafana + test results DB) is the next step for a production team.

**Rollback:** `@smoke` failures are hard-blocking. `@regression` and `@extended` failures are non-blocking but tracked. A persistent `@smoke` failure post-merge triggers a stop-the-line alert before the next deployment.

---

## 6. Framework Governance

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
| Selectors | `getByRole` first, `data-testid` second |
| Data Isolation | UUID-tagged + idempotent UI flows |
| Test Independence | Every test runs in isolation, any order |
| Schema Validation | JSON schema assertions on all API responses |
| Security | 401/403 assertions; DAST is next step |
| Reporting | Native HTML + Trace Viewer |
| Coverage | Requirement mapping via annotations |
| Retries | CI-only, max 2 |
| Execution | `@smoke` per PR, `@regression` on staging deploy, `@extended` pre-release |
| Browser Coverage | Chromium only (assessment scope); full browser matrix is a production concern |
| Governance | Fixtures + Standards + Docs |
