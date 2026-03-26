# Focus Indicators — Fix Guide

## Rules
- `focus/no-outline-none` (error) — outline:none without replacement focus style
- `focus/focus-visible-usage` (warning) — using :focus instead of :focus-visible

## WCAG Criteria
- 2.4.7 Focus Visible — AA, keyboard focus indicator is visible

## How to Fix

### Replace outline:none with visible focus style
```css
/* BEFORE — removes focus indicator completely */
button:focus { outline: none; }

/* AFTER — custom focus ring */
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### Tailwind approach
```jsx
{/* BEFORE — no focus indicator */}
<button className="outline-none">Click</button>

{/* AFTER — visible ring on keyboard focus only */}
<button className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
  Click
</button>
```

### Use :focus-visible instead of :focus
```css
/* BEFORE — shows focus ring on mouse click too */
button:focus { box-shadow: 0 0 0 2px #2563eb; }

/* AFTER — only shows on keyboard navigation */
button:focus-visible { box-shadow: 0 0 0 2px #2563eb; }
```

### Global focus reset (safe pattern)
```css
/* Remove default for mouse users, keep for keyboard */
:focus { outline: none; }
:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
```
