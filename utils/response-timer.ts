import { expect } from "@playwright/test";

/**
 * Asserts that a measured API response duration is within budget.
 *
 * Usage:
 *   const start = Date.now();
 *   const response = await service.getAll();
 *   assertResponseTime(Date.now() - start, 500);
 */
export function assertResponseTime(durationMs: number, maxMs: number): void {
  expect(
    durationMs,
    `Response time ${durationMs}ms exceeded budget of ${maxMs}ms`,
  ).toBeLessThanOrEqual(maxMs);
}
