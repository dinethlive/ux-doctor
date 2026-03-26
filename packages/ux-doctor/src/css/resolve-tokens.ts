import type { CssTokenDefinition } from "../types.js";

export interface TokenMap {
  tokens: Map<string, CssTokenDefinition>;
}

export const buildTokenMap = (
  declarations: Array<{
    property: string;
    value: string;
    filePath: string;
    line: number;
  }>,
): TokenMap => {
  const tokens = new Map<string, CssTokenDefinition>();

  for (const decl of declarations) {
    if (decl.property.startsWith("--")) {
      tokens.set(decl.property, {
        name: decl.property,
        value: decl.value,
        filePath: decl.filePath,
        line: decl.line,
      });
    }
  }

  return { tokens };
};

export const resolveTokenValue = (
  value: string,
  tokenMap: TokenMap,
  maxDepth: number = 10,
): string => {
  let current = value;
  let depth = 0;

  while (depth < maxDepth) {
    const varMatch = current.match(/var\(\s*(--.+?)(?:\s*,\s*(.+?))?\s*\)/);
    if (!varMatch) break;

    const varName = varMatch[1].trim();
    const fallback = varMatch[2]?.trim();

    const token = tokenMap.tokens.get(varName);
    const resolvedValue = token?.value ?? fallback;

    if (!resolvedValue) break;

    current = current.replace(varMatch[0], resolvedValue);
    depth++;
  }

  return current;
};

export const resolveAllTokens = (tokenMap: TokenMap): TokenMap => {
  const resolved = new Map<string, CssTokenDefinition>();

  for (const [name, token] of tokenMap.tokens) {
    const resolvedValue = resolveTokenValue(token.value, tokenMap);
    resolved.set(name, {
      ...token,
      value: resolvedValue,
    });
  }

  return { tokens: resolved };
};
