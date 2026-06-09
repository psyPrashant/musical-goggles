## Why

The recruitment platform currently uses a generic indigo (`#6366f1`) colour palette and a placeholder geometric logo. This makes the app look like a demo rather than a Psybergate product. Replacing these with Psybergate's official orange brand colours and logo establishes brand identity and professionalism.

## What Changes

- Replace the CSS `--accent` custom property (and related hover/subtle variants) in both dark and light themes with Psybergate orange (`#f26522`).
- Replace the inline SVG geometric logo mark in the sidebar with the official Psybergate logo image (white variant for dark backgrounds, primary variant for light backgrounds).
- Replace two hardcoded blue (`#2563eb`) colour values in `assessment-form.component.ts` with `var(--accent)` so they track the centralised brand colour.

## Capabilities

### New Capabilities

- `psybergate-branding`: Psybergate orange colour palette and official logo applied to the frontend — accent colour centralised in CSS custom properties, logo rendered via `<img>` with theme-aware src.

### Modified Capabilities

<!-- none — no existing spec-level behaviour changes -->

## Impact

- `recruitment-fe/src/styles.css` — `--accent`, `--accent-hover`, `--accent-subtle` in `:root` (dark) and `:root.light`
- `recruitment-fe/src/app/layout/shell.component.ts` — logo markup and CSS
- `recruitment-fe/src/app/features/assessments/assessment-form.component.ts` — two hardcoded `#2563eb` values
