import { execFile } from "node:child_process";
import { writeFile, unlink, readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { join, resolve, extname, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import type { Diagnostic, ProjectInfo } from "../types.js";
import { createOxlintConfig } from "../oxlint-config.js";
import { log } from "../utils/logger.js";
import {
  SOURCE_FILE_EXTENSIONS,
  IGNORE_DIRECTORIES,
  WINDOWS_CMD_MAX_LENGTH,
} from "../constants.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RULE_CATEGORY_MAP: Record<string, string> = {
  "semantic/": "Semantic Structure",
  "aria/": "ARIA",
  "keyboard/": "Keyboard",
  "forms/": "Forms",
  "media/": "Media",
  "motion/": "Motion",
  "navigation/": "Navigation",
  "jsx-a11y/alt-text": "Media",
  "jsx-a11y/anchor": "Semantic Structure",
  "jsx-a11y/aria": "ARIA",
  "jsx-a11y/click-events": "Keyboard",
  "jsx-a11y/heading": "Semantic Structure",
  "jsx-a11y/html-has-lang": "Semantic Structure",
  "jsx-a11y/img": "Media",
  "jsx-a11y/interactive": "Keyboard",
  "jsx-a11y/lang": "Semantic Structure",
  "jsx-a11y/mouse-events": "Keyboard",
  "jsx-a11y/no-access-key": "Keyboard",
  "jsx-a11y/no-autofocus": "Keyboard",
  "jsx-a11y/no-distracting": "Motion",
  "jsx-a11y/no-interactive": "ARIA",
  "jsx-a11y/no-noninteractive": "Keyboard",
  "jsx-a11y/no-redundant": "ARIA",
  "jsx-a11y/prefer-tag": "Semantic Structure",
  "jsx-a11y/role": "ARIA",
  "jsx-a11y/scope": "Forms",
  "jsx-a11y/tabindex": "Keyboard",
};

export const runSourceLint = async (
  project: ProjectInfo,
  diffFiles?: string[] | null,
): Promise<Diagnostic[]> => {
  const sourceFiles = await findSourceFiles(
    project.rootDirectory,
    diffFiles,
  );

  if (sourceFiles.length === 0) {
    log.verbose("No source files found — skipping source lint");
    return [];
  }

  const pluginPath = resolvePluginPath();
  const config = createOxlintConfig(project, pluginPath);

  const configPath = join(
    tmpdir(),
    `ux-doctor-oxlintrc-${process.pid}.json`,
  );

  try {
    await writeFile(configPath, JSON.stringify(config, null, 2));

    const batches = batchFiles(sourceFiles);
    const allDiagnostics: Diagnostic[] = [];

    for (const batch of batches) {
      const diagnostics = await runOxlintBatch(
        configPath,
        batch,
        project,
      );
      allDiagnostics.push(...diagnostics);
    }

    log.verbose(`Source lint found ${allDiagnostics.length} issues`);
    return allDiagnostics;
  } catch (error) {
    log.warn(
      `Source lint failed: ${error instanceof Error ? error.message : error}`,
    );
    return [];
  } finally {
    try {
      await unlink(configPath);
    } catch {
      // cleanup
    }
  }
};

const runOxlintBatch = async (
  configPath: string,
  files: string[],
  project: ProjectInfo,
): Promise<Diagnostic[]> => {
  let oxlintBinary: string;
  try {
    oxlintBinary = resolveOxlintBinary();
  } catch {
    log.warn("oxlint binary not found — skipping source lint");
    return [];
  }

  const args = [
    oxlintBinary,
    "-c",
    configPath,
    "--format",
    "json",
    ...files,
  ];

  return new Promise((resolvePromise) => {
    execFile(
      process.execPath,
      args,
      {
        cwd: project.rootDirectory,
        maxBuffer: 50 * 1024 * 1024,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        // oxlint exits non-zero when it finds issues — that's expected
        if (stdout) {
          try {
            const diagnostics = parseOxlintOutput(stdout);
            resolvePromise(diagnostics);
            return;
          } catch {
            log.debug(`Failed to parse oxlint output: ${stderr}`);
          }
        }
        if (error && !stdout) {
          log.debug(`oxlint error: ${error.message}`);
        }
        resolvePromise([]);
      },
    );
  });
};

const parseOxlintOutput = (output: string): Diagnostic[] => {
  if (!output.trim()) return [];

  let parsed: OxlintOutput;
  try {
    parsed = JSON.parse(output);
  } catch {
    // try to extract JSON object from output
    const jsonStart = output.indexOf("{");
    const jsonEnd = output.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return [];
    parsed = JSON.parse(output.slice(jsonStart, jsonEnd + 1));
  }

  if (!parsed.diagnostics || !Array.isArray(parsed.diagnostics)) return [];

  return parsed.diagnostics.map(mapToDiagnostic);
};

interface OxlintOutput {
  diagnostics: OxlintDiagnostic[];
}

interface OxlintDiagnostic {
  message: string;
  code: string;
  severity: string;
  help?: string;
  filename?: string;
  labels?: Array<{
    span: {
      offset: number;
      length: number;
      line: number;
      column: number;
    };
  }>;
}

const mapToDiagnostic = (item: OxlintDiagnostic): Diagnostic => {
  const ruleId = extractRuleId(item.code);
  const label = item.labels?.[0];
  const category = getCategoryForRule(ruleId) as Diagnostic["category"];

  return {
    filePath: item.filename ?? "unknown",
    rule: ruleId,
    category,
    severity: item.severity === "error" ? "error" : "warning",
    message: item.message,
    help: item.help ?? getHelpForRule(ruleId),
    line: label?.span.line ?? 0,
    column: label?.span.column ?? 0,
    pass: "source",
    fixTarget: "jsx",
    fixExample: getFixExample(ruleId),
    priority: CATEGORY_PRIORITY[category] ?? 5,
  };
};

const CATEGORY_PRIORITY: Record<string, number> = {
  "Semantic Structure": 1,
  "ARIA": 1,
  "Keyboard": 2,
  "Forms": 2,
  "Media": 3,
  "Contrast": 3,
  "Focus Indicators": 3,
  "Typography": 4,
  "Motion": 4,
  "Touch Targets": 4,
  "Color System": 5,
  "Responsive": 5,
  "Navigation": 2,
  "Framework": 3,
};

const getFixExample = (ruleId: string): string | undefined => {
  const examples: Record<string, string> = {
    // built-in jsx-a11y
    "jsx-a11y/alt-text": '<img src="..." alt="Description of image" />',
    "jsx-a11y/anchor-has-content": '<a href="/page">Link text</a>',
    "jsx-a11y/anchor-is-valid": '<a href="/page"> or <button onClick={handler}>',
    "jsx-a11y/aria-props": "aria-label, aria-describedby, aria-hidden  // use valid aria-* props",
    "jsx-a11y/aria-role": 'role="button" | "link" | "dialog"  // use valid ARIA role',
    "jsx-a11y/aria-unsupported-elements": "// remove aria-* from <meta>, <script>, <style>",
    "jsx-a11y/click-events-have-key-events": "<button onClick={handler}>Text</button>",
    "jsx-a11y/heading-has-content": "<h2>Meaningful heading text</h2>",
    "jsx-a11y/html-has-lang": '<html lang="en">',
    "jsx-a11y/img-redundant-alt": 'alt="Team photo"  // remove "image of" or "picture of"',
    "jsx-a11y/interactive-supports-focus": "tabIndex={0}  // add to interactive elements",
    "jsx-a11y/lang": 'lang="en" | "fr" | "es"  // use valid BCP 47 tag',
    "jsx-a11y/mouse-events-have-key-events": "onFocus={handler} onBlur={handler}  // alongside onMouseOver/Out",
    "jsx-a11y/no-access-key": "// remove accessKey prop",
    "jsx-a11y/no-autofocus": "// remove autoFocus, manage focus via useEffect",
    "jsx-a11y/no-distracting-elements": "// remove <marquee> or <blink>",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": '// remove role="presentation" from <button>',
    "jsx-a11y/no-noninteractive-element-interactions": '<button onClick={handler}>  // or add role + tabIndex',
    "jsx-a11y/no-redundant-roles": "<nav>  // remove redundant role",
    "jsx-a11y/no-static-element-interactions": "<button onClick={handler}>  // replace div with button",
    "jsx-a11y/prefer-tag-over-role": "<button>  // instead of <div role=\"button\">",
    "jsx-a11y/role-has-required-aria-props": 'role="checkbox" aria-checked={value}',
    "jsx-a11y/scope": "<th scope=\"col\"> or <th scope=\"row\">",
    "jsx-a11y/tabindex-no-positive": "tabIndex={0}  // or tabIndex={-1}",
    "jsx-a11y/media-has-caption": '<track kind="captions" src="captions.vtt" srcLang="en" />',
    "jsx-a11y/no-aria-hidden-on-focusable": "// remove aria-hidden or add tabIndex={-1}",
    "jsx-a11y/no-noninteractive-tabindex": "// remove tabIndex from non-interactive element",
    // custom ux-doctor
    "semantic/no-div-soup": "<nav>, <main>, <section>  // replace nested divs",
    "aria/no-conflicting": '// remove aria-hidden="true" or aria-label, not both',
    "aria/hidden-focusable": "tabIndex={-1}  // or remove aria-hidden",
    "keyboard/interactive-tabindex": "tabIndex={0}  // add to custom interactive widget",
    "keyboard/focus-trap-escape": 'onKeyDown={(e) => e.key === "Escape" && onClose()}',
    "forms/label-association": '<label htmlFor="id">Label</label> <input id="id" />',
    "forms/autocomplete": 'autoComplete="email"  // or "name", "tel", "address-line1"',
    "forms/error-identification": 'aria-describedby="error-id"  // link to error message',
    "forms/required-indicator": "aria-required={true}",
    "media/decorative-alt": 'alt="" role="presentation"',
    "media/svg-accessible": '<svg aria-label="Icon description" role="img">',
    "media/video-captions": '<track kind="captions" src="captions.vtt" />',
    "media/no-autoplay": "<video autoPlay muted>  // add muted",
    "motion/prefers-reduced-motion-jsx": "// replace <marquee> with CSS animation + reduced-motion",
    "motion/no-autoplay-animation": "// add pause control for looping media",
    "navigation/duplicate-ids": '// ensure each id="..." is unique in the page',
    "framework/nextjs-image-alt": '<Image alt="Description" ... />',
    "framework/nextjs-link-accessibility": '<Link aria-label="Description">...</Link>',
    "framework/nextjs-head-metadata": "<Head><title>Page Title</title></Head>",
    "framework/rn-accessibility-label": 'accessibilityLabel="Button description"',
    "framework/rn-accessibility-role": 'accessibilityRole="button"',
    "framework/rn-image-accessibility": 'accessibilityLabel="Image description"',
    "framework/dialog-accessibility": 'aria-label="Dialog title"  // or aria-labelledby',
    "framework/icon-button-label": 'aria-label="Close"  // label for icon-only button',
  };
  return examples[ruleId];
};

const extractRuleId = (code: string): string => {
  // code format: "eslint-plugin-jsx-a11y(alt-text)" or "ux-doctor(semantic/no-div-soup)"
  const match = code.match(/\(([^)]+)\)/);
  if (match) {
    const pluginMatch = code.match(/^([^(]+)\(/);
    const plugin = pluginMatch?.[1] ?? "";
    if (plugin.includes("jsx-a11y")) {
      return `jsx-a11y/${match[1]}`;
    }
    return match[1];
  }
  return code;
};

const getCategoryForRule = (ruleId: string): string => {
  for (const [prefix, category] of Object.entries(RULE_CATEGORY_MAP)) {
    if (ruleId.includes(prefix)) return category;
  }
  return "ARIA";
};

const getHelpForRule = (ruleId: string): string => {
  const helpMap: Record<string, string> = {
    "jsx-a11y/alt-text": "Add meaningful alt text describing the image content, or alt=\"\" for decorative images",
    "jsx-a11y/anchor-has-content": "Add visible text or aria-label so screen readers can announce the link purpose",
    "jsx-a11y/anchor-is-valid": "Use a real href for navigation, or replace <a> with <button> for actions",
    "jsx-a11y/aria-props": "Check spelling of aria-* attributes. Use valid ARIA properties only",
    "jsx-a11y/aria-role": "Use a valid WAI-ARIA role value. See https://www.w3.org/TR/wai-aria/#role_definitions",
    "jsx-a11y/aria-unsupported-elements": "Remove aria-* attributes from elements that don't support them (<meta>, <script>)",
    "jsx-a11y/click-events-have-key-events": "Replace <div onClick> with <button onClick>, or add onKeyDown handler with tabIndex={0}",
    "jsx-a11y/heading-has-content": "Add visible text inside the heading element so screen readers can announce it",
    "jsx-a11y/html-has-lang": "Add lang attribute to <html> so screen readers use the correct pronunciation",
    "jsx-a11y/img-redundant-alt": "Remove 'image of', 'photo of', 'picture of' from alt text — screen readers already say 'image'",
    "jsx-a11y/interactive-supports-focus": "Add tabIndex={0} so keyboard users can focus this interactive element",
    "jsx-a11y/lang": "Use a valid BCP 47 language tag (e.g., 'en', 'fr', 'es', 'ja')",
    "jsx-a11y/mouse-events-have-key-events": "Add onFocus/onBlur handlers alongside onMouseOver/onMouseOut for keyboard users",
    "jsx-a11y/no-access-key": "Remove accessKey — key combinations conflict across browsers and assistive tech",
    "jsx-a11y/no-autofocus": "Remove autoFocus — it disorients screen reader users. Manage focus programmatically if needed",
    "jsx-a11y/no-distracting-elements": "Replace <marquee> or <blink> with CSS animations that respect prefers-reduced-motion",
    "jsx-a11y/no-interactive-element-to-noninteractive-role": "Don't override interactive elements with non-interactive roles. Use the right element instead",
    "jsx-a11y/no-noninteractive-element-interactions": "Use <button> for click actions, or add role='button' + tabIndex={0} + onKeyDown",
    "jsx-a11y/no-redundant-roles": "Remove the role attribute — this element already has that role implicitly",
    "jsx-a11y/no-static-element-interactions": "Replace <div onClick> with <button>, or add role + tabIndex + keyboard handler",
    "jsx-a11y/prefer-tag-over-role": "Use the semantic HTML element instead of a div with a role attribute",
    "jsx-a11y/role-has-required-aria-props": "Add the required ARIA properties for this role (e.g., checkbox needs aria-checked)",
    "jsx-a11y/scope": "Use scope='col' or scope='row' on <th> elements to associate headers with data cells",
    "jsx-a11y/tabindex-no-positive": "Use tabIndex={0} (natural order) or tabIndex={-1} (programmatic only). Positive values break tab order",
    "jsx-a11y/media-has-caption": "Add <track kind='captions'> inside <video> for hearing-impaired users",
    "jsx-a11y/no-aria-hidden-on-focusable": "Remove aria-hidden from focusable elements, or add tabIndex={-1} to remove from tab order",
    "jsx-a11y/no-noninteractive-tabindex": "Remove tabIndex from non-interactive elements — only interactive widgets should be focusable",
    "semantic/no-div-soup": "Replace deeply nested <div> wrappers with semantic elements: <nav>, <main>, <section>, <article>",
    "aria/no-conflicting": "Remove either aria-hidden or aria-label — an element can't be both hidden and labeled",
    "aria/hidden-focusable": "Either remove aria-hidden='true' or add tabIndex={-1} to remove from tab order",
    "keyboard/interactive-tabindex": "Add tabIndex={0} so keyboard users can focus and activate this interactive widget",
    "keyboard/focus-trap-escape": "Add onKeyDown handler that closes on Escape key — users need a way out of modals",
    "forms/label-association": "Associate a label: wrap input in <label>, use htmlFor+id, or add aria-label",
    "forms/autocomplete": "Add autoComplete attribute for personal data fields (email, name, tel, address)",
    "forms/error-identification": "Add aria-describedby pointing to the error message element so it's announced",
    "forms/required-indicator": "Add aria-required={true} alongside the required attribute for screen reader compatibility",
    "media/decorative-alt": "Add role='presentation' alongside alt='' to fully hide decorative images from screen readers",
    "media/svg-accessible": "Add aria-label and role='img' to SVG, or <title> as first child, or aria-hidden for decorative",
    "media/video-captions": "Add <track kind='captions'> with a WebVTT file for hearing-impaired users",
    "media/no-autoplay": "Add muted attribute to autoplaying media — unmuted autoplay is disruptive",
    "motion/prefers-reduced-motion-jsx": "Replace <marquee> with CSS animation that respects prefers-reduced-motion",
    "motion/no-autoplay-animation": "Provide a visible pause/stop control for looping autoplaying media",
    "navigation/duplicate-ids": "Make each id unique — duplicate IDs break ARIA references and fragment navigation",
    "framework/nextjs-image-alt": "Add alt attribute to Next.js <Image> component",
    "framework/nextjs-link-accessibility": "Add visible text or aria-label to Next.js <Link>",
    "framework/nextjs-head-metadata": "Add <title> inside Next.js <Head> for page identification",
    "framework/rn-accessibility-label": "Add accessibilityLabel to describe this touchable element for VoiceOver/TalkBack",
    "framework/rn-accessibility-role": "Add accessibilityRole='button' (or appropriate role) for assistive technology",
    "framework/rn-image-accessibility": "Add accessibilityLabel to describe the image content for screen readers",
    "framework/dialog-accessibility": "Add aria-label or aria-labelledby to give the dialog an accessible name",
    "framework/icon-button-label": "Add aria-label describing the action (e.g., 'Close', 'Search', 'Menu')",
  };

  return helpMap[ruleId] ?? `Check the ${ruleId} rule documentation for fix guidance`;
};

const resolvePluginPath = (): string => {
  // check dist/ next to this file (production), and also walk up to find package dist/
  const candidates = [
    resolve(__dirname, "ux-doctor-plugin.js"),
    resolve(__dirname, "..", "dist", "ux-doctor-plugin.js"),
    resolve(__dirname, "..", "..", "dist", "ux-doctor-plugin.js"),
  ];
  for (const candidate of candidates) {
    try {
      statSync(candidate);
      return candidate;
    } catch { /* continue */ }
  }
  return candidates[0];
};

const resolveOxlintBinary = (): string => {
  // find oxlint's Node.js entry script
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, "node_modules", "oxlint", "bin", "oxlint");
    try {
      statSync(candidate);
      return candidate;
    } catch {
      dir = dirname(dir);
    }
  }

  // fallback to .bin
  let dir2 = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir2, "node_modules", ".bin", "oxlint");
    try {
      statSync(candidate);
      return candidate;
    } catch {
      dir2 = dirname(dir2);
    }
  }

  throw new Error("oxlint binary not found");
};

const findSourceFiles = async (
  rootDirectory: string,
  diffFiles?: string[] | null,
): Promise<string[]> => {
  if (diffFiles) {
    return diffFiles
      .filter((file) =>
        SOURCE_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)),
      )
      .map((file) => join(rootDirectory, file));
  }

  const files: string[] = [];

  const walkDirectory = async (directory: string): Promise<void> => {
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (
            !IGNORE_DIRECTORIES.includes(
              entry.name as (typeof IGNORE_DIRECTORIES)[number],
            )
          ) {
            await walkDirectory(join(directory, entry.name));
          }
        } else {
          const ext = extname(entry.name);
          if (SOURCE_FILE_EXTENSIONS.includes(ext as (typeof SOURCE_FILE_EXTENSIONS)[number])) {
            files.push(join(directory, entry.name));
          }
        }
      }
    } catch {
      // can't read directory
    }
  };

  await walkDirectory(rootDirectory);
  return files;
};

const batchFiles = (files: string[]): string[][] => {
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentLength = 0;

  for (const file of files) {
    if (currentLength + file.length + 1 > WINDOWS_CMD_MAX_LENGTH) {
      batches.push(currentBatch);
      currentBatch = [];
      currentLength = 0;
    }
    currentBatch.push(file);
    currentLength += file.length + 1;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
};
