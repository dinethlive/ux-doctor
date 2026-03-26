import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { runCssAnalysis } from "../src/passes/run-css-analysis.js";
import type { ProjectInfo } from "../src/types.js";

const fixtureDir = join(import.meta.dirname, "fixtures", "basic-react");

const makeProject = (rootDirectory: string): ProjectInfo => ({
  rootDirectory,
  projectName: "test",
  framework: "unknown",
  cssApproach: "vanilla-css",
  uiLibrary: "none",
  hasTypeScript: false,
  hasTailwind: false,
  hasCssVariables: true,
  hasDesignTokens: true,
  sourceFileCount: 0,
  styleFileCount: 1,
});

describe("runCssAnalysis", () => {
  it("finds contrast issues in fixture CSS", async () => {
    const project = makeProject(fixtureDir);
    const diagnostics = await runCssAnalysis(project);

    const contrastIssues = diagnostics.filter(
      (d) => d.category === "Contrast",
    );
    expect(contrastIssues.length).toBeGreaterThan(0);

    const textContrastIssue = contrastIssues.find(
      (d) => d.rule === "contrast/text-color-ratio",
    );
    expect(textContrastIssue).toBeDefined();
    expect(textContrastIssue!.severity).toBe("error");
    expect(textContrastIssue!.wcagCriteria).toBe("1.4.3");
  });

  it("finds typography issues", async () => {
    const project = makeProject(fixtureDir);
    const diagnostics = await runCssAnalysis(project);

    const typographyIssues = diagnostics.filter(
      (d) => d.category === "Typography",
    );
    expect(typographyIssues.length).toBeGreaterThan(0);

    const baseFontIssue = typographyIssues.find(
      (d) => d.rule === "typography/base-font-size",
    );
    expect(baseFontIssue).toBeDefined();
  });

  it("finds focus indicator issues", async () => {
    const project = makeProject(fixtureDir);
    const diagnostics = await runCssAnalysis(project);

    const focusIssues = diagnostics.filter(
      (d) => d.category === "Focus Indicators",
    );
    expect(focusIssues.length).toBeGreaterThan(0);

    const outlineNone = focusIssues.find(
      (d) => d.rule === "focus/no-outline-none",
    );
    expect(outlineNone).toBeDefined();
    expect(outlineNone!.severity).toBe("error");
  });

  it("finds touch target issues", async () => {
    const project = makeProject(fixtureDir);
    const diagnostics = await runCssAnalysis(project);

    const touchIssues = diagnostics.filter(
      (d) => d.category === "Touch Targets",
    );
    expect(touchIssues.length).toBeGreaterThan(0);
  });

  it("finds motion issues", async () => {
    const project = makeProject(fixtureDir);
    const diagnostics = await runCssAnalysis(project);

    const motionIssues = diagnostics.filter(
      (d) => d.category === "Motion",
    );
    expect(motionIssues.length).toBeGreaterThan(0);

    const reducedMotion = motionIssues.find(
      (d) => d.rule === "motion/prefers-reduced-motion",
    );
    expect(reducedMotion).toBeDefined();
  });

  it("finds color system issues", async () => {
    const project = makeProject(fixtureDir);
    const diagnostics = await runCssAnalysis(project);

    const colorIssues = diagnostics.filter(
      (d) => d.category === "Color System",
    );
    expect(colorIssues.length).toBeGreaterThan(0);
  });

  it("all diagnostics have required fields", async () => {
    const project = makeProject(fixtureDir);
    const diagnostics = await runCssAnalysis(project);

    for (const d of diagnostics) {
      expect(d.filePath).toBeTruthy();
      expect(d.rule).toBeTruthy();
      expect(d.category).toBeTruthy();
      expect(d.severity).toMatch(/^(error|warning)$/);
      expect(d.message).toBeTruthy();
      expect(d.help).toBeTruthy();
      expect(d.line).toBeGreaterThan(0);
      expect(d.pass).toBe("css");
    }
  });
});
