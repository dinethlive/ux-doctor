# Typography — Fix Guide

## Rules
- `typography/base-font-size` (warning) — base font below 16px
- `typography/line-height` (warning) — line-height below 1.5
- `typography/fixed-font-size` (warning) — px units instead of rem
- `typography/heading-hierarchy` (error) — heading sizes not descending

## WCAG Criteria
- 1.4.4 Resize Text — AA, text scales to 200% without loss
- 1.4.12 Text Spacing — AA, adjustable line-height, spacing

## How to Fix

### Base font size
```css
/* BEFORE */
body { font-size: 14px; }

/* AFTER */
body { font-size: 1rem; } /* 16px default, scales with user preference */
```

### Replace px with rem
```css
/* BEFORE — won't scale with browser zoom */
h1 { font-size: 32px; }
p { font-size: 14px; }

/* AFTER — scales with user zoom setting */
h1 { font-size: 2rem; }
p { font-size: 0.875rem; }
```

### Line height
```css
/* BEFORE — too tight for readability */
p { line-height: 1.2; }

/* AFTER — WCAG recommends 1.5+ for body text */
p { line-height: 1.5; }
```

### Heading hierarchy
```css
/* Ensure sizes descend: h1 > h2 > h3 > h4 */
h1 { font-size: 2.25rem; }    /* 36px */
h2 { font-size: 1.875rem; }   /* 30px */
h3 { font-size: 1.5rem; }     /* 24px */
h4 { font-size: 1.25rem; }    /* 20px */
```
