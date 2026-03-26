## General Rules

- MUST: Use pnpm. Use `pnpm install` to install, `pnpm run SCRIPT` to run.
- MUST: Use TypeScript interfaces over types.
- MUST: Use arrow functions over function declarations.
- MUST: Never comment unless absolutely necessary.
  - If the code is a hack, prefix with // HACK: reason for hack
- MUST: Use kebab-case for files.
- MUST: Use descriptive names for variables (avoid shorthands).
- MUST: Put all magic numbers in `constants.ts` using `SCREAMING_SNAKE_CASE` with unit suffixes (`_MS`, `_PX`, `_RATIO`).
- MUST: Put small, focused utility functions in `utils/` with one utility per file.
- MUST: Remove unused code and don't repeat yourself.
- MUST: Do not type cast ("as") unless absolutely necessary.
- MUST: Use Boolean over !!.
- MUST: Every rule must include a clear `help` string with an actionable fix suggestion.
- MUST: Every rule that maps to WCAG must include `wcagCriteria` and `wcagLevel`.
- MUST: Follow the Rule/RuleContext/RuleVisitors pattern from src/rules/types.ts for all source lint rules.
- MUST: Follow the Diagnostic interface exactly — all fields must be populated.

## Testing

Run checks always before committing:

```bash
pnpm test
pnpm typecheck
```

## Architecture

- `src/passes/` — One file per analysis pass. Each returns Diagnostic[].
- `src/rules/` — Source lint rules (ESTree visitors via oxlint plugin).
- `src/css/` — CSS analysis engine (PostCSS-based).
- `src/utils/` — Pure utility functions. One per file.
- `src/constants.ts` — All thresholds, patterns, magic numbers.
- `src/types.ts` — All interfaces. Global scope.
