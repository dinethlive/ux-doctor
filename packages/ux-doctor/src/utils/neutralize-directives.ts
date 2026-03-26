import { readFile, writeFile } from "node:fs/promises";
import { log } from "./logger.js";

const DISABLE_PATTERNS = [
  /eslint-disable/g,
  /oxlint-disable/g,
];

const PLACEHOLDER = "___disabled___";

export const neutralizeDirectives = async (
  filePaths: string[],
): Promise<Map<string, string>> => {
  const originalContents = new Map<string, string>();

  for (const filePath of filePaths) {
    try {
      const content = await readFile(filePath, "utf-8");

      let modified = content;
      let hasDirectives = false;

      for (const pattern of DISABLE_PATTERNS) {
        if (pattern.test(modified)) {
          hasDirectives = true;
          modified = modified.replace(
            pattern,
            (match) => match.replace(/-/g, PLACEHOLDER),
          );
        }
        pattern.lastIndex = 0;
      }

      if (hasDirectives) {
        originalContents.set(filePath, content);
        await writeFile(filePath, modified, "utf-8");
      }
    } catch {
      log.debug(`Failed to neutralize directives in ${filePath}`);
    }
  }

  return originalContents;
};

export const restoreDirectives = async (
  originalContents: Map<string, string>,
): Promise<void> => {
  for (const [filePath, content] of originalContents) {
    try {
      await writeFile(filePath, content, "utf-8");
    } catch {
      log.warn(`Failed to restore ${filePath} — file may have been modified`);
    }
  }
};
