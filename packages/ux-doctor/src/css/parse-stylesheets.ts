import { readFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import postcss, { type Root, type Declaration, type AtRule } from "postcss";
import postcssScss from "postcss-scss";
import { IGNORE_DIRECTORIES, STYLE_FILE_EXTENSIONS } from "../constants.js";
import { findSourceFiles } from "../utils/find-source-files.js";
import type { CssApproach } from "../types.js";
import { log } from "../utils/logger.js";

export interface StylesheetDeclaration {
  property: string;
  value: string;
  selector: string;
  filePath: string;
  line: number;
  column: number;
}

export interface StylesheetAtRule {
  name: string;
  params: string;
  filePath: string;
  line: number;
  declarations: StylesheetDeclaration[];
}

export interface ParsedStylesheets {
  declarations: StylesheetDeclaration[];
  atRules: StylesheetAtRule[];
  hasReducedMotionQuery: boolean;
}

export const parseStylesheets = async (
  rootDirectory: string,
  diffFiles?: string[] | null,
  cssApproach?: CssApproach,
): Promise<ParsedStylesheets> => {
  const styleFiles = await findStyleFiles(rootDirectory, diffFiles);
  log.verbose(`Found ${styleFiles.length} style files`);

  const allDeclarations: StylesheetDeclaration[] = [];
  const allAtRules: StylesheetAtRule[] = [];
  let hasReducedMotionQuery = false;

  for (const filePath of styleFiles) {
    try {
      const content = await readFile(filePath, "utf-8");
      const isScss =
        filePath.endsWith(".scss") || filePath.endsWith(".module.scss");

      const root = postcss.parse(content, {
        from: filePath,
        ...(isScss ? { parser: postcssScss } : {}),
      });

      const { declarations, atRules, hasReducedMotion } =
        extractFromRoot(root, filePath);

      allDeclarations.push(...declarations);
      allAtRules.push(...atRules);
      if (hasReducedMotion) hasReducedMotionQuery = true;
    } catch (error) {
      log.debug(
        `Failed to parse ${filePath}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  // CSS-in-JS support
  const cssInJsApproaches = new Set(["styled-components", "emotion", "css-in-js"]);
  if (cssApproach && cssInJsApproaches.has(cssApproach)) {
    const cssInJsResult = await parseCssInJsFiles(rootDirectory, diffFiles);
    allDeclarations.push(...cssInJsResult.declarations);
    allAtRules.push(...cssInJsResult.atRules);
    if (cssInJsResult.hasReducedMotionQuery) hasReducedMotionQuery = true;
  }

  return {
    declarations: allDeclarations,
    atRules: allAtRules,
    hasReducedMotionQuery,
  };
};

const extractFromRoot = (
  root: Root,
  filePath: string,
): {
  declarations: StylesheetDeclaration[];
  atRules: StylesheetAtRule[];
  hasReducedMotion: boolean;
} => {
  const declarations: StylesheetDeclaration[] = [];
  const atRules: StylesheetAtRule[] = [];
  let hasReducedMotion = false;

  root.walkDecls((decl: Declaration) => {
    const selector = getSelector(decl);
    declarations.push({
      property: decl.prop,
      value: decl.value,
      selector,
      filePath,
      line: decl.source?.start?.line ?? 0,
      column: decl.source?.start?.column ?? 0,
    });
  });

  root.walkAtRules((atRule: AtRule) => {
    if (
      atRule.name === "media" &&
      atRule.params.includes("prefers-reduced-motion")
    ) {
      hasReducedMotion = true;
    }

    const atRuleDeclarations: StylesheetDeclaration[] = [];
    atRule.walkDecls((decl: Declaration) => {
      atRuleDeclarations.push({
        property: decl.prop,
        value: decl.value,
        selector: getSelector(decl),
        filePath,
        line: decl.source?.start?.line ?? 0,
        column: decl.source?.start?.column ?? 0,
      });
    });

    atRules.push({
      name: atRule.name,
      params: atRule.params,
      filePath,
      line: atRule.source?.start?.line ?? 0,
      declarations: atRuleDeclarations,
    });
  });

  return { declarations, atRules, hasReducedMotion };
};

const getSelector = (decl: Declaration): string => {
  const parent = decl.parent;
  if (parent && "selector" in parent) {
    return (parent as { selector: string }).selector;
  }
  return ":root";
};

const findStyleFiles = async (
  rootDirectory: string,
  diffFiles?: string[] | null,
): Promise<string[]> => {
  if (diffFiles) {
    return diffFiles
      .filter((file) =>
        STYLE_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)),
      )
      .map((file) => join(rootDirectory, file));
  }

  const files: string[] = [];

  const walkDirectory = async (directory: string): Promise<void> => {
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (!IGNORE_DIRECTORIES.includes(entry.name as typeof IGNORE_DIRECTORIES[number])) {
            await walkDirectory(join(directory, entry.name));
          }
        } else {
          const ext = extname(entry.name);
          if (
            STYLE_FILE_EXTENSIONS.some(
              (styleExt) =>
                entry.name.endsWith(styleExt) || ext === styleExt,
            )
          ) {
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

const parseCssInJsFiles = async (
  rootDirectory: string,
  diffFiles?: string[] | null,
): Promise<ParsedStylesheets> => {
  const allDeclarations: StylesheetDeclaration[] = [];
  const allAtRules: StylesheetAtRule[] = [];
  let hasReducedMotionQuery = false;

  let styledSyntax: postcss.Syntax | undefined;
  try {
    // @ts-expect-error postcss-styled-syntax has no type declarations
    const mod = await import("postcss-styled-syntax");
    styledSyntax = mod.default ?? mod;
  } catch {
    log.verbose("postcss-styled-syntax not installed — skipping CSS-in-JS analysis");
    return { declarations: [], atRules: [], hasReducedMotionQuery: false };
  }

  const jsFiles = await findSourceFiles(rootDirectory, diffFiles);

  for (const filePath of jsFiles) {
    try {
      const content = await readFile(filePath, "utf-8");

      if (!content.includes("styled") && !content.includes("css`") && !content.includes("css(")) {
        continue;
      }

      const root = (postcss.parse as Function)(content, {
        from: filePath,
        syntax: styledSyntax,
      }) as Root;

      const { declarations, atRules, hasReducedMotion } =
        extractFromRoot(root, filePath);

      allDeclarations.push(...declarations);
      allAtRules.push(...atRules);
      if (hasReducedMotion) hasReducedMotionQuery = true;
    } catch {
      // not a CSS-in-JS file or parse error — skip silently
    }
  }

  log.verbose(`CSS-in-JS analysis found ${allDeclarations.length} declarations`);

  return {
    declarations: allDeclarations,
    atRules: allAtRules,
    hasReducedMotionQuery,
  };
};
