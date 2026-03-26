import { execSync } from "node:child_process";
import { log } from "./logger.js";

export const getDiffFiles = (
  rootDirectory: string,
  baseBranch: string = "main",
): string[] | null => {
  try {
    const output = execSync(
      `git diff --name-only --diff-filter=ACMR ${baseBranch}...HEAD`,
      { cwd: rootDirectory, encoding: "utf-8" },
    );

    const files = output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    log.verbose(`Found ${files.length} changed files vs ${baseBranch}`);
    return files;
  } catch {
    log.warn(`Could not get git diff against ${baseBranch}. Scanning all files.`);
    return null;
  }
};
