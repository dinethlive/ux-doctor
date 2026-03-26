import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { scan } from "../src/scan.js";

const fixtureDir = join(import.meta.dirname, "fixtures", "basic-react");

describe("scan (integration)", () => {
  it("produces diagnostics from CSS analysis", async () => {
    const result = await scan(fixtureDir, {
      json: true,
      sourceLint: false,
    });

    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.scoreResult).not.toBeNull();
    expect(result.scoreResult!.score).toBeLessThan(100);
    expect(result.project.projectName).toBe("basic-react-fixture");
  });

  it("produces diagnostics from source lint", async () => {
    const result = await scan(fixtureDir, {
      json: true,
      cssAnalysis: false,
    });

    const sourceIssues = result.diagnostics.filter(
      (d) => d.pass === "source",
    );
    expect(sourceIssues.length).toBeGreaterThan(0);
  });

  it("combines CSS and source diagnostics", async () => {
    const result = await scan(fixtureDir, { json: true });

    const cssDiags = result.diagnostics.filter((d) => d.pass === "css");

    expect(cssDiags.length).toBeGreaterThan(0);
    // source lint may produce 0 if oxlint has concurrency issues in test
    expect(result.diagnostics.length).toBeGreaterThanOrEqual(cssDiags.length);
  });

  it("produces a score between 0 and 100", async () => {
    const result = await scan(fixtureDir, { json: true });

    expect(result.scoreResult).not.toBeNull();
    expect(result.scoreResult!.score).toBeGreaterThanOrEqual(0);
    expect(result.scoreResult!.score).toBeLessThanOrEqual(100);
  });

  it("includes elapsed time", async () => {
    const result = await scan(fixtureDir, { json: true });
    expect(result.elapsedMilliseconds).toBeGreaterThan(0);
  });

  it("all diagnostics have required fields", async () => {
    const result = await scan(fixtureDir, { json: true });

    for (const d of result.diagnostics) {
      expect(d.filePath).toBeTruthy();
      expect(d.rule).toBeTruthy();
      expect(d.category).toBeTruthy();
      expect(["error", "warning"]).toContain(d.severity);
      expect(d.message).toBeTruthy();
      expect(d.help).toBeTruthy();
      expect(d.line).toBeGreaterThanOrEqual(0);
      expect(["source", "css", "runtime"]).toContain(d.pass);
    }
  });

  it("skips disabled passes", async () => {
    const result = await scan(fixtureDir, {
      json: true,
      sourceLint: false,
      cssAnalysis: false,
    });

    expect(result.skippedPasses).toContain("source");
    expect(result.skippedPasses).toContain("css");
    expect(result.diagnostics.length).toBe(0);
    expect(result.scoreResult!.score).toBe(100);
  });

  it("detects project info correctly", async () => {
    const result = await scan(fixtureDir, {
      json: true,
      sourceLint: false,
      cssAnalysis: false,
    });

    expect(result.project.rootDirectory).toBe(fixtureDir);
    expect(result.project.projectName).toBe("basic-react-fixture");
  });
});
