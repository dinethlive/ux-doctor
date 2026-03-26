import type { Diagnostic } from "../types.js";
import type { StylesheetDeclaration } from "./parse-stylesheets.js";
import type { TokenMap } from "./resolve-tokens.js";
import { resolveTokenValue } from "./resolve-tokens.js";
import {
  contrastRatio,
  meetsWcagAA,
  formatContrastRatio,
  suggestAccessibleColor,
  apcaContrast,
  meetsApcaThreshold,
  formatApcaContrast,
} from "../utils/color-math.js";
import { isCssColor } from "../utils/css-value-parser.js";
import {
  WCAG_AA_NORMAL_TEXT_RATIO,
  WCAG_AA_UI_COMPONENT_RATIO,
} from "../constants.js";

interface ColorContext {
  selector: string;
  filePath: string;
  foreground?: { value: string; line: number; column: number };
  background?: { value: string; line: number; column: number };
}

export const checkContrast = (
  declarations: StylesheetDeclaration[],
  tokenMap: TokenMap,
  contrastStandard: "wcag2" | "apca" = "wcag2",
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const contextMap = new Map<string, ColorContext>();

  for (const decl of declarations) {
    const key = `${decl.filePath}::${decl.selector}`;
    const context = contextMap.get(key) ?? {
      selector: decl.selector,
      filePath: decl.filePath,
    };

    const resolvedValue = resolveTokenValue(decl.value, tokenMap);

    if (isTextColorProperty(decl.property) && isCssColor(resolvedValue)) {
      context.foreground = {
        value: resolvedValue,
        line: decl.line,
        column: decl.column,
      };
    }

    if (isBackgroundColorProperty(decl.property) && isCssColor(resolvedValue)) {
      context.background = {
        value: resolvedValue,
        line: decl.line,
        column: decl.column,
      };
    }

    contextMap.set(key, context);
  }

  for (const context of contextMap.values()) {
    if (!context.foreground || !context.background) continue;

    if (contrastStandard === "apca") {
      const lc = apcaContrast(context.foreground.value, context.background.value);
      if (lc === null) continue;

      if (!meetsApcaThreshold(lc)) {
        diagnostics.push({
          filePath: context.filePath,
          rule: "contrast/text-color-ratio",
          category: "Contrast",
          severity: "error",
          message: `Text color ${context.foreground.value} on background ${context.background.value} has APCA contrast ${formatApcaContrast(lc)} — needs Lc 75+ for body text`,
          help: "Use a color pair with sufficient APCA lightness contrast (Lc 75+ for body text)",
          line: context.foreground.line,
          column: context.foreground.column,
          wcagCriteria: "1.4.3",
          wcagLevel: "AA",
          pass: "css",
          fixTarget: "css",
          fixExample: "color: #1a1a1a; /* increase text contrast */",
          priority: 1,
        });
      }
      continue;
    }

    const ratio = contrastRatio(
      context.foreground.value,
      context.background.value,
    );
    if (ratio === null) continue;

    if (!meetsWcagAA(ratio, false)) {
      const suggestion = suggestAccessibleColor(
        context.foreground.value,
        context.background.value,
        WCAG_AA_NORMAL_TEXT_RATIO,
      );

      const helpParts = [
        `Use a color with at least 4.5:1 contrast ratio.`,
      ];
      if (suggestion && suggestion !== context.foreground.value) {
        const suggestedRatio = contrastRatio(
          suggestion,
          context.background.value,
        );
        if (suggestedRatio) {
          helpParts.push(
            `Try ${suggestion} (${formatContrastRatio(suggestedRatio)})`,
          );
        }
      }

      const fixColor = suggestion && suggestion !== context.foreground.value ? suggestion : null;
      diagnostics.push({
        filePath: context.filePath,
        rule: "contrast/text-color-ratio",
        category: "Contrast",
        severity: "error",
        message: `Text color ${context.foreground.value} on background ${context.background.value} has contrast ratio ${formatContrastRatio(ratio)} — needs 4.5:1 for WCAG AA`,
        help: helpParts.join(" "),
        line: context.foreground.line,
        column: context.foreground.column,
        wcagCriteria: "1.4.3",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: fixColor ? `color: ${fixColor};` : undefined,
        priority: 1,
      });
    }
  }

  // check placeholder contrast
  for (const decl of declarations) {
    if (!decl.selector.includes("placeholder")) continue;
    if (!isTextColorProperty(decl.property)) continue;

    const resolvedValue = resolveTokenValue(decl.value, tokenMap);
    if (!isCssColor(resolvedValue)) continue;

    // assume white background if not specified
    const ratio = contrastRatio(resolvedValue, "#ffffff");
    if (ratio !== null && !meetsWcagAA(ratio, false)) {
      diagnostics.push({
        filePath: decl.filePath,
        rule: "contrast/placeholder-ratio",
        category: "Contrast",
        severity: "warning",
        message: `Placeholder text color ${resolvedValue} may have insufficient contrast (${formatContrastRatio(ratio)})`,
        help: "Ensure placeholder text meets 4.5:1 contrast ratio against the input background",
        line: decl.line,
        column: decl.column,
        wcagCriteria: "1.4.3",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: "color: #767676; /* meet 4.5:1 ratio */",
        priority: 1,
      });
    }
  }

  // check focus ring contrast
  for (const decl of declarations) {
    if (!decl.selector.includes(":focus") && !decl.selector.includes(":focus-visible")) continue;
    if (decl.property !== "outline-color" && decl.property !== "box-shadow") continue;

    const resolvedValue = resolveTokenValue(decl.value, tokenMap);
    if (!isCssColor(resolvedValue)) continue;

    const ratio = contrastRatio(resolvedValue, "#ffffff");
    if (ratio !== null && ratio < WCAG_AA_UI_COMPONENT_RATIO) {
      diagnostics.push({
        filePath: decl.filePath,
        rule: "contrast/focus-ring-ratio",
        category: "Contrast",
        severity: "error",
        message: `Focus indicator color ${resolvedValue} has contrast ratio ${formatContrastRatio(ratio)} — needs 3:1 for WCAG AA`,
        help: "Use a focus indicator color with at least 3:1 contrast against adjacent colors",
        line: decl.line,
        column: decl.column,
        wcagCriteria: "1.4.11",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: "outline-color: #2563eb; /* meet 3:1 ratio */",
        priority: 1,
      });
    }
  }

  return diagnostics;
};

export const checkInheritedContrast = (
  declarations: StylesheetDeclaration[],
  tokenMap: TokenMap,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  const backgroundsBySelector = new Map<string, { value: string; decl: StylesheetDeclaration }>();
  const textColorDecls: Array<{ value: string; selector: string; decl: StylesheetDeclaration }> = [];

  for (const decl of declarations) {
    const resolvedValue = resolveTokenValue(decl.value, tokenMap);
    if (!isCssColor(resolvedValue)) continue;

    if (isBackgroundColorProperty(decl.property)) {
      backgroundsBySelector.set(decl.selector, { value: resolvedValue, decl });
    }

    if (isTextColorProperty(decl.property)) {
      if (!backgroundsBySelector.has(decl.selector)) {
        textColorDecls.push({ value: resolvedValue, selector: decl.selector, decl });
      }
    }
  }

  if (backgroundsBySelector.size === 0) return diagnostics;

  for (const text of textColorDecls) {
    const matchedBg = findClosestBackground(text.selector, backgroundsBySelector);
    if (!matchedBg) continue;

    const ratio = contrastRatio(text.value, matchedBg.value);
    if (ratio === null) continue;

    if (!meetsWcagAA(ratio, false)) {
      const suggestion = suggestAccessibleColor(text.value, matchedBg.value, WCAG_AA_NORMAL_TEXT_RATIO);
      diagnostics.push({
        filePath: text.decl.filePath,
        rule: "contrast/inherited-color-ratio",
        category: "Contrast",
        severity: "warning",
        message: `Text color ${text.value} (${text.selector}) likely inherits background ${matchedBg.value} (${matchedBg.decl.selector}) — ratio ${formatContrastRatio(ratio)}, needs 4.5:1`,
        help: suggestion && suggestion !== text.value
          ? `Try ${suggestion} for sufficient contrast against ${matchedBg.value}`
          : "Increase text darkness or lighten the background to meet 4.5:1 ratio",
        line: text.decl.line,
        column: text.decl.column,
        wcagCriteria: "1.4.3",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: suggestion && suggestion !== text.value ? `color: ${suggestion};` : undefined,
        priority: 1,
      });
    }
  }

  return diagnostics;
};

const findClosestBackground = (
  textSelector: string,
  backgrounds: Map<string, { value: string; decl: StylesheetDeclaration }>,
): { value: string; decl: StylesheetDeclaration } | null => {
  // strategy 1: parent selector (e.g., ".card p" text inherits ".card" background)
  const parts = textSelector.split(/\s+/);
  for (let i = parts.length - 1; i >= 0; i--) {
    const parentSelector = parts.slice(0, i).join(" ");
    if (parentSelector && backgrounds.has(parentSelector)) {
      return backgrounds.get(parentSelector)!;
    }
  }

  // strategy 2: class prefix match (e.g., ".card__text" inherits ".card" background)
  const baseClass = textSelector.split(/[_\s>+~]/).filter(Boolean)[0];
  if (baseClass) {
    for (const [selector, bg] of backgrounds) {
      if (textSelector.startsWith(selector) && selector !== textSelector) {
        return bg;
      }
    }
  }

  // strategy 3: root/body fallback
  for (const rootSel of [":root", "html", "body"]) {
    if (backgrounds.has(rootSel)) {
      return backgrounds.get(rootSel)!;
    }
  }

  return null;
};

const isTextColorProperty = (property: string): boolean =>
  property === "color";

const isBackgroundColorProperty = (property: string): boolean =>
  property === "background-color" || property === "background";
