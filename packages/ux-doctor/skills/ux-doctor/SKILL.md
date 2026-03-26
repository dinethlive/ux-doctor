---
name: ux-doctor
description: Scan codebase for UX/accessibility issues and fix them. Use after UI changes, when reviewing components, or when user asks about accessibility. Outputs exact file paths and line numbers with fix instructions.
version: 1.0.0
---

# UX Doctor

Scans your codebase for UX/UI accessibility issues and tells you exactly where and how to fix them.

## When to Use

- After making UI changes (components, styles, layouts)
- When user asks to "check accessibility", "fix a11y", "improve UX"
- Before submitting PRs that touch UI code
- When reviewing components or design system

## Workflow

1. **Scan** — run ux-doctor to get diagnostics
2. **Fix** — open each file, apply the fix at the exact line
3. **Re-scan** — run again to verify score improved
4. **Repeat** — until score is acceptable (75+ is "Great")

## Commands

```bash
# Scan with agent-optimized output (RECOMMENDED for agents)
npx -y ux-doctor@latest . --agent

# Full verbose output
npx -y ux-doctor@latest . --verbose

# JSON for programmatic use
npx -y ux-doctor@latest . --json

# Only check changed files (faster in PRs)
npx -y ux-doctor@latest . --agent --diff main

# Quick score check
npx -y ux-doctor@latest . --score
```

**Always use `--agent` flag** — it groups issues by file so you fix one file at a time.

## Reading the Output

Each diagnostic has:
- **filePath** + **line** — exact location to fix
- **rule** — which check failed (e.g., `contrast/text-color-ratio`)
- **severity** — `error` (must fix) or `warning` (should fix)
- **message** — what's wrong
- **help** — how to fix it
- **fixTarget** — which file type to edit: `jsx`, `css`, `tailwind`, `config`, `html`
- **fixExample** — code snippet showing the fix
- **priority** — 1 (fix first) to 5 (fix last)

## Fix Priority Order

Fix in this order — higher priority issues often cause cascading lower-priority ones:

1. **Errors first**, then warnings
2. **Semantic Structure** — landmarks, headings (affects screen reader navigation)
3. **ARIA** — invalid roles, missing props (causes screen reader errors)
4. **Keyboard** — click handlers, focus management (blocks keyboard users entirely)
5. **Forms** — labels, autocomplete (blocks form submission for assistive tech)
6. **Media** — alt text, captions (blocks content access)
7. **Contrast** — color ratios (affects readability)
8. **Focus Indicators** — outline styles (affects keyboard navigation visibility)
9. **Typography** — font sizes, line height (affects readability)
10. **Motion** — reduced motion (affects vestibular disorders)
11. **Touch Targets** — tap sizes (affects mobile users)
12. **Color System** — design tokens, dark mode (affects maintainability)

## Fix Strategies by File Type

### When fixTarget is "jsx"
Open the JSX/TSX component file and modify the element:
- Add missing attributes (`alt`, `aria-label`, `role`, `tabIndex`)
- Add event handlers (`onKeyDown` alongside `onClick`)
- Replace `<div>` with semantic elements (`<button>`, `<nav>`, `<main>`)

### When fixTarget is "css"
Open the CSS/SCSS file and modify the declaration:
- Change color values to meet contrast ratio
- Change `outline: none` to a visible focus style
- Add `@media (prefers-reduced-motion: reduce)` query
- Replace px font sizes with rem

### When fixTarget is "tailwind"
Edit the `className` in JSX:
- Replace low-contrast text/bg class pairs (e.g., `text-gray-400` → `text-gray-600`)
- Add focus ring classes (`focus:ring-2 focus:ring-blue-500`)
- Use responsive size utilities for touch targets

### When fixTarget is "config"
Edit project config files:
- `tailwind.config.ts` for custom theme colors
- `globals.css` for CSS custom properties / design tokens
- `ux-doctor.config.json` to suppress false positives

## Categories Reference

See `references/` folder for detailed fix guides per category. Quick summary:

| Category | What it checks | Fix in |
|----------|---------------|--------|
| Contrast | Color ratios below WCAG thresholds | CSS, Tailwind classes |
| Typography | Font size < 16px, line-height < 1.5, px units | CSS |
| Semantic Structure | Missing landmarks, heading order, div soup | JSX |
| ARIA | Invalid roles, missing required props | JSX |
| Keyboard | Click without key handler, tabIndex issues | JSX |
| Forms | Missing labels, autocomplete, error association | JSX |
| Media | Missing alt text, captions, SVG labels | JSX |
| Focus Indicators | outline:none without replacement | CSS |
| Motion | Missing prefers-reduced-motion | CSS |
| Touch Targets | Interactive elements < 24px | CSS |
| Color System | Hardcoded colors, missing dark mode | CSS, config |

## Scoring

- **75-100**: Great — minor issues only
- **50-74**: Needs work — significant accessibility gaps
- **0-49**: Critical — major barriers for users with disabilities
