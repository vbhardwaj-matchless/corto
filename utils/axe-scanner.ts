import { Page, TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ENV } from "../config/environments";

export async function runAxeScan(
  page: Page,
  testInfo: TestInfo,
  tags: string[] = ["wcag2a", "wcag2aa"],
  impacts: string[] = ["critical", "serious"],
): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(tags).analyze();
  const violations = results.violations.filter((v) =>
    impacts.includes(v.impact as string),
  );
  if (violations.length > 0) {
    const details = violations
      .map(
        (v) =>
          `Impact: ${v.impact} | ${v.description} | Element: ${v.nodes.map((n) => n.target).join(", ")}`,
      )
      .join("\n");
    if (ENV.axe.failOnViolation) {
      // AXE_FAIL_ON_VIOLATION=true — hard-fail so critical a11y regressions block the pipeline.
      throw new Error(`Accessibility violations found:\n${details}`);
    }
    // Default: annotate in the HTML report without blocking the functional result.
    // DemoQA is a third-party site with known violations we cannot fix.
    testInfo.annotations.push({ type: "accessibility", description: details });
  }
}
