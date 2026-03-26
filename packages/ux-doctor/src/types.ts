// --- Project Detection ---

export type CssApproach =
  | "tailwind"
  | "css-modules"
  | "styled-components"
  | "emotion"
  | "vanilla-css"
  | "scss"
  | "less"
  | "css-in-js"
  | "unknown";

export type Framework =
  | "nextjs"
  | "vite"
  | "cra"
  | "remix"
  | "gatsby"
  | "expo"
  | "react-native"
  | "unknown";

export type UiLibrary =
  | "shadcn"
  | "mui"
  | "chakra"
  | "ant-design"
  | "radix"
  | "headless-ui"
  | "mantine"
  | "none";

export interface ProjectInfo {
  rootDirectory: string;
  projectName: string;
  framework: Framework;
  cssApproach: CssApproach;
  uiLibrary: UiLibrary;
  hasTypeScript: boolean;
  hasTailwind: boolean;
  hasCssVariables: boolean;
  hasDesignTokens: boolean;
  sourceFileCount: number;
  styleFileCount: number;
}

// --- Diagnostics ---

export type DiagnosticCategory =
  | "Contrast"
  | "Typography"
  | "Semantic Structure"
  | "ARIA"
  | "Keyboard"
  | "Forms"
  | "Media"
  | "Touch Targets"
  | "Motion"
  | "Color System"
  | "Focus Indicators"
  | "Responsive"
  | "Navigation"
  | "Framework";

export type DiagnosticPass = "source" | "css" | "runtime";

export type FixTarget = "jsx" | "css" | "tailwind" | "config" | "html";

export interface Diagnostic {
  filePath: string;
  rule: string;
  category: DiagnosticCategory;
  severity: "error" | "warning";
  message: string;
  help: string;
  line: number;
  column: number;
  wcagCriteria?: string;
  wcagLevel?: "A" | "AA" | "AAA";
  pass: DiagnosticPass;
  weight?: number;
  fixTarget?: FixTarget;
  fixExample?: string;
  priority?: number;
}

// --- Scoring ---

export interface ScoreResult {
  score: number;
  label: "Great" | "Needs work" | "Critical";
}

// --- Scan ---

export interface ScanOptions {
  sourceLint?: boolean;
  cssAnalysis?: boolean;
  runtime?: boolean;
  runtimeUrl?: string;
  verbose?: boolean;
  scoreOnly?: boolean;
  json?: boolean;
  agent?: boolean;
  diff?: boolean | string;
  includePaths?: string[];
  wcagLevel?: "A" | "AA" | "AAA";
  contrastStandard?: "wcag2" | "apca";
}

export interface ScanResult {
  diagnostics: Diagnostic[];
  scoreResult: ScoreResult | null;
  project: ProjectInfo;
  skippedPasses: string[];
  elapsedMilliseconds: number;
}

// --- Configuration ---

export interface UxDoctorIgnoreConfig {
  rules?: string[];
  files?: string[];
  categories?: DiagnosticCategory[];
}

export interface UxDoctorConfig {
  ignore?: UxDoctorIgnoreConfig;
  sourceLint?: boolean;
  cssAnalysis?: boolean;
  runtime?: boolean;
  verbose?: boolean;
  diff?: boolean | string;
  wcagLevel?: "A" | "AA" | "AAA";
  contrastStandard?: "wcag2" | "apca";
}

// --- Rule System ---

export interface EsTreeNode {
  type: string;
  [key: string]: unknown;
}

export interface ReportDescriptor {
  node: EsTreeNode;
  message: string;
}

export interface RuleContext {
  report: (descriptor: ReportDescriptor) => void;
  getFilename?: () => string;
}

export interface RuleVisitors {
  [selector: string]: ((node: EsTreeNode) => void) | (() => void);
}

export interface Rule {
  create: (context: RuleContext) => RuleVisitors;
}

export interface RulePlugin {
  meta: { name: string };
  rules: Record<string, Rule>;
}

// --- CSS Analysis ---

export interface CssColorPair {
  foreground: string;
  background: string;
  filePath: string;
  line: number;
  column: number;
  selector: string;
  contrastRatio?: number;
}

export interface CssTokenDefinition {
  name: string;
  value: string;
  filePath: string;
  line: number;
}

// --- CLI Output ---

export interface JsonOutput {
  score: {
    value: number;
    label: string;
  };
  project: {
    name: string;
    framework: string;
    cssApproach: string;
    uiLibrary: string;
  };
  summary: {
    errors: number;
    warnings: number;
    categories: Record<string, number>;
  };
  diagnostics: Diagnostic[];
}
