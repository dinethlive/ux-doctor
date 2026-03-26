import type { Diagnostic } from "../types.js";
import type { StylesheetDeclaration } from "./parse-stylesheets.js";
import type { TokenMap } from "./resolve-tokens.js";
import type { ParsedStylesheets } from "./parse-stylesheets.js";


export const checkColorSystem = (
  stylesheets: ParsedStylesheets,
  tokenMap: TokenMap,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const { declarations, atRules } = stylesheets;

  checkHardcodedColors(declarations, tokenMap, diagnostics);
  checkDarkModeCoverage(declarations, atRules, tokenMap, diagnostics);

  return diagnostics;
};

const checkHardcodedColors = (
  declarations: StylesheetDeclaration[],
  tokenMap: TokenMap,
  diagnostics: Diagnostic[],
): void => {
  if (tokenMap.tokens.size === 0) return;

  const colorProperties = new Set([
    "color",
    "background-color",
    "background",
    "border-color",
    "border",
    "outline-color",
    "box-shadow",
    "text-decoration-color",
  ]);

  for (const decl of declarations) {
    if (!colorProperties.has(decl.property)) continue;
    if (decl.selector === ":root" || decl.selector === "html") continue;
    if (decl.value.includes("var(")) continue;
    if (decl.value === "inherit" || decl.value === "currentColor" || decl.value === "transparent") continue;

    if (isHardcodedColor(decl.value)) {
      diagnostics.push({
        filePath: decl.filePath,
        rule: "color/hardcoded-values",
        category: "Color System",
        severity: "warning",
        message: `Hardcoded color ${decl.value} instead of a design token (CSS custom property)`,
        help: "Use a CSS custom property (e.g., var(--color-primary)) for maintainability and theme support",
        line: decl.line,
        column: decl.column,
        pass: "css",
        fixTarget: "css",
        fixExample: "color: var(--color-text);",
        priority: 4,
      });
    }
  }
};

const checkDarkModeCoverage = (
  declarations: StylesheetDeclaration[],
  atRules: ParsedStylesheets["atRules"],
  tokenMap: TokenMap,
  diagnostics: Diagnostic[],
): void => {
  const lightTokens = new Set<string>();
  const darkTokens = new Set<string>();

  for (const [name] of tokenMap.tokens) {
    if (name.startsWith("--color-") || name.startsWith("--bg-") || name.startsWith("--text-")) {
      lightTokens.add(name);
    }
  }

  if (lightTokens.size === 0) return;

  for (const atRule of atRules) {
    if (
      atRule.name === "media" &&
      atRule.params.includes("prefers-color-scheme: dark")
    ) {
      for (const decl of atRule.declarations) {
        if (decl.property.startsWith("--")) {
          darkTokens.add(decl.property);
        }
      }
    }
  }

  // check for .dark class pattern too
  for (const decl of declarations) {
    if (
      decl.selector.includes(".dark") &&
      decl.property.startsWith("--")
    ) {
      darkTokens.add(decl.property);
    }
  }

  if (lightTokens.size > 0 && darkTokens.size === 0) {
    const firstToken = declarations.find(
      (d) => d.property.startsWith("--color-") || d.property.startsWith("--bg-"),
    );
    if (firstToken) {
      diagnostics.push({
        filePath: firstToken.filePath,
        rule: "color/dark-mode-coverage",
        category: "Color System",
        severity: "warning",
        message: `${lightTokens.size} color tokens defined but no dark mode equivalents found`,
        help: "Add dark mode tokens using @media (prefers-color-scheme: dark) or a .dark class selector",
        line: firstToken.line,
        column: firstToken.column,
        pass: "css",
        fixTarget: "css",
        fixExample: "@media (prefers-color-scheme: dark) { :root { ... } }",
        priority: 4,
      });
    }
  }
};

const isHardcodedColor = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("#") && /^#[0-9a-f]{3,8}$/.test(trimmed)) return true;
  if (trimmed.startsWith("rgb(") || trimmed.startsWith("rgba(")) return true;
  if (trimmed.startsWith("hsl(") || trimmed.startsWith("hsla(")) return true;
  return false;
};
