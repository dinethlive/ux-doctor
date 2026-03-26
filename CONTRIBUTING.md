# Contributing to UX Doctor

Thanks for your interest in contributing! Here's how to get started.

## Setup

```bash
git clone https://github.com/dinethlive/ux-doctor.git
cd ux-doctor
pnpm install
pnpm build
```

Requires **Node.js >= 20.19.0** and **pnpm**.

## Development

```bash
pnpm build          # Build all packages
pnpm test           # Run tests
pnpm typecheck      # TypeScript strict check
pnpm lint           # Oxlint
pnpm format         # Prettier
```

Run a single test file:

```bash
cd packages/ux-doctor && pnpm vitest run tests/color-math.test.ts
```

Test the CLI locally:

```bash
node packages/ux-doctor/dist/cli.js <path> --verbose
```

## Code Style

- **pnpm only** — no npm or yarn
- **TypeScript interfaces** over types
- **Arrow functions** preferred
- **kebab-case** file names
- **One utility per file** in `utils/`
- **No comments** unless `// HACK` with explanation
- **No type casts** unless unavoidable
- Magic numbers go in `constants.ts` with `SCREAMING_SNAKE_CASE` and unit suffixes (`_PX`, `_RATIO`, `_MS`)

## Diagnostics

Every `Diagnostic` must populate:

- `fixTarget` — jsx, css, tailwind, config, or html
- `fixExample` — code snippet showing the fix
- `priority` — 1 (highest) to 5 (lowest)
- `help` — specific and actionable, never generic
- `wcagCriteria` / `wcagLevel` — if the rule maps to a WCAG success criterion

## Pull Requests

1. Fork and create a feature branch
2. Make your changes
3. Ensure `pnpm build && pnpm typecheck && pnpm lint && pnpm test` all pass
4. Open a PR against `main`

## Reporting Issues

Use [GitHub Issues](https://github.com/dinethlive/ux-doctor/issues) to report bugs or request features.
