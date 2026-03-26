import type { Diagnostic } from "../types.js";
import { log } from "../utils/logger.js";

export const runRuntimeAudit = async (
  url: string,
): Promise<Diagnostic[]> => {
  let AxeBuilder: typeof import("@axe-core/playwright").default | undefined;
  let chromium: typeof import("playwright").chromium | undefined;

  try {
    const axeModule = await import("@axe-core/playwright");
    AxeBuilder = axeModule.default;
    const playwrightModule = await import("playwright");
    chromium = playwrightModule.chromium;
  } catch {
    log.warn(
      "Runtime audit requires @axe-core/playwright and playwright. Install them with: pnpm add -D @axe-core/playwright playwright",
    );
    return [];
  }

  log.verbose(`Running runtime audit on ${url}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle" });

    const axeResults = await new AxeBuilder({ page }).analyze();

    const diagnostics: Diagnostic[] = [];

    for (const violation of axeResults.violations) {
      for (const node of violation.nodes) {
        const target = node.target?.[0] ?? "unknown";
        diagnostics.push({
          filePath: url,
          rule: `axe/${violation.id}`,
          category: mapAxeCategory(violation.tags),
          severity: violation.impact === "critical" || violation.impact === "serious"
            ? "error"
            : "warning",
          message: `${violation.help} (${target})`,
          help: violation.helpUrl ?? violation.description,
          line: 0,
          column: 0,
          wcagCriteria: extractWcagCriteria(violation.tags),
          wcagLevel: extractWcagLevel(violation.tags),
          pass: "runtime",
        });
      }
    }

    log.verbose(`Runtime audit found ${diagnostics.length} issues`);
    return diagnostics;
  } catch (error) {
    log.warn(
      `Runtime audit failed: ${error instanceof Error ? error.message : error}`,
    );
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const mapAxeCategory = (
  tags: string[],
): Diagnostic["category"] => {
  if (tags.some((t) => t.includes("color"))) return "Contrast";
  if (tags.some((t) => t.includes("aria"))) return "ARIA";
  if (tags.some((t) => t.includes("keyboard"))) return "Keyboard";
  if (tags.some((t) => t.includes("forms"))) return "Forms";
  if (tags.some((t) => t.includes("structure"))) return "Semantic Structure";
  if (tags.some((t) => t.includes("semantics"))) return "Semantic Structure";
  if (tags.some((t) => t.includes("text-alternatives"))) return "Media";
  if (tags.some((t) => t.includes("name-role-value"))) return "ARIA";
  return "ARIA";
};

const extractWcagCriteria = (tags: string[]): string | undefined => {
  for (const tag of tags) {
    const match = tag.match(/^wcag(\d)(\d)(\d+)$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}`;
    }
  }
  return undefined;
};

const extractWcagLevel = (
  tags: string[],
): "A" | "AA" | "AAA" | undefined => {
  if (tags.includes("wcag2aaa")) return "AAA";
  if (tags.includes("wcag2aa")) return "AA";
  if (tags.includes("wcag2a")) return "A";
  return undefined;
};
