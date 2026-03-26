# Keyboard — Fix Guide

## Rules
- `jsx-a11y/click-events-have-key-events` (error) — onClick without keyboard handler
- `jsx-a11y/interactive-supports-focus` (error) — interactive widget not focusable
- `jsx-a11y/no-noninteractive-tabindex` (warning) — tabIndex on non-interactive element
- `jsx-a11y/tabindex-no-positive` (warning) — tabIndex > 0 disrupts tab order
- `jsx-a11y/no-static-element-interactions` (warning) — div with click handler, no role

## WCAG Criteria
- 2.1.1 Keyboard — A, all functionality via keyboard
- 2.4.3 Focus Order — A, logical tab sequence
- 2.1.2 No Keyboard Trap — A, user can leave any component

## How to Fix

### Replace clickable div with button
```jsx
{/* BEFORE — div with onClick, no keyboard access */}
<div onClick={handleClick}>Click me</div>

{/* AFTER — semantic button, keyboard accessible by default */}
<button onClick={handleClick}>Click me</button>
```

### If you must use a div, add role + keyboard + focus
```jsx
{/* BEFORE */}
<div onClick={handleClick}>Custom widget</div>

{/* AFTER */}
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
>
  Custom widget
</div>
```

### Fix positive tabIndex
```jsx
{/* BEFORE — disrupts natural tab order */}
<input tabIndex={5} />

{/* AFTER — follows DOM order */}
<input tabIndex={0} />
```

### Dialog escape handler
```jsx
{/* BEFORE — no way to close via keyboard */}
<div role="dialog">...</div>

{/* AFTER — Escape closes dialog */}
<div
  role="dialog"
  aria-modal="true"
  onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
>
  ...
</div>
```

## Common Mistakes
- Adding `onKeyPress` instead of `onKeyDown` (onKeyPress is deprecated)
- Only handling Enter, forgetting Space for buttons
- Using tabIndex={-1} when element should be focusable (use 0)
- Forgetting to add role when adding keyboard handlers to divs
