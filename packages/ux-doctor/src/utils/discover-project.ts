import { readFile, readdir, access } from "node:fs/promises";
import { join, basename } from "node:path";
import type {
  ProjectInfo,
  Framework,
  CssApproach,
  UiLibrary,
} from "../types.js";
import {
  FRAMEWORK_DEPENDENCIES,
  UI_LIBRARY_DEPENDENCIES,
  CSS_APPROACH_FILES,
  CSS_APPROACH_DEPENDENCIES,
  SOURCE_FILE_EXTENSIONS,
  STYLE_FILE_EXTENSIONS,
  IGNORE_DIRECTORIES,
} from "../constants.js";
import { log } from "./logger.js";

export const discoverProject = async (
  rootDirectory: string,
): Promise<ProjectInfo> => {
  const packageJson = await readPackageJson(rootDirectory);
  const allDependencies: Record<string, unknown> = {
    ...(packageJson?.dependencies as Record<string, unknown> | undefined),
    ...(packageJson?.devDependencies as Record<string, unknown> | undefined),
  };

  const framework = detectFramework(allDependencies);
  const cssApproach = await detectCssApproach(rootDirectory, allDependencies);
  const uiLibrary = detectUiLibrary(allDependencies);
  const hasTypeScript = await fileExists(join(rootDirectory, "tsconfig.json"));
  const hasTailwind = cssApproach === "tailwind";
  const hasCssVariables = await detectCssVariables(rootDirectory);
  const hasDesignTokens = hasCssVariables || hasTailwind;

  const { sourceFileCount, styleFileCount } = await countFiles(rootDirectory);

  const project: ProjectInfo = {
    rootDirectory,
    projectName: (packageJson?.name as string) ?? basename(rootDirectory),
    framework,
    cssApproach,
    uiLibrary,
    hasTypeScript,
    hasTailwind,
    hasCssVariables,
    hasDesignTokens,
    sourceFileCount,
    styleFileCount,
  };

  log.verbose(
    `Detected: ${project.framework} + ${project.cssApproach} + ${project.uiLibrary}`,
  );
  log.verbose(
    `Files: ${project.sourceFileCount} source, ${project.styleFileCount} style`,
  );

  return project;
};

const readPackageJson = async (
  rootDirectory: string,
): Promise<Record<string, unknown> | null> => {
  try {
    const content = await readFile(
      join(rootDirectory, "package.json"),
      "utf-8",
    );
    return JSON.parse(content);
  } catch {
    return null;
  }
};

const detectFramework = (
  dependencies: Record<string, unknown>,
): Framework => {
  for (const [dep, framework] of Object.entries(FRAMEWORK_DEPENDENCIES)) {
    if (dep in dependencies) {
      return framework as Framework;
    }
  }
  return "unknown";
};

const detectCssApproach = async (
  rootDirectory: string,
  dependencies: Record<string, unknown>,
): Promise<CssApproach> => {
  for (const [file, approach] of Object.entries(CSS_APPROACH_FILES)) {
    if (await fileExists(join(rootDirectory, file))) {
      return approach as CssApproach;
    }
  }

  for (const [dep, approach] of Object.entries(CSS_APPROACH_DEPENDENCIES)) {
    if (dep in dependencies) {
      return approach as CssApproach;
    }
  }

  // HACK: check for Tailwind v4 (CSS-first, no config file, but has tailwindcss dep)
  if ("tailwindcss" in dependencies) {
    return "tailwind";
  }

  return "unknown";
};

const detectUiLibrary = (
  dependencies: Record<string, unknown>,
): UiLibrary => {
  // check for shadcn by looking for components.json (shadcn init creates this)
  for (const [dep, lib] of Object.entries(UI_LIBRARY_DEPENDENCIES)) {
    if (dep in dependencies) {
      return lib as UiLibrary;
    }
  }
  return "none";
};

const detectCssVariables = async (
  rootDirectory: string,
): Promise<boolean> => {
  try {
    const entries = await readdir(join(rootDirectory, "src"), {
      recursive: false,
    });
    for (const entry of entries) {
      if (
        typeof entry === "string" &&
        (entry.endsWith(".css") || entry.endsWith(".scss"))
      ) {
        const content = await readFile(
          join(rootDirectory, "src", entry),
          "utf-8",
        );
        if (content.includes("--")) {
          return true;
        }
      }
    }
  } catch {
    // src directory doesn't exist or can't be read
  }
  return false;
};

const countFiles = async (
  rootDirectory: string,
): Promise<{ sourceFileCount: number; styleFileCount: number }> => {
  let sourceFileCount = 0;
  let styleFileCount = 0;

  const walkDirectory = async (directory: string): Promise<void> => {
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (!IGNORE_DIRECTORIES.includes(entry.name as typeof IGNORE_DIRECTORIES[number])) {
            await walkDirectory(join(directory, entry.name));
          }
        } else {
          const name = entry.name;
          if (SOURCE_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
            sourceFileCount++;
          }
          if (STYLE_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
            styleFileCount++;
          }
        }
      }
    } catch {
      // can't read directory
    }
  };

  await walkDirectory(rootDirectory);
  return { sourceFileCount, styleFileCount };
};

const fileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};
