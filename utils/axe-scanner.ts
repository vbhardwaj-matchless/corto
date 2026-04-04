import { Page } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

export async function runAxeScan(
  page: Page,
  tags: string[] = ["wcag2a", "wcag2aa"],
): Promise<void> {
  await injectAxe(page);
  const results = await page.evaluate(async (tags) => {
    // @ts-ignore
    return await window.axe.run({ runOnly: { type: "tag", values: tags } });
  }, tags);
  if (results.violations && results.violations.length > 0) {
    const details = results.violations
      .map(
        (v: any) =>
          `Impact: ${v.impact} | ${v.description} | Element: ${v.nodes.map((n: any) => n.target).join(", ")}`,
      )
      .join("\n");
    throw new Error(`Accessibility violations found:\n${details}`);
  }
}
