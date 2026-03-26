# Semantic Structure — Fix Guide

## Rules
- `jsx-a11y/html-has-lang` (error) — html missing lang attribute
- `jsx-a11y/heading-has-content` (error) — empty heading
- `semantic/no-div-soup` (warning) — deeply nested divs (5+ levels)
- `jsx-a11y/no-redundant-roles` (warning) — redundant ARIA role
- `jsx-a11y/prefer-tag-over-role` (warning) — use semantic tag instead of role

## WCAG Criteria
- 1.3.1 Info and Relationships — A, structure conveyed through markup
- 2.4.1 Bypass Blocks — A, skip navigation
- 2.4.2 Page Titled — A, descriptive page title
- 3.1.1 Language of Page — A, lang attribute on html

## How to Fix

### Add lang to html
```jsx
{/* BEFORE */}
<html><head>...</head></html>

{/* AFTER */}
<html lang="en"><head>...</head></html>
```

### Replace div soup with semantic elements
```jsx
{/* BEFORE — screen readers can't navigate this */}
<div>
  <div>
    <div>Logo</div>
    <div>Nav links</div>
  </div>
  <div>
    <div>Page content</div>
  </div>
  <div>Footer</div>
</div>

{/* AFTER — screen readers can jump between landmarks */}
<header>
  <nav>
    <div>Logo</div>
    <ul>Nav links</ul>
  </nav>
</header>
<main>
  <article>Page content</article>
</main>
<footer>Footer</footer>
```

### Use semantic tags instead of role
```jsx
{/* BEFORE — redundant */}
<nav role="navigation">...</nav>
<button role="button">Click</button>

{/* AFTER — semantic element implies the role */}
<nav>...</nav>
<button>Click</button>
```

### Add skip navigation
```jsx
{/* Add as first child of body */}
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
{/* ... header and nav ... */}
<main id="main-content">...</main>
```
