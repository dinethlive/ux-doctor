import type { Diagnostic } from "../types.js";
import type { StylesheetDeclaration } from "./parse-stylesheets.js";
import type { TokenMap } from "./resolve-tokens.js";
import { resolveTokenValue } from "./resolve-tokens.js";
import { parseCssSize, toPx } from "../utils/css-value-parser.js";
import {
  TOUCH_TARGET_MIN_PX,
  TOUCH_TARGET_RECOMMENDED_PX,
} from "../constants.js";

const INTERACTIVE_SELECTORS = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[type=button]",
  "[type=submit]",
  "[type=reset]",
  "[role=button]",
  "[role=link]",
  "[role=tab]",
  "[role=menuitem]",
];

export const checkSpacing = (
  declarations: StylesheetDeclaration[],
  tokenMap: TokenMap,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  const sizesBySelector = new Map<
    string,
    { width?: number; height?: number; minWidth?: number; minHeight?: number; decl: StylesheetDeclaration }
  >();

  for (const decl of declarations) {
    if (!isInteractiveSelector(decl.selector)) continue;

    const resolvedValue = resolveTokenValue(decl.value, tokenMap);
    const size = parseCssSize(resolvedValue);
    if (!size) continue;

    const px = toPx(size);
    if (px === null) continue;

    const key = `${decl.filePath}::${decl.selector}`;
    const existing = sizesBySelector.get(key) ?? { decl };

    if (decl.property === "width") existing.width = px;
    if (decl.property === "height") existing.height = px;
    if (decl.property === "min-width") existing.minWidth = px;
    if (decl.property === "min-height") existing.minHeight = px;

    sizesBySelector.set(key, existing);
  }

  for (const [, info] of sizesBySelector) {
    const effectiveWidth = info.minWidth ?? info.width;
    const effectiveHeight = info.minHeight ?? info.height;

    if (effectiveWidth !== undefined && effectiveWidth < TOUCH_TARGET_MIN_PX) {
      diagnostics.push({
        filePath: info.decl.filePath,
        rule: "touch/minimum-size",
        category: "Touch Targets",
        severity: "error",
        message: `Interactive element width ${effectiveWidth}px is below the minimum touch target size of ${TOUCH_TARGET_MIN_PX}px`,
        help: `Set min-width to at least ${TOUCH_TARGET_MIN_PX}px (${TOUCH_TARGET_RECOMMENDED_PX}px recommended)`,
        line: info.decl.line,
        column: info.decl.column,
        wcagCriteria: "2.5.8",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: "min-width: 44px; min-height: 44px;",
        priority: 3,
      });
    } else if (effectiveWidth !== undefined && effectiveWidth < TOUCH_TARGET_RECOMMENDED_PX) {
      diagnostics.push({
        filePath: info.decl.filePath,
        rule: "touch/recommended-size",
        category: "Touch Targets",
        severity: "warning",
        message: `Interactive element width ${effectiveWidth}px is below the recommended touch target size of ${TOUCH_TARGET_RECOMMENDED_PX}px`,
        help: `Consider increasing to at least ${TOUCH_TARGET_RECOMMENDED_PX}px for comfortable touch interaction`,
        line: info.decl.line,
        column: info.decl.column,
        wcagCriteria: "2.5.5",
        wcagLevel: "AAA",
        pass: "css",
        fixTarget: "css",
        fixExample: "min-width: 44px; min-height: 44px;",
        priority: 3,
      });
    }

    if (effectiveHeight !== undefined && effectiveHeight < TOUCH_TARGET_MIN_PX) {
      diagnostics.push({
        filePath: info.decl.filePath,
        rule: "touch/minimum-size",
        category: "Touch Targets",
        severity: "error",
        message: `Interactive element height ${effectiveHeight}px is below the minimum touch target size of ${TOUCH_TARGET_MIN_PX}px`,
        help: `Set min-height to at least ${TOUCH_TARGET_MIN_PX}px (${TOUCH_TARGET_RECOMMENDED_PX}px recommended)`,
        line: info.decl.line,
        column: info.decl.column,
        wcagCriteria: "2.5.8",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: "min-width: 44px; min-height: 44px;",
        priority: 3,
      });
    } else if (effectiveHeight !== undefined && effectiveHeight < TOUCH_TARGET_RECOMMENDED_PX) {
      diagnostics.push({
        filePath: info.decl.filePath,
        rule: "touch/recommended-size",
        category: "Touch Targets",
        severity: "warning",
        message: `Interactive element height ${effectiveHeight}px is below the recommended touch target size of ${TOUCH_TARGET_RECOMMENDED_PX}px`,
        help: `Consider increasing to at least ${TOUCH_TARGET_RECOMMENDED_PX}px for comfortable touch interaction`,
        line: info.decl.line,
        column: info.decl.column,
        wcagCriteria: "2.5.5",
        wcagLevel: "AAA",
        pass: "css",
        fixTarget: "css",
        fixExample: "min-width: 44px; min-height: 44px;",
        priority: 3,
      });
    }
  }

  return diagnostics;
};

const isInteractiveSelector = (selector: string): boolean =>
  INTERACTIVE_SELECTORS.some(
    (s) =>
      selector.includes(s) ||
      selector.includes(`.btn`) ||
      selector.includes(`.button`),
  );
