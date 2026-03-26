import type { Diagnostic } from "../types.js";
import type { StylesheetDeclaration } from "./parse-stylesheets.js";
import type { TokenMap } from "./resolve-tokens.js";
import { resolveTokenValue } from "./resolve-tokens.js";
import { parseCssSize, toPx, parseLineHeight } from "../utils/css-value-parser.js";
import {
  BASE_FONT_SIZE_MIN_PX,
  LINE_HEIGHT_MIN_RATIO,
  HEADING_ELEMENTS,
} from "../constants.js";

export const checkTypography = (
  declarations: StylesheetDeclaration[],
  tokenMap: TokenMap,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const headingSizes = new Map<string, number>();

  for (const decl of declarations) {
    const resolvedValue = resolveTokenValue(decl.value, tokenMap);

    if (decl.property === "font-size") {
      checkBaseFontSize(decl, resolvedValue, diagnostics);
      checkFixedFontSize(decl, resolvedValue, diagnostics);
      trackHeadingSizes(decl, resolvedValue, headingSizes);
    }

    if (decl.property === "line-height") {
      checkLineHeight(decl, resolvedValue, diagnostics);
    }
  }

  checkHeadingHierarchy(headingSizes, declarations, diagnostics);

  return diagnostics;
};

const checkBaseFontSize = (
  decl: StylesheetDeclaration,
  value: string,
  diagnostics: Diagnostic[],
): void => {
  if (!isRootSelector(decl.selector)) return;

  const size = parseCssSize(value);
  if (!size) return;

  const px = toPx(size);
  if (px === null) return;

  if (px < BASE_FONT_SIZE_MIN_PX) {
    diagnostics.push({
      filePath: decl.filePath,
      rule: "typography/base-font-size",
      category: "Typography",
      severity: "warning",
      message: `Base font size ${value} (${px}px) is below the recommended minimum of ${BASE_FONT_SIZE_MIN_PX}px`,
      help: "Set base font-size to at least 16px (1rem) for readability",
      line: decl.line,
      column: decl.column,
      wcagCriteria: "1.4.4",
      wcagLevel: "AA",
      pass: "css",
      fixTarget: "css",
      fixExample: "font-size: 1rem;",
      priority: 3,
    });
  }
};

const checkFixedFontSize = (
  decl: StylesheetDeclaration,
  value: string,
  diagnostics: Diagnostic[],
): void => {
  if (isRootSelector(decl.selector)) return;

  const size = parseCssSize(value);
  if (!size || size.unit !== "px") return;

  diagnostics.push({
    filePath: decl.filePath,
    rule: "typography/fixed-font-size",
    category: "Typography",
    severity: "warning",
    message: `Font size ${value} uses fixed px units — won't scale with user zoom preferences`,
    help: "Use rem or em units instead of px for font sizes so they scale with browser zoom",
    line: decl.line,
    column: decl.column,
    wcagCriteria: "1.4.4",
    wcagLevel: "AA",
    pass: "css",
    fixTarget: "css",
    fixExample: 'font-size: 1rem; /* replace px with rem */',
    priority: 3,
  });
};

const checkLineHeight = (
  decl: StylesheetDeclaration,
  value: string,
  diagnostics: Diagnostic[],
): void => {
  const lineHeight = parseLineHeight(value);
  if (lineHeight === null) return;

  if (lineHeight < LINE_HEIGHT_MIN_RATIO && !isHeadingSelector(decl.selector)) {
    diagnostics.push({
      filePath: decl.filePath,
      rule: "typography/line-height",
      category: "Typography",
      severity: "warning",
      message: `Line height ${value} (${lineHeight}) is below the recommended minimum of ${LINE_HEIGHT_MIN_RATIO}`,
      help: "Set line-height to at least 1.5 for body text to improve readability (WCAG 1.4.12)",
      line: decl.line,
      column: decl.column,
      wcagCriteria: "1.4.12",
      wcagLevel: "AA",
      pass: "css",
      fixTarget: "css",
      fixExample: "line-height: 1.5;",
      priority: 3,
    });
  }
};

const trackHeadingSizes = (
  decl: StylesheetDeclaration,
  value: string,
  headingSizes: Map<string, number>,
): void => {
  if (!isHeadingSelector(decl.selector)) return;

  const size = parseCssSize(value);
  if (!size) return;

  const px = toPx(size);
  if (px === null) return;

  const headingLevel = getHeadingLevel(decl.selector);
  if (headingLevel) {
    headingSizes.set(headingLevel, px);
  }
};

const checkHeadingHierarchy = (
  headingSizes: Map<string, number>,
  declarations: StylesheetDeclaration[],
  diagnostics: Diagnostic[],
): void => {
  const levels = HEADING_ELEMENTS
    .map((h) => ({ level: h, size: headingSizes.get(h) }))
    .filter((h) => h.size !== undefined);

  for (let i = 0; i < levels.length - 1; i++) {
    const current = levels[i];
    const next = levels[i + 1];
    if (current.size! <= next.size!) {
      const decl = declarations.find(
        (d) => isHeadingSelector(d.selector) && d.property === "font-size",
      );
      if (decl) {
        diagnostics.push({
          filePath: decl.filePath,
          rule: "typography/heading-hierarchy",
          category: "Typography",
          severity: "error",
          message: `Heading ${current.level} (${current.size}px) is not larger than ${next.level} (${next.size}px) — heading sizes should decrease with level`,
          help: "Ensure heading font sizes form a clear visual hierarchy: h1 > h2 > h3 > h4 > h5 > h6",
          line: decl.line,
          column: decl.column,
          wcagCriteria: "1.3.1",
          wcagLevel: "A",
          pass: "css",
          fixTarget: "css",
          fixExample: "/* ensure h1 > h2 > h3 font sizes */",
          priority: 3,
        });
      }
    }
  }
};

const isRootSelector = (selector: string): boolean =>
  selector === ":root" || selector === "html" || selector === "body";

const isHeadingSelector = (selector: string): boolean =>
  HEADING_ELEMENTS.some(
    (h) => selector === h || selector.startsWith(`${h} `) || selector.startsWith(`${h}.`) || selector.startsWith(`${h}:`),
  );

const getHeadingLevel = (selector: string): string | null => {
  for (const h of HEADING_ELEMENTS) {
    if (selector === h || selector.startsWith(`${h} `) || selector.startsWith(`${h}.`) || selector.startsWith(`${h}:`)) {
      return h;
    }
  }
  return null;
};
