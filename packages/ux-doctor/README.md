# UX Doctor

A CLI tool that scans codebases for UX/UI accessibility and design quality issues, outputting structured diagnostics with exact file paths and line numbers so AI coding agents (Claude Code, Cursor, Codex, etc.) know precisely where to go and what to fix.

## Quick Start

```bash
npx ux-doctor@latest . --verbose
```

## How It Works

1. **Detects** your project (framework, CSS approach, UI library)
2. **Runs analysis passes** in parallel:
   - **Source Lint** — AST-based checks on JSX/TSX (ARIA, semantic HTML, keyboard, forms, media)
   - **CSS Analysis** — Static analysis of CSS/SCSS/Tailwind (contrast, typography, spacing, focus, motion)
   - **Runtime Audit** — Optional Playwright + axe-core on a running URL
3. **Outputs diagnostics** with exact file paths, line numbers, WCAG criteria, and fix suggestions
4. **Scores** your project 0-100

## Usage

```bash
# Full static scan with file details
npx ux-doctor@latest . --verbose

# JSON output for AI agents
npx ux-doctor@latest . --json > report.json

# Score only
npx ux-doctor@latest . --score

# Only files changed vs main
npx ux-doctor@latest . --verbose --diff main

# Skip specific passes
npx ux-doctor@latest . --no-source-lint
npx ux-doctor@latest . --no-css-analysis
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--verbose` | Show file details per rule |
| `--json` | Output diagnostics as JSON |
| `--score` | Output only the score |
| `--diff [base]` | Scan only files changed vs base branch |
| `--no-source-lint` | Skip source code linting |
| `--no-css-analysis` | Skip CSS/token analysis |
| `--url <url>` | Enable runtime audit (requires Playwright) |
| `--wcag-level <level>` | Target WCAG level: A, AA, AAA (default: AA) |
| `--install-skill` | Install skill for AI agents |

## What It Checks

### Source Lint (AST-based)
- **Media** — Missing alt text, SVG accessibility, video captions
- **ARIA** — Invalid roles, missing required props, redundant roles, hidden focusable
- **Keyboard** — Click without key handler, positive tabindex, missing focus management
- **Forms** — Missing labels, autocomplete, error identification
- **Semantic Structure** — Page language, heading content, static element interactions

### CSS Analysis (Static)
- **Contrast** — Text/background color ratios, placeholder contrast, focus ring contrast
- **Typography** — Base font size, line height, heading hierarchy, fixed px units
- **Touch Targets** — Minimum 24px, recommended 44px interactive targets
- **Focus Indicators** — outline:none detection, :focus vs :focus-visible
- **Motion** — Missing prefers-reduced-motion, transition:all, permanent will-change
- **Color System** — Hardcoded colors vs tokens, dark mode coverage

## Configuration

Create `ux-doctor.config.json` in your project root:

```json
{
  "wcagLevel": "AA",
  "ignore": {
    "rules": ["typography/max-line-length"],
    "files": ["src/generated/**"],
    "categories": ["Color System"]
  }
}
```

Or add an `"uxDoctor"` key in `package.json`.

## Programmatic API

```typescript
import { diagnose } from "ux-doctor/api";

const result = await diagnose("./my-project", {
  sourceLint: true,
  cssAnalysis: true,
});

console.log(result.scoreResult);  // { score: 72, label: "Needs work" }
console.log(result.diagnostics);  // Diagnostic[]
```

## AI Agent Integration

Install the skill for your AI coding agent:

```bash
npx ux-doctor@latest --install-skill
```

Supports: Claude Code, Cursor, Amp Code, Codex, Gemini CLI, OpenCode.

## License

MIT
