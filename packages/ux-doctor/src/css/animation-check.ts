import type { Diagnostic } from "../types.js";
import type { ParsedStylesheets } from "./parse-stylesheets.js";

export const checkAnimations = (
  stylesheets: ParsedStylesheets,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const { declarations, hasReducedMotionQuery } = stylesheets;

  const hasAnimations = declarations.some(
    (d) =>
      d.property === "animation" ||
      d.property === "animation-name" ||
      d.property === "transition",
  );

  if (hasAnimations && !hasReducedMotionQuery) {
    const animDecl = declarations.find(
      (d) =>
        d.property === "animation" ||
        d.property === "animation-name" ||
        d.property === "transition",
    );
    if (animDecl) {
      diagnostics.push({
        filePath: animDecl.filePath,
        rule: "motion/prefers-reduced-motion",
        category: "Motion",
        severity: "error",
        message: "Project has CSS animations but no @media (prefers-reduced-motion) query",
        help: "Add @media (prefers-reduced-motion: reduce) { ... } to disable or reduce animations for users who prefer reduced motion",
        line: animDecl.line,
        column: animDecl.column,
        wcagCriteria: "2.3.3",
        wcagLevel: "AAA",
        pass: "css",
        fixTarget: "css",
        fixExample: '@media (prefers-reduced-motion: reduce) { animation: none; }',
        priority: 3,
      });
    }
  }

  for (const decl of declarations) {
    if (decl.property === "transition" && decl.value.includes("all")) {
      diagnostics.push({
        filePath: decl.filePath,
        rule: "motion/transition-all",
        category: "Motion",
        severity: "warning",
        message: `transition: ${decl.value} includes motion-sensitive properties — specify individual properties instead`,
        help: "Replace 'transition: all' with specific properties (e.g., 'transition: opacity 0.2s, background-color 0.2s') to avoid animating layout properties",
        line: decl.line,
        column: decl.column,
        pass: "css",
        fixTarget: "css",
        fixExample: "transition: opacity 0.2s, background-color 0.2s;",
        priority: 3,
      });
    }

    if (decl.property === "will-change" && decl.value !== "auto") {
      const isInsideHover = decl.selector.includes(":hover");
      const isInsideFocus = decl.selector.includes(":focus");
      const isInsideActive = decl.selector.includes(":active");

      if (!isInsideHover && !isInsideFocus && !isInsideActive) {
        diagnostics.push({
          filePath: decl.filePath,
          rule: "motion/permanent-will-change",
          category: "Motion",
          severity: "warning",
          message: `will-change: ${decl.value} is set permanently — should only be applied during interaction`,
          help: "Move will-change to :hover/:focus/:active state, or apply it via JavaScript just before the animation starts",
          line: decl.line,
          column: decl.column,
          pass: "css",
          fixTarget: "css",
          fixExample: "/* move will-change to :hover state */",
          priority: 3,
        });
      }
    }
  }

  // check for autoplay animations
  for (const decl of declarations) {
    if (decl.property !== "animation" && decl.property !== "animation-play-state") continue;

    if (decl.property === "animation" && !decl.value.includes("paused")) {
      const hasInfinite = decl.value.includes("infinite");
      if (hasInfinite) {
        diagnostics.push({
          filePath: decl.filePath,
          rule: "motion/no-autoplay-animation",
          category: "Motion",
          severity: "warning",
          message: "Infinite CSS animation plays automatically without a pause mechanism",
          help: "Add animation-play-state: paused by default, or provide a user control to pause the animation",
          line: decl.line,
          column: decl.column,
          wcagCriteria: "2.2.2",
          wcagLevel: "A",
          pass: "css",
          fixTarget: "css",
          fixExample: "animation-play-state: paused;",
          priority: 3,
        });
      }
    }
  }

  return diagnostics;
};
