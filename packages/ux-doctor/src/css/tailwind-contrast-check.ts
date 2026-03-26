import { readFile } from "node:fs/promises";
import type { Diagnostic, ProjectInfo } from "../types.js";
import { buildTailwindColorMap, extractTailwindColorPairs } from "./tailwind.js";
import { contrastRatio, meetsWcagAA, formatContrastRatio, suggestAccessibleColor } from "../utils/color-math.js";
import { findSourceFiles } from "../utils/find-source-files.js";
import { WCAG_AA_NORMAL_TEXT_RATIO } from "../constants.js";
import { log } from "../utils/logger.js";

// matches className="...", className={'...'}, className={`...`}, class="..."
// also matches inside cn(), clsx(), cva(), twMerge() calls
const CLASS_NAME_PATTERNS = [
  /className\s*=\s*"([^"]+)"/g,
  /className\s*=\s*{'([^']+)'}/g,
  /className\s*=\s*{`([^`]+)`}/g,
  /class\s*=\s*"([^"]+)"/g,
  /cn\(\s*["'`]([^"'`]+)["'`]/g,
  /clsx\(\s*["'`]([^"'`]+)["'`]/g,
  /cva\(\s*["'`]([^"'`]+)["'`]/g,
  /twMerge\(\s*["'`]([^"'`]+)["'`]/g,
  /classNames\(\s*["'`]([^"'`]+)["'`]/g,
];

export const checkTailwindContrast = async (
  project: ProjectInfo,
  diffFiles?: string[] | null,
): Promise<Diagnostic[]> => {
  if (!project.hasTailwind) return [];

  const colorMap = await buildTailwindColorMap(project.rootDirectory);
  if (colorMap.colors.size === 0) return [];

  const sourceFiles = await findSourceFiles(project.rootDirectory, diffFiles);
  const diagnostics: Diagnostic[] = [];

  for (const filePath of sourceFiles) {
    try {
      const content = await readFile(filePath, "utf-8");

      // skip files with no Tailwind-like classes
      if (!content.includes("text-") && !content.includes("bg-")) continue;

      const classStrings = extractAllClassStrings(content);

      for (const { value: className, offset } of classStrings) {
        const pairs = extractTailwindColorPairs(className, colorMap);

        for (const pair of pairs) {
          const ratio = contrastRatio(pair.textColor, pair.bgColor);
          if (ratio === null) continue;

          if (!meetsWcagAA(ratio, false)) {
            const lineNumber = getLineNumber(content, offset);
            const suggestion = suggestAccessibleColor(
              pair.textColor,
              pair.bgColor,
              WCAG_AA_NORMAL_TEXT_RATIO,
            );

            const helpParts = [
              `Tailwind classes ${pair.textClass} on ${pair.bgClass} have insufficient contrast.`,
            ];
            if (suggestion && suggestion !== pair.textColor) {
              helpParts.push(`Try a darker text color.`);
            }

            diagnostics.push({
              filePath,
              rule: "contrast/tailwind-class-pair",
              category: "Contrast",
              severity: "error",
              message: `${pair.textClass} (${pair.textColor}) on ${pair.bgClass} (${pair.bgColor}) has contrast ratio ${formatContrastRatio(ratio)} — needs 4.5:1 for WCAG AA`,
              help: helpParts.join(" "),
              line: lineNumber,
              column: 0,
              wcagCriteria: "1.4.3",
              wcagLevel: "AA",
              pass: "css",
              fixTarget: "tailwind",
              fixExample: "text-gray-900 bg-white",
              priority: 1,
            });
          }
        }
      }
    } catch {
      log.debug(`Failed to check Tailwind contrast in ${filePath}`);
    }
  }

  log.verbose(`Tailwind contrast check found ${diagnostics.length} issues`);
  return diagnostics;
};

const extractAllClassStrings = (
  content: string,
): Array<{ value: string; offset: number }> => {
  const results: Array<{ value: string; offset: number }> = [];
  const seen = new Set<string>();

  for (const pattern of CLASS_NAME_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const value = match[1];
      if (!value) continue;

      const key = `${match.index}:${value}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({ value, offset: match.index });
    }
  }

  return results;
};

const getLineNumber = (content: string, offset: number): number => {
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === "\n") line++;
  }
  return line;
};
