# Contrast — Fix Guide

## Rules
- `contrast/text-color-ratio` (error) — text/bg below 4.5:1 (normal) or 3:1 (large text)
- `contrast/tailwind-class-pair` (error) — Tailwind text-*/bg-* pair below 4.5:1
- `contrast/focus-ring-ratio` (error) — focus indicator below 3:1
- `contrast/placeholder-ratio` (warning) — placeholder text too low
- `contrast/inherited-color-ratio` (warning) — text color vs page background

## WCAG Criteria
- 1.4.3 Contrast (Minimum) — AA, 4.5:1 normal text, 3:1 large text (18px+ or 14px+ bold)
- 1.4.11 Non-text Contrast — AA, 3:1 for UI components and borders

## How to Fix

### CSS color pairs
```css
/* BEFORE — ratio 2.5:1 */
.card { color: #9ca3af; background: #ffffff; }

/* AFTER — ratio 4.8:1 */
.card { color: #6b7280; background: #ffffff; }
```

### Tailwind class pairs
```jsx
{/* BEFORE — text-gray-400 on bg-white = 2.5:1 */}
<p className="text-gray-400 bg-white">Low contrast</p>

{/* AFTER — text-gray-600 on bg-white = 5.0:1 */}
<p className="text-gray-600 bg-white">Good contrast</p>
```

### Focus ring contrast
```css
/* BEFORE — light ring on white */
button:focus { outline: 2px solid #cccccc; }

/* AFTER — visible ring */
button:focus-visible { outline: 2px solid #2563eb; }
```

### Using design tokens
```css
/* BEFORE — hardcoded, hard to maintain */
.text { color: #6b7280; }

/* AFTER — uses token, theme-aware */
.text { color: var(--color-text-secondary); }
```

## Common Mistakes
- Fixing contrast by making text bigger (doesn't help if ratio is very low)
- Using opacity to lighten text (reduces contrast further)
- Only fixing light mode, forgetting dark mode
- Using color alone to convey information (also violates WCAG 1.4.1)
