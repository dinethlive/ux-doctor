# UX Doctor

A CLI that scans your codebase for UX, accessibility, and design quality issues. It outputs structured diagnostics with exact file paths, line numbers, WCAG criteria, and fix suggestions.

Built for AI coding agents (Claude Code, Cursor, Codex, Gemini CLI, Amp Code, OpenCode) and human developers alike.

<video src="https://raw.githubusercontent.com/dinethlive/ux-doctor/main/demo-video/out/demo.mp4" controls width="100%"></video>

## Quick Start

```bash
npx ux-doctor@latest . --verbose
```

## How It Works

1. Detects your project framework, CSS approach, and UI library
2. Runs analysis passes in parallel:
   - **Source Lint** - AST-based checks on JSX/TSX via oxlint custom plugin
   - **CSS Analysis** - Static analysis of stylesheets via PostCSS
   - **Runtime Audit** - Optional browser audit via Playwright + axe-core
3. Outputs diagnostics with file paths, line numbers, and fix examples
4. Scores your project 0-100

### Supported Stacks

| Category | Detected |
|----------|----------|
| Frameworks | Next.js, Vite, CRA, Remix, Gatsby, Expo, React Native |
| CSS | Tailwind, CSS Modules, styled-components, Emotion, SCSS, Less, vanilla CSS |
| UI Libraries | shadcn, MUI, Chakra UI, Ant Design, Radix, Headless UI, Mantine |

## Usage

```bash
# Full scan with details
npx ux-doctor@latest . --verbose

# JSON output
npx ux-doctor@latest . --json > report.json

# LLM-optimized output (grouped by file, with fix examples)
npx ux-doctor@latest . --agent

# Score only
npx ux-doctor@latest . --score

# Scan only changed files
npx ux-doctor@latest . --diff main

# Skip specific passes
npx ux-doctor@latest . --no-source-lint
npx ux-doctor@latest . --no-css-analysis

# Use APCA contrast algorithm
npx ux-doctor@latest . --verbose --contrast apca
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--verbose` | Show file-level details per rule |
| `--json` | Output diagnostics as JSON |
| `--agent` | Output in LLM-optimized markdown format |
| `--score` | Output only the score |
| `--diff [base]` | Scan only files changed vs a base branch (default: main) |
| `--no-source-lint` | Skip source code linting |
| `--no-css-analysis` | Skip CSS/token analysis |
| `--url <url>` | Run a runtime audit on a live URL (requires Playwright) |
| `--wcag-level <level>` | Target WCAG level: A, AA, or AAA (default: AA) |
| `--contrast <standard>` | Contrast algorithm: wcag2 or apca (default: wcag2) |
| `--project <name>` | Select a workspace project in a monorepo |
| `-y, --yes` | Skip confirmation prompts |
| `--install-skill` | Install the ux-doctor skill for AI agents |
| `--uninstall-skill` | Remove the skill from all AI agents |
| `-v, --version` | Show version |

## What It Checks

### Source Lint (AST-based)

| Category | Examples |
|----------|----------|
| ARIA | Invalid roles, missing required props, redundant roles, hidden focusable elements |
| Forms | Missing labels, autocomplete attributes, error identification |
| Keyboard | Click without key handler, positive tabindex, missing focus management |
| Media | Missing alt text, SVG accessibility, video captions |
| Semantic Structure | Page language, heading content, div soup, skip navigation |
| Navigation | Landmark regions, heading hierarchy |
| Framework | Next.js Image alt text, React Native accessibility props, tooltip triggers |

### CSS Analysis (Static)

| Category | Examples |
|----------|----------|
| Contrast | Text/background ratios, placeholder contrast, focus ring contrast, Tailwind class pairs |
| Typography | Base font size, line height, heading hierarchy, px vs rem |
| Touch Targets | Minimum 24px sizing, recommended 44px for interactive elements |
| Focus Indicators | outline:none without replacement, :focus vs :focus-visible |
| Motion | Missing prefers-reduced-motion, transition:all, permanent will-change |
| Color System | Hardcoded colors vs design tokens, dark mode coverage |
| Responsive | Fixed widths, zoom prevention, horizontal scroll |

## AI Agent Integration

Install the ux-doctor skill so your AI coding agent can scan, interpret results, and fix issues automatically.

```bash
npx ux-doctor@latest --install-skill
```

This installs SKILL.md and 11 reference guides into each agent's skill directory:

| Agent | Install Path |
|-------|-------------|
| Claude Code | `~/.claude/skills/ux-doctor/` |
| Cursor | `~/.cursor/skills/ux-doctor/` |
| Amp Code | `~/.config/amp/skills/ux-doctor/` |
| Codex | `~/.codex/skills/ux-doctor/` |
| Gemini CLI | `~/.gemini/skills/ux-doctor/` |
| OpenCode | `~/.config/opencode/skills/ux-doctor/` |
| Project local | `.agents/ux-doctor/` |

To remove the skill from all agents:

```bash
npx ux-doctor@latest --uninstall-skill
```

### Workflow inside an AI agent

1. Run `npx ux-doctor . --agent` to scan
2. The agent reads the prioritized, file-grouped output
3. The agent applies fixes using the `fixTarget` and `fixExample` fields
4. Re-scan to verify the score improved

## Configuration

Create `ux-doctor.config.json` in your project root:

```json
{
  "wcagLevel": "AA",
  "contrastStandard": "wcag2",
  "ignore": {
    "rules": ["typography/max-line-length"],
    "files": ["src/generated/**"],
    "categories": ["Color System"]
  }
}
```

Or add an `"uxDoctor"` key in your `package.json` with the same structure.

All CLI flags can also be set in the config file: `sourceLint`, `cssAnalysis`, `runtime`, `verbose`, `diff`, `wcagLevel`, `contrastStandard`.

## Programmatic API

```typescript
import { diagnose } from "ux-doctor/api";

const result = await diagnose("./my-project", {
  sourceLint: true,
  cssAnalysis: true,
  wcagLevel: "AA",
  contrastStandard: "apca",
});

console.log(result.scoreResult);  // { score: 72, label: "Needs work" }
console.log(result.diagnostics);  // Diagnostic[]
```

Exported types: `Diagnostic`, `ScanOptions`, `ScanResult`, `ScoreResult`, `ProjectInfo`, `JsonOutput`, `UxDoctorConfig`.

## Requirements

- Node.js >= 20.19.0
- Runtime audit (`--url`) requires Playwright (installed automatically as optional dependency)

## License

MIT
