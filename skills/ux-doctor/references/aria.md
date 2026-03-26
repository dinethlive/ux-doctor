# ARIA — Fix Guide

## Rules
- `jsx-a11y/aria-role` (error) — invalid ARIA role value
- `jsx-a11y/role-has-required-aria-props` (error) — role missing required props
- `aria/no-conflicting` (error) — conflicting ARIA attributes
- `jsx-a11y/no-aria-hidden-on-focusable` (error) — aria-hidden on focusable element
- `jsx-a11y/no-redundant-roles` (warning) — redundant role on semantic element

## WCAG Criteria
- 4.1.2 Name, Role, Value — A, all UI components have accessible names and roles

## How to Fix

### Invalid role
```jsx
{/* BEFORE — not a valid ARIA role */}
<div role="card">...</div>

{/* AFTER — use a valid role, or use semantic HTML */}
<article>...</article>
{/* or if custom widget: */}
<div role="region" aria-label="Product card">...</div>
```

### Missing required ARIA props
```jsx
{/* BEFORE — checkbox role needs aria-checked */}
<div role="checkbox">Accept terms</div>

{/* AFTER */}
<div role="checkbox" aria-checked={isChecked} tabIndex={0}>
  Accept terms
</div>

{/* BETTER — use native HTML */}
<label><input type="checkbox" checked={isChecked} /> Accept terms</label>
```

### aria-hidden on focusable element
```jsx
{/* BEFORE — hidden from screen readers but still focusable */}
<button aria-hidden="true">Close</button>

{/* AFTER — option 1: remove aria-hidden */}
<button>Close</button>

{/* AFTER — option 2: if truly decorative, also remove from tab order */}
<div aria-hidden="true" tabIndex={-1}>decorative element</div>
```

## First Rule of ARIA
**Don't use ARIA if you can use a native HTML element.** Native elements have built-in roles, keyboard behavior, and focus management.

| Instead of | Use |
|-----------|-----|
| `<div role="button">` | `<button>` |
| `<div role="link">` | `<a href="...">` |
| `<div role="navigation">` | `<nav>` |
| `<div role="checkbox">` | `<input type="checkbox">` |
| `<div role="textbox">` | `<input>` or `<textarea>` |
