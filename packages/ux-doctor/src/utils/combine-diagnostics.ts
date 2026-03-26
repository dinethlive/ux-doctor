import type { Diagnostic } from "../types.js";

export const combineDiagnostics = (
  ...arrays: Diagnostic[][]
): Diagnostic[] => {
  const combined = arrays.flat();
  return deduplicateDiagnostics(combined);
};

const SEMANTIC_DUPLICATES: Record<string, string> = {
  "keyboard/click-has-key-event": "jsx-a11y/click-events-have-key-events",
  "keyboard/no-positive-tabindex": "jsx-a11y/tabindex-no-positive",
  "keyboard/no-static-interaction": "jsx-a11y/no-static-element-interactions",
  "aria/valid-role": "jsx-a11y/aria-role",
  "aria/required-props": "jsx-a11y/role-has-required-aria-props",
  "aria/no-redundant": "jsx-a11y/no-redundant-roles",
  "semantic/heading-content": "jsx-a11y/heading-has-content",
  "semantic/page-language": "jsx-a11y/html-has-lang",
};

const deduplicateDiagnostics = (diagnostics: Diagnostic[]): Diagnostic[] => {
  const seen = new Set<string>();
  const result: Diagnostic[] = [];

  for (const diagnostic of diagnostics) {
    const exactKey = `${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column}:${diagnostic.rule}`;
    if (seen.has(exactKey)) continue;
    seen.add(exactKey);

    const canonicalRule = SEMANTIC_DUPLICATES[diagnostic.rule] ?? diagnostic.rule;
    const semanticKey = `${diagnostic.filePath}:${diagnostic.line}:${canonicalRule}`;
    if (seen.has(semanticKey)) continue;
    seen.add(semanticKey);

    result.push(diagnostic);
  }

  return result;
};
