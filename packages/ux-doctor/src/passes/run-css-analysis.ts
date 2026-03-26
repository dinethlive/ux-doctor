import type { Diagnostic, ProjectInfo } from "../types.js";
import { parseStylesheets } from "../css/parse-stylesheets.js";
import { buildTokenMap, resolveAllTokens } from "../css/resolve-tokens.js";
import { checkContrast, checkInheritedContrast } from "../css/contrast-check.js";
import { checkTypography } from "../css/typography-check.js";
import { checkSpacing } from "../css/spacing-check.js";
import { checkFocusIndicators } from "../css/focus-check.js";
import { checkAnimations } from "../css/animation-check.js";
import { checkColorSystem } from "../css/color-system-check.js";
import { checkResponsive } from "../css/responsive-check.js";
import { checkTailwindContrast } from "../css/tailwind-contrast-check.js";
import { log } from "../utils/logger.js";

export const runCssAnalysis = async (
  project: ProjectInfo,
  diffFiles?: string[] | null,
  contrastStandard: "wcag2" | "apca" = "wcag2",
): Promise<Diagnostic[]> => {
  const stylesheets = await parseStylesheets(project.rootDirectory, diffFiles, project.cssApproach);

  if (stylesheets.declarations.length === 0) {
    log.verbose("No CSS declarations found — skipping CSS analysis");
    return [];
  }

  const rawTokenMap = buildTokenMap(stylesheets.declarations);
  const tokenMap = resolveAllTokens(rawTokenMap);

  log.verbose(
    `Parsed ${stylesheets.declarations.length} CSS declarations, ${tokenMap.tokens.size} tokens`,
  );

  const diagnostics: Diagnostic[] = [
    ...checkContrast(stylesheets.declarations, tokenMap, contrastStandard),
    ...checkTypography(stylesheets.declarations, tokenMap),
    ...checkSpacing(stylesheets.declarations, tokenMap),
    ...checkFocusIndicators(stylesheets.declarations),
    ...checkAnimations(stylesheets),
    ...checkColorSystem(stylesheets, tokenMap),
    ...checkResponsive(stylesheets),
    ...checkInheritedContrast(stylesheets.declarations, tokenMap),
  ];

  if (project.hasTailwind) {
    const tailwindDiagnostics = await checkTailwindContrast(project, diffFiles);
    diagnostics.push(...tailwindDiagnostics);
  }

  log.verbose(`CSS analysis found ${diagnostics.length} issues`);

  return diagnostics;
};
