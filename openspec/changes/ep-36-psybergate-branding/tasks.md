## 1. Accent Colour

- [ ] 1.1 Update `--accent`, `--accent-hover`, `--accent-subtle` in `:root` (dark theme) in `styles.css` to Psybergate orange
- [ ] 1.2 Update `--accent`, `--accent-hover`, `--accent-subtle` in `:root.light` (light theme) in `styles.css` to Psybergate orange

## 2. Sidebar Logo

- [ ] 2.1 Replace inline SVG `.logo-mark` in `shell.component.ts` with `<img [src]="...">` using theme-aware Psybergate logo URLs
- [ ] 2.2 Update shell component CSS: replace `.logo-mark` styles with `.logo-img` styles (height 28px, auto width, contain)

## 3. Hardcoded Colour Cleanup

- [ ] 3.1 Replace hardcoded `#2563eb` in `assessment-form.component.ts` (`.btn-link` and `.btn-primary`) with `var(--accent)`

## 4. Verification

- [ ] 4.1 Run `npx tsc --noEmit` — no type errors
- [ ] 4.2 Start dev server and visually verify: dashboard, login, assessment builder, candidate list, flagged page, candidate assessment taking view
- [ ] 4.3 Toggle dark/light mode — confirm orange and logo render correctly in both themes
