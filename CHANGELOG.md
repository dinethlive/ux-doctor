# Changelog

## 0.1.0

Initial release.

- CLI tool with `--verbose`, `--json`, `--score`, `--agent` output modes
- Source lint pass — AST-based JSX/TSX checks via oxlint with custom plugin (ARIA, keyboard, forms, media, semantic structure)
- CSS analysis pass — PostCSS-based static checks (contrast, typography, spacing, focus, animation, color system, responsive, Tailwind)
- Project detection — framework, CSS approach, UI library auto-discovery
- Scoring system — 0-100 based on unique rule violations
- Configuration via `ux-doctor.config.json` or `package.json`
- Programmatic API via `diagnose()`
- AI agent skill system — `--install-skill` for Claude Code, Cursor, Codex, Gemini CLI, Amp Code, OpenCode
- Diff mode — `--diff <base>` to scan only changed files
- WCAG level targeting — `--wcag-level A|AA|AAA`
