# Touch Targets — Fix Guide

## Rules
- `touch/minimum-size` (error) — interactive element below 24x24px
- `touch/recommended-size` (warning) — interactive element below 44x44px

## WCAG Criteria
- 2.5.8 Target Size (Minimum) — AA, at least 24x24px
- 2.5.5 Target Size (Enhanced) — AAA, at least 44x44px

## How to Fix

```css
/* BEFORE — too small to tap reliably */
.icon-button { width: 20px; height: 20px; }

/* AFTER — meets minimum */
.icon-button { min-width: 44px; min-height: 44px; }
```

### Tailwind
```jsx
{/* BEFORE */}
<button className="w-5 h-5">X</button>

{/* AFTER */}
<button className="min-w-[44px] min-h-[44px] flex items-center justify-center">X</button>
```
