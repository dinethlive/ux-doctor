import type { Diagnostic, ScoreResult } from "../types.js";
import {
  PERFECT_SCORE,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  ERROR_RULE_PENALTY,
  WARNING_RULE_PENALTY,
} from "../constants.js";

export const calculateScore = (diagnostics: Diagnostic[]): ScoreResult => {
  const errorRules = new Set<string>();
  const warningRules = new Set<string>();

  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === "error") {
      errorRules.add(diagnostic.rule);
    } else {
      warningRules.add(diagnostic.rule);
    }
  }

  const penalty =
    errorRules.size * ERROR_RULE_PENALTY +
    warningRules.size * WARNING_RULE_PENALTY;

  const score = Math.max(0, Math.round(PERFECT_SCORE - penalty));

  return {
    score,
    label: getScoreLabel(score),
  };
};

const getScoreLabel = (score: number): ScoreResult["label"] => {
  if (score >= SCORE_GOOD_THRESHOLD) return "Great";
  if (score >= SCORE_OK_THRESHOLD) return "Needs work";
  return "Critical";
};
