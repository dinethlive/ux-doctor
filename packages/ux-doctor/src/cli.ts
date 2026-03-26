import { Command } from "commander";
import { readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scan } from "./scan.js";
import { setVerbose, log } from "./utils/logger.js";
import { installSkill, uninstallSkill } from "./utils/skill-prompt.js";
import type { JsonOutput, ScanOptions, ScanResult, Diagnostic } from "./types.js";
import { relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getVersion = (): string => {
  try {
    const packageJsonPath = join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    return packageJson.version;
  } catch {
    return "0.0.0";
  }
};

const program = new Command();

program
  .name("ux-doctor")
  .description(
    "Scan your codebase for UX/UI accessibility and design quality issues",
  )
  .version(getVersion(), "-v, --version")
  .argument("[directory]", "project directory to scan", ".")
  .option("--no-source-lint", "skip source code linting")
  .option("--no-css-analysis", "skip CSS/token analysis")
  .option("--url <url>", "enable runtime audit on this URL")
  .option("--verbose", "show file details per rule")
  .option("--score", "output only the score")
  .option("--json", "output diagnostics as JSON")
  .option("--agent", "output in LLM-optimized format (grouped by file, with fix examples)")
  .option("--diff [base]", "scan only files changed vs base branch")
  .option(
    "--wcag-level <level>",
    "target WCAG level: A, AA, AAA",
    "AA",
  )
  .option(
    "--contrast <standard>",
    "contrast algorithm: wcag2, apca",
    "wcag2",
  )
  .option("-y, --yes", "skip prompts")
  .option("--project <name>", "select workspace project")
  .option("--install-skill", "install skill for AI agents")
  .option("--uninstall-skill", "uninstall skill from all AI agents")
  .action(async (directory: string, options: Record<string, unknown>) => {
    if (options.installSkill) {
      await installSkill(Boolean(options.yes));
      return;
    }

    if (options.uninstallSkill) {
      await uninstallSkill(Boolean(options.yes));
      return;
    }

    const resolvedDirectory = resolve(directory);

    if (options.verbose) {
      setVerbose(true);
    }

    const scanOptions: ScanOptions = {
      sourceLint: options.sourceLint as boolean | undefined,
      cssAnalysis: options.cssAnalysis as boolean | undefined,
      runtime: Boolean(options.url),
      runtimeUrl: options.url as string | undefined,
      verbose: Boolean(options.verbose),
      scoreOnly: Boolean(options.score),
      json: Boolean(options.json),
      agent: Boolean(options.agent),
      diff: options.diff as boolean | string | undefined,
      wcagLevel: options.wcagLevel as "A" | "AA" | "AAA",
      contrastStandard: options.contrast as "wcag2" | "apca",
    };

    try {
      const result = await scan(resolvedDirectory, scanOptions);

      if (scanOptions.json) {
        const jsonOutput: JsonOutput = {
          score: {
            value: result.scoreResult?.score ?? 100,
            label: result.scoreResult?.label ?? "Great",
          },
          project: {
            name: result.project.projectName,
            framework: result.project.framework,
            cssApproach: result.project.cssApproach,
            uiLibrary: result.project.uiLibrary,
          },
          summary: {
            errors: result.diagnostics.filter((d) => d.severity === "error")
              .length,
            warnings: result.diagnostics.filter(
              (d) => d.severity === "warning",
            ).length,
            categories: result.diagnostics.reduce(
              (acc, d) => {
                acc[d.category] = (acc[d.category] ?? 0) + 1;
                return acc;
              },
              {} as Record<string, number>,
            ),
          },
          diagnostics: result.diagnostics,
        };
        console.log(JSON.stringify(jsonOutput, null, 2));
      }

      if (scanOptions.agent) {
        printAgentOutput(result);
      }

      const exitCode =
        result.scoreResult && result.scoreResult.score < 50 ? 1 : 0;
      process.exit(exitCode);
    } catch (error) {
      log.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      process.exit(2);
    }
  });

program.parse();

const printAgentOutput = (result: ScanResult): void => {
  const score = result.scoreResult;
  const errors = result.diagnostics.filter((d) => d.severity === "error");
  const warnings = result.diagnostics.filter((d) => d.severity === "warning");

  const lines: string[] = [];

  lines.push(`# UX Doctor Report`);
  lines.push(`Score: ${score?.score ?? 100}/100 (${score?.label ?? "Great"})`);
  lines.push(`Found: ${errors.length} errors, ${warnings.length} warnings`);
  lines.push(``);

  if (result.diagnostics.length === 0) {
    lines.push(`No issues found.`);
    console.log(lines.join("\n"));
    return;
  }

  // fix plan
  lines.push(`## Fix Plan`);
  lines.push(`Fix errors first, then warnings. Priority 1 = fix first.`);
  lines.push(``);

  // group by file
  const byFile = new Map<string, Diagnostic[]>();
  for (const d of result.diagnostics.sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5))) {
    const relPath = relative(result.project.rootDirectory, d.filePath);
    const key = relPath || d.filePath;
    const list = byFile.get(key) ?? [];
    list.push(d);
    byFile.set(key, list);
  }

  for (const [filePath, diagnostics] of byFile) {
    lines.push(`## ${filePath}`);
    for (const d of diagnostics) {
      const severity = d.severity === "error" ? "ERROR" : "WARN";
      const wcag = d.wcagCriteria ? ` [WCAG ${d.wcagCriteria}]` : "";
      const target = d.fixTarget ? ` (fix in: ${d.fixTarget})` : "";
      lines.push(`- **${severity}** line ${d.line}: ${d.message}${wcag}${target}`);
      lines.push(`  Help: ${d.help}`);
      if (d.fixExample) {
        lines.push(`  Fix: \`${d.fixExample}\``);
      }
    }
    lines.push(``);
  }

  console.log(lines.join("\n"));
};
