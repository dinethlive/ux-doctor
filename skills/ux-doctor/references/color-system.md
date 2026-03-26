# Color System — Fix Guide

## Rules
- `color/hardcoded-values` (warning) — hex/rgb instead of design tokens
- `color/dark-mode-coverage` (warning) — light tokens without dark equivalents

## How to Fix

### Replace hardcoded colors with tokens
```css
/* BEFORE */
.card { color: #6b7280; background: #f9fafb; }

/* AFTER */
.card { color: var(--color-text-secondary); background: var(--color-surface); }
```

### Add dark mode tokens
```css
:root {
  --color-text: #111827;
  --color-surface: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f9fafb;
    --color-surface: #111827;
  }
}
```

### Tailwind dark mode
```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  ...
</div>
```
