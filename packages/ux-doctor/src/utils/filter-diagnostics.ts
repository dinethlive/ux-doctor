import type { Diagnostic, UxDoctorIgnoreConfig } from "../types.js";

export const filterDiagnostics = (
  diagnostics: Diagnostic[],
  ignoreConfig?: UxDoctorIgnoreConfig,
): Diagnostic[] => {
  if (!ignoreConfig) return diagnostics;

  return diagnostics.filter((diagnostic) => {
    if (ignoreConfig.rules?.includes(diagnostic.rule)) {
      return false;
    }

    if (ignoreConfig.categories?.includes(diagnostic.category)) {
      return false;
    }

    if (ignoreConfig.files) {
      for (const pattern of ignoreConfig.files) {
        if (globMatch(diagnostic.filePath, pattern)) {
          return false;
        }
      }
    }

    return true;
  });
};

const globMatch = (filePath: string, pattern: string): boolean => {
  const normalized = filePath.replace(/\\/g, "/");
  const regexStr = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/\{\{GLOBSTAR\}\}/g, ".*");
  return new RegExp(`^${regexStr}$`).test(normalized);
};
