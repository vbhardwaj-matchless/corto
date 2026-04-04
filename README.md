# corto-qa-assessment

## Overview
This repository contains a Playwright + TypeScript automation framework for the CORTO assessment. It tests the DemoQA Book Store web UI and the Restful Booker API, using a unified, maintainable stack and risk-based test layering.

## Quick Start
1. Clone the repo
2. Run `npm ci`
3. Copy `.env.example` to `.env` and fill in values
4. Run `npm run test:smoke`

## Test Layers
| Layer      | Tag         | Trigger           | Blocking |
|-----------|-------------|-------------------|----------|
| Smoke     | @smoke      | Every PR          | Yes      |
| Regression| @regression | Staging deploy    | No       |
| Extended  | @extended   | Pre-release/manual| No       |

## Folder Structure
- .github/ — CI workflows, agent constraints
- specs/ — Markdown test plans (Planner Agent output)
- tests/ — All test files (UI and API)
- pages/ — Page Object Model classes
- services/ — API Service Object classes
- fixtures/ — Playwright fixtures for setup/teardown
- data/ — Test data, factories, schemas
- utils/ — Utility helpers (schema validation, timers, axe)
- config/ — Environment config
- .husky/ — Pre-commit hooks

## Design Decisions
This repo is a standalone QA mono-repo. For the reasoning behind framework choices, repo structure, tool selection, and test layering, see the [Test Strategy](./STRATEGY.md) and the [Architectural Diagram](./docs/architecture.png).

## Playwright Agents Workflow
1. Prompts 1–3 via GitHub Copilot Agent mode build the framework scaffold (no tests yet).
2. Planner Agent explores the app and produces Markdown test plans in specs/. Review and tag before proceeding.
3. Generator Agent reads the approved plans and generates test files using existing Page Objects, Service Objects, and fixtures.
4. Human review of all generated output before running.
5. Run the suite. Identify locator failures.
6. Healer Agent patches broken locators. All patches reviewed via PR before merge.
> Note: Playwright Agents are activated by running `npx playwright init-agents --loop=vscode` after the scaffold is in place. This generates agent definition files into `.github/`. No npm install required; the VS Code Playwright extension (v1.105+) is required.

## AI Assistance
GitHub Copilot Agent mode (Claude Sonnet) was used for framework scaffolding via structured prompts, Playwright Agents were used for test plan generation and locator healing, all agent output was manually reviewed and refactored to meet the framework standards defined in STRATEGY.md, and no test was merged without human validation.

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md).
