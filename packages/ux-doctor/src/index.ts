import { resolve } from "node:path";
import { scan } from "./scan.js";
import type { ScanOptions, ScanResult } from "./types.js";

export type {
  Diagnostic,
  DiagnosticCategory,
  DiagnosticPass,
  ProjectInfo,
  ScanOptions,
  ScanResult,
  ScoreResult,
  UxDoctorConfig,
  JsonOutput,
} from "./types.js";

export const diagnose = async (
  directory: string,
  options: Omit<ScanOptions, "scoreOnly" | "json"> = {},
): Promise<ScanResult> => {
  const resolvedDirectory = resolve(directory);
  return scan(resolvedDirectory, { ...options, json: true });
};
