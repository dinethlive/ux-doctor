# Motion — Fix Guide

## Rules
- `motion/prefers-reduced-motion` (error) — animations without reduced motion query
- `motion/transition-all` (warning) — transition:all includes motion-sensitive props
- `motion/permanent-will-change` (warning) — will-change set permanently
- `motion/no-autoplay-animation` (warning) — infinite animation without pause

## WCAG Criteria
- 2.3.3 Animation from Interactions — AAA, motion can be disabled
- 2.2.2 Pause, Stop, Hide — A, moving content can be paused

## How to Fix

### Add prefers-reduced-motion query
```css
/* Add this to your global stylesheet */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Replace transition:all
```css
/* BEFORE — animates layout properties (causes motion sickness) */
.card { transition: all 0.3s ease; }

/* AFTER — only animate visual properties */
.card { transition: opacity 0.3s ease, background-color 0.3s ease; }
```

### Fix permanent will-change
```css
/* BEFORE — always active, wastes GPU memory */
.element { will-change: transform; }

/* AFTER — only during interaction */
.element:hover { will-change: transform; }
```

### Tailwind motion-safe
```jsx
{/* BEFORE — always animates */}
<div className="animate-bounce">...</div>

{/* AFTER — respects user preference */}
<div className="motion-safe:animate-bounce">...</div>
```
