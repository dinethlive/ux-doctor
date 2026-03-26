# Media — Fix Guide

## Rules
- `jsx-a11y/alt-text` (error) — img missing alt attribute
- `media/decorative-alt` (warning) — decorative image without role="presentation"
- `media/svg-accessible` (warning) — SVG missing accessible name
- `jsx-a11y/media-has-caption` (error) — video without captions track
- `media/no-autoplay` (warning) — autoplay without muted

## WCAG Criteria
- 1.1.1 Non-text Content — A, all images have text alternatives
- 1.2.2 Captions — A, video has captions
- 1.4.2 Audio Control — A, auto-playing audio can be paused

## How to Fix

### Add alt text to images
```jsx
{/* BEFORE */}
<img src="/hero.jpg" />

{/* AFTER — meaningful alt for informative images */}
<img src="/hero.jpg" alt="Team collaborating around a whiteboard" />

{/* AFTER — empty alt for decorative images */}
<img src="/divider.svg" alt="" role="presentation" />
```

### Make SVGs accessible
```jsx
{/* BEFORE */}
<svg viewBox="0 0 24 24"><path d="..." /></svg>

{/* AFTER — option 1: aria-label */}
<svg viewBox="0 0 24 24" aria-label="Search icon" role="img">
  <path d="..." />
</svg>

{/* AFTER — option 2: title element */}
<svg viewBox="0 0 24 24" role="img">
  <title>Search icon</title>
  <path d="..." />
</svg>

{/* AFTER — decorative SVG, hide from assistive tech */}
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="..." /></svg>
```

### Add video captions
```jsx
{/* BEFORE */}
<video src="/demo.mp4" controls />

{/* AFTER */}
<video src="/demo.mp4" controls>
  <track kind="captions" src="/demo.vtt" srcLang="en" label="English" default />
</video>
```

### Fix autoplay
```jsx
{/* BEFORE — autoplays with sound */}
<video autoPlay src="/bg.mp4" />

{/* AFTER — muted autoplay is acceptable */}
<video autoPlay muted src="/bg.mp4" />
```
