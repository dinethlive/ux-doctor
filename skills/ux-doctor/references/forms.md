# Forms — Fix Guide

## Rules
- `jsx-a11y/label-has-associated-control` / `forms/label-association` (error) — input without label
- `forms/autocomplete` (warning) — personal data input missing autocomplete
- `forms/error-identification` (warning) — aria-invalid without error message
- `forms/required-indicator` (warning) — required without aria-required

## WCAG Criteria
- 1.3.1 Info and Relationships — A, labels programmatically associated
- 1.3.5 Identify Input Purpose — AA, autocomplete for personal data
- 3.3.1 Error Identification — A, errors described in text
- 3.3.2 Labels or Instructions — A, required fields indicated

## How to Fix

### Associate label with input
```jsx
{/* BEFORE — input has no label */}
<input type="email" name="email" />

{/* AFTER — option 1: wrapping label */}
<label>
  Email address
  <input type="email" name="email" />
</label>

{/* AFTER — option 2: htmlFor + id */}
<label htmlFor="email">Email address</label>
<input id="email" type="email" name="email" />

{/* AFTER — option 3: aria-label (visually hidden label) */}
<input type="email" name="email" aria-label="Email address" />
```

### Add autocomplete for personal data
```jsx
{/* BEFORE */}
<input type="email" name="email" />

{/* AFTER */}
<input type="email" name="email" autoComplete="email" />
```

Common autocomplete values: `name`, `email`, `tel`, `address-line1`, `postal-code`, `country`, `username`, `new-password`, `current-password`, `cc-number`

### Error identification
```jsx
{/* BEFORE — error shown but not announced */}
<input aria-invalid="true" />
<span>Email is required</span>

{/* AFTER — error programmatically linked */}
<input aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" role="alert">Email is required</span>
```

### Required field
```jsx
{/* BEFORE */}
<input required />

{/* AFTER — both HTML and ARIA for max compatibility */}
<input required aria-required="true" />
```
