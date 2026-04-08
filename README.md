# corto-qa-assessment

## Overview
This repository contains a Playwright + TypeScript automation framework for the CORTO assessment. It tests the DemoQA Book Store web UI and the Restful Booker API, using a unified, maintainable stack and risk-based test layering.

## Quick Start
1. Clone the repo
2. Run `npm ci`
3. Copy `.env.example` to `.env` and fill in values
4. Run `npm run test:smoke`

## Design Decisions
This repo is a standalone QA mono-repo. For the reasoning behind framework choices, repo structure, tool selection, and test layering, see the [Quality Strategy](./docs/Quality-Strategy.md) and the [Architectural Diagram](./docs/Architecture.png).

## Test Layers
| Layer      | Tag         | Trigger           | Blocking |
|-----------|-------------|-------------------|----------|
| Smoke     | @smoke      | Every PR          | Yes      |
| Regression| @regression | Staging deploy    | No       |
| Extended  | @extended   | Pre-release/manual| No       |

## Folder Structure
- .github/ — CI workflows
- specs/ — Markdown test plans 
- tests/ — All test files (UI and API)
- pages/ — Page Object Model classes
- services/ — API Service Object classes
- fixtures/ — Playwright fixtures for setup/teardown
- data/ — Test data, factories, schemas
- docs/ — Quality Strategy, Contributing, Architecture
- utils/ — Utility helpers (schema validation, timers, axe)
- config/ — Environment config
- specs/ — Test Plans
- .husky/ — Pre-commit hooks

## AI Assistance (Task 1 & Task 2(PartA))
GitHub Copilot Agent mode (Claude Sonnet) was used for comments, documentation and deep research of apps.Human(Varun for this assesment) in the loop review and approves/rejects every output of AI. 

## Task 2 (PartB)
 Playwright agents were installed to do this task including planning, generation and healing. 
- specs/ — Test Plans
- tests/api/taskB — spec.ts

## Contributing
See [Contributing.md](./docs/Contributing.md).
