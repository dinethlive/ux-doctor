import type { Diagnostic } from "../types.js";
import type { StylesheetDeclaration } from "./parse-stylesheets.js";
import type { ParsedStylesheets } from "./parse-stylesheets.js";

export const checkResponsive = (
  stylesheets: ParsedStylesheets,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const { declarations } = stylesheets;

  checkViewportMeta(declarations, diagnostics);
  checkZoomPrevention(declarations, diagnostics);
  checkHorizontalScroll(declarations, diagnostics);

  return diagnostics;
};

const checkViewportMeta = (
  _declarations: StylesheetDeclaration[],
  _diagnostics: Diagnostic[],
): void => {
  // viewport meta is in HTML, not CSS — skip for CSS analysis
};

const checkZoomPrevention = (
  declarations: StylesheetDeclaration[],
  diagnostics: Diagnostic[],
): void => {
  for (const decl of declarations) {
    if (decl.property === "touch-action" && decl.value === "none") {
      diagnostics.push({
        filePath: decl.filePath,
        rule: "responsive/zoom-prevention",
        category: "Responsive",
        severity: "error",
        message: "touch-action: none prevents pinch-to-zoom on mobile devices",
        help: "Use touch-action: manipulation instead to allow zooming while preventing double-tap delay",
        line: decl.line,
        column: decl.column,
        wcagCriteria: "1.4.4",
        wcagLevel: "AA",
        pass: "css",
        fixTarget: "css",
        fixExample: "touch-action: manipulation;",
        priority: 4,
      });
    }
  }
};

const checkHorizontalScroll = (
  declarations: StylesheetDeclaration[],
  diagnostics: Diagnostic[],
): void => {
  for (const decl of declarations) {
    if (decl.property === "overflow-x" && decl.value === "hidden") continue;
    if (decl.property === "overflow" && decl.value === "hidden") continue;

    if (
      decl.property === "width" &&
      decl.value.endsWith("px") &&
      !decl.selector.includes("max-width")
    ) {
      const px = parseFloat(decl.value);
      if (px > 320 && !decl.selector.includes("@media")) {
        // only flag very wide fixed widths on body/container elements
        const containerSelectors = ["body", "html", ".container", ".wrapper", "#app", "#root", "main"];
        if (containerSelectors.some((s) => decl.selector.includes(s))) {
          diagnostics.push({
            filePath: decl.filePath,
            rule: "responsive/horizontal-scroll",
            category: "Responsive",
            severity: "warning",
            message: `Fixed width ${decl.value} on ${decl.selector} may cause horizontal scrolling on mobile devices`,
            help: "Use max-width instead of width, or use relative units (%, vw) for responsive layout",
            line: decl.line,
            column: decl.column,
            wcagCriteria: "1.4.10",
            wcagLevel: "AA",
            pass: "css",
            fixTarget: "css",
            fixExample: "max-width: 100%; /* use relative units */",
            priority: 4,
          });
        }
      }
    }
  }
};
