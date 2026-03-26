import { readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { SOURCE_FILE_EXTENSIONS, IGNORE_DIRECTORIES } from "../constants.js";

export const findSourceFiles = async (
  rootDirectory: string,
  diffFiles?: string[] | null,
): Promise<string[]> => {
  if (diffFiles) {
    return diffFiles
      .filter((file) =>
        SOURCE_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)),
      )
      .map((file) => join(rootDirectory, file));
  }

  const files: string[] = [];

  const walkDirectory = async (directory: string): Promise<void> => {
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (
            !IGNORE_DIRECTORIES.includes(
              entry.name as (typeof IGNORE_DIRECTORIES)[number],
            )
          ) {
            await walkDirectory(join(directory, entry.name));
          }
        } else {
          const ext = extname(entry.name);
          if (SOURCE_FILE_EXTENSIONS.includes(ext as (typeof SOURCE_FILE_EXTENSIONS)[number])) {
            files.push(join(directory, entry.name));
          }
        }
      }
    } catch {
      // can't read directory
    }
  };

  await walkDirectory(rootDirectory);
  return files;
};
