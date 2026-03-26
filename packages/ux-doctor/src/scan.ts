import type {
  Diagnostic,
  ScanOptions,
  ScanResult,
  ProjectInfo,
  UxDoctorConfig,
} from "./types.js";
import { discoverProject } from "./utils/discover-project.js";
import { loadConfig } from "./utils/load-config.js";
import { calculateScore } from "./utils/calculate-score.js";
import { combineDiagnostics } from "./utils/combine-diagnostics.js";
import { filterDiagnostics } from "./utils/filter-diagnostics.js";
import { getDiffFiles } from "./utils/get-diff-files.js";
import { runCssAnalysis } from "./passes/run-css-analysis.js";
import { runSourceLint } from "./passes/run-source-lint.js";
import { runRuntimeAudit } from "./passes/run-runtime-audit.js";
import { relative } from "node:path";
import pc from "picocolors";
import { log } from "./utils/logger.js";
import { startSpinner, stopSpinner, updateSpinner } from "./utils/spinner.js";
import { highlight } from "./utils/highlighter.js";
import { framedBox } from "./utils/framed-box.js";

export const scan = async (
  directory: string,
  options: ScanOptions = {},
): Promise<ScanResult> => {
  const startTime = performance.now();

  const config = await loadConfig(directory);
  const mergedOptions = mergeOptionsWithConfig(options, config);

  const quietMode = mergedOptions.json || mergedOptions.agent;
  const spinner = quietMode
    ? null
    : startSpinner("Detecting project...");

  const project = await discoverProject(directory);

  if (spinner) updateSpinner(spinner, "Running analysis passes...");

  let diffFiles: string[] | null = null;
  if (mergedOptions.diff) {
    const baseBranch =
      typeof mergedOptions.diff === "string" ? mergedOptions.diff : "main";
    diffFiles = getDiffFiles(directory, baseBranch);
  }

  const skippedPasses: string[] = [];
  const passResults: Diagnostic[][] = [];

  const passPromises: Promise<Diagnostic[]>[] = [];

  if (mergedOptions.sourceLint !== false) {
    passPromises.push(runSourceLintPass(project, diffFiles));
  } else {
    skippedPasses.push("source");
  }

  if (mergedOptions.cssAnalysis !== false) {
    passPromises.push(runCssAnalysisPass(project, diffFiles, mergedOptions.contrastStandard));
  } else {
    skippedPasses.push("css");
  }

  if (mergedOptions.runtime && mergedOptions.runtimeUrl) {
    passPromises.push(runRuntimeAuditPass(mergedOptions.runtimeUrl));
  } else if (!mergedOptions.runtime) {
    skippedPasses.push("runtime");
  }

  const results = await Promise.all(passPromises);
  passResults.push(...results);

  let diagnostics = combineDiagnostics(...passResults);
  diagnostics = filterDiagnostics(diagnostics, config?.ignore);

  const scoreResult = calculateScore(diagnostics);

  const elapsedMilliseconds = Math.round(performance.now() - startTime);

  if (spinner) stopSpinner(spinner, `Analysis complete in ${elapsedMilliseconds}ms`);

  if (!quietMode) {
    printResults(diagnostics, scoreResult, project, skippedPasses, mergedOptions, elapsedMilliseconds);
  }

  return {
    diagnostics,
    scoreResult,
    project,
    skippedPasses,
    elapsedMilliseconds,
  };
};

// --- Pass Stubs (replaced in later phases) ---

const runSourceLintPass = async (
  project: ProjectInfo,
  diffFiles: string[] | null,
): Promise<Diagnostic[]> => {
  return runSourceLint(project, diffFiles);
};

const runCssAnalysisPass = async (
  project: ProjectInfo,
  diffFiles: string[] | null,
  contrastStandard?: "wcag2" | "apca",
): Promise<Diagnostic[]> => {
  return runCssAnalysis(project, diffFiles, contrastStandard);
};

const runRuntimeAuditPass = async (
  url: string,
): Promise<Diagnostic[]> => {
  return runRuntimeAudit(url);
};

// --- Output ---

const ASCII_LOGO = [
  `${pc.blue("  _   ___  __")}  ${pc.white("___          _")}`,
  `${pc.blue(" | | | \\ \\/ /")}  ${pc.white("|   \\ ___  __| |_ ___ _ _")}`,
  `${pc.blue(" | |_| |>  < ")}  ${pc.white("| |) / _ \\/ _|  _/ _ \\ '_|")}`,
  `${pc.blue("  \\___//_/\\_\\")}  ${pc.white("|___/\\___/\\__|\\__\\___/_|")}`,
];

const printResults = (
  diagnostics: Diagnostic[],
  scoreResult: ReturnType<typeof calculateScore>,
  project: ProjectInfo,
  skippedPasses: string[],
  options: ScanOptions,
  elapsedMilliseconds: number,
): void => {
  console.log();
  for (const line of ASCII_LOGO) {
    console.log(`  ${line}`);
  }
  console.log();

  if (options.scoreOnly) {
    const bar = scoreBar(scoreResult.score);
    console.log(
      framedBox([
        `Score: ${highlight.score(scoreResult.score)}/100 — ${scoreResult.label}`,
        bar,
      ]),
    );
    return;
  }

  const errorCount = diagnostics.filter((d) => d.severity === "error").length;
  const warningCount = diagnostics.filter(
    (d) => d.severity === "warning",
  ).length;

  const bar = scoreBar(scoreResult.score);

  const scoreLine = `${bar}  ${highlight.score(scoreResult.score)}/100 ${scoreResult.label}`;
  const issueLine = `${highlight.error(String(errorCount) + " errors")}  ${highlight.warning(String(warningCount) + " warnings")}  ${highlight.dim(elapsedMilliseconds + "ms")}`;

  console.log(
    framedBox(
      [
        `${highlight.bold(project.projectName)} ${pc.dim(`(${project.framework} + ${project.cssApproach})`)}`,
        ``,
        scoreLine,
        ``,
        issueLine,
      ],
      "",
    ),
  );

  if (diagnostics.length === 0) {
    console.log();
    log.success("No issues found!");
    return;
  }

  // always show category breakdown
  printCategoryBreakdown(diagnostics, project.rootDirectory);

  if (options.verbose) {
    printVerboseResults(diagnostics, project.rootDirectory);
  } else {
    console.log();
    console.log(highlight.dim("  Run with --verbose to see file details and fix suggestions"));
  }
};

const scoreBar = (score: number): string => {
  const width = 20;
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  const filledChar = "█";
  const emptyChar = "░";

  const bar = filledChar.repeat(filled) + emptyChar.repeat(empty);

  if (score >= 75) return pc.green(bar);
  if (score >= 50) return pc.yellow(bar);
  return pc.red(bar);
};

const printCategoryBreakdown = (diagnostics: Diagnostic[], _rootDir: string): void => {
  const byCategory = groupBy(diagnostics, (d) => d.category);

  console.log();
  for (const [category, items] of Object.entries(byCategory)) {
    const errors = items.filter((d) => d.severity === "error").length;
    const warnings = items.filter((d) => d.severity === "warning").length;

    const parts: string[] = [];
    if (errors > 0) parts.push(highlight.error(`${errors}E`));
    if (warnings > 0) parts.push(highlight.warning(`${warnings}W`));

    const barWidth = 10;
    const total = items.length;
    const errBar = Math.round((errors / Math.max(total, 1)) * barWidth);
    const warnBar = Math.round((warnings / Math.max(total, 1)) * barWidth);
    const emptyBar = barWidth - errBar - warnBar;
    const miniBar = pc.red("█".repeat(errBar)) + pc.yellow("█".repeat(warnBar)) + pc.dim("░".repeat(Math.max(0, emptyBar)));

    console.log(`  ${miniBar} ${highlight.category(category.padEnd(20))} ${parts.join(" ")}`);
  }
};

const printVerboseResults = (diagnostics: Diagnostic[], rootDir: string): void => {
  // group by file for better readability
  const byFile = groupBy(diagnostics, (d) => d.filePath);

  for (const [filePath, items] of Object.entries(byFile)) {
    const relPath = relative(rootDir, filePath);
    console.log();
    console.log(`  ${highlight.file(relPath)}`);

    const sorted = items.sort((a, b) => a.line - b.line);

    for (const diagnostic of sorted) {
      const severity =
        diagnostic.severity === "error"
          ? highlight.error("ERROR")
          : highlight.warning("WARN ");
      const wcag = diagnostic.wcagCriteria
        ? ` ${highlight.wcag(diagnostic.wcagCriteria)}`
        : "";
      const target = diagnostic.fixTarget
        ? highlight.dim(` [${diagnostic.fixTarget}]`)
        : "";

      console.log(`    ${highlight.line(diagnostic.line)} ${severity}${wcag}${target} ${diagnostic.message}`);
      if (diagnostic.fixExample) {
        console.log(`         ${pc.green("fix:")} ${diagnostic.fixExample}`);
      } else {
        console.log(`         ${highlight.dim(diagnostic.help)}`);
      }
    }
  }
  console.log();
};

const groupBy = <T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> => {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
};

const mergeOptionsWithConfig = (
  options: ScanOptions,
  config: UxDoctorConfig | null,
): ScanOptions => {
  if (!config) return options;

  return {
    sourceLint: options.sourceLint ?? config.sourceLint,
    cssAnalysis: options.cssAnalysis ?? config.cssAnalysis,
    runtime: options.runtime ?? config.runtime,
    verbose: options.verbose ?? config.verbose,
    diff: options.diff ?? config.diff,
    wcagLevel: options.wcagLevel ?? config.wcagLevel ?? "AA",
    contrastStandard: options.contrastStandard ?? config.contrastStandard ?? "wcag2",
    ...options,
  };
};
