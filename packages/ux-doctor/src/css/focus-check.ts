import type { Diagnostic } from "../types.js";
import type { StylesheetDeclaration } from "./parse-stylesheets.js";
import { FOCUS_RESET_PATTERNS } from "../constants.js";

export const checkFocusIndicators = (
  declarations: StylesheetDeclaration[],
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  const focusSelectors = new Map<
    string,
    { hasOutlineReset: boolean; hasReplacementStyle: boolean; decl: StylesheetDeclaration }
  >();

  for (const decl of declarations) {
    const isFocusSelector =
      decl.selector.includes(":focus") ||
      decl.selector.includes(":focus-visible") ||
      decl.selector.includes(":focus-within");

    if (!isFocusSelector) {
      if (isOutlineReset(decl)) {
        diagnostics.push({
          filePath: decl.filePath,
          rule: "focus/no-outline-none",
          category: "Focus Indicators",
          severity: "error",
          message: `${decl.property}: ${decl.value} removes the default focus indicator without a replacement`,
          help: "Add a visible focus style (outline, box-shadow, or border) when removing the default outline",
          line: decl.line,
          column: decl.column,
          wcagCriteria: "2.4.7",
          wcagLevel: "AA",
          pass: "css",
          fixTarget: "css",
          fixExample: "outline: 2px solid #2563eb; outline-offset: 2px;",
          priority: 2,
        });
      }
      continue;
    }

    const key = `${decl.filePath}::${decl.selector}`;
    const existing = focusSelectors.get(key) ?? {
      hasOutlineReset: false,
      hasReplacementStyle: false,
      decl,
    };

    if (isOutlineReset(decl)) {
      existing.hasOutlineReset = true;
    }

    if (isReplacementFocusStyle(decl)) {
      existing.hasReplacementStyle = true;
    }

    focusSelectors.set(key, existing);
  }

  for (const [, info] of focusSelectors) {
    if (info.hasOutlineReset && !info.hasReplacementStyle) {
      diagnostics.push({
        filePath: info.decl.filePath,
        rule: "focus/no-outline-none",
        category: "Focus Indicators",
        severity: "error",
        message: "Focus style removes outline without providing a visible replacement",
        help: "Add a visible focus indicator (box-shadow, border, or custom outline) alongside outline: none",
        line: info.decl.line,
        column: info.decl.column,
        wcagCriteria: "2.4.7",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: "outline: 2px solid #2563eb; outline-offset: 2px;",
        priority: 2,
      });
    }
  }

  // check for :focus vs :focus-visible usage
  for (const decl of declarations) {
    if (
      decl.selector.includes(":focus") &&
      !decl.selector.includes(":focus-visible") &&
      !decl.selector.includes(":focus-within")
    ) {
      const key = `${decl.filePath}::focus-visible-check`;
      if (!focusSelectors.has(key)) {
        focusSelectors.set(key, {
          hasOutlineReset: false,
          hasReplacementStyle: false,
          decl,
        });
        diagnostics.push({
          filePath: decl.filePath,
          rule: "focus/focus-visible-usage",
          category: "Focus Indicators",
          severity: "warning",
          message: "Using :focus instead of :focus-visible — focus styles will show on mouse click too",
          help: "Consider using :focus-visible instead of :focus to only show focus indicators for keyboard navigation",
          line: decl.line,
          column: decl.column,
          pass: "css",
          fixTarget: "css",
          fixExample: ":focus-visible { outline: 2px solid #2563eb; }",
          priority: 2,
        });
      }
    }
  }

  return diagnostics;
};

const isOutlineReset = (decl: StylesheetDeclaration): boolean => {
  if (decl.property !== "outline" && decl.property !== "outline-style") {
    return false;
  }
  const combined = `${decl.property}: ${decl.value}`;
  return FOCUS_RESET_PATTERNS.some((pattern) => pattern.test(combined));
};

const isReplacementFocusStyle = (decl: StylesheetDeclaration): boolean =>
  decl.property === "box-shadow" ||
  decl.property === "border" ||
  decl.property === "border-color" ||
  (decl.property === "outline" && !isOutlineReset(decl)) ||
  decl.property === "outline-color" ||
  decl.property === "text-decoration";
