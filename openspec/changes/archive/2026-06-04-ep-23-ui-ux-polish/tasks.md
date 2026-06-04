## 1. Theme Service

- [x] 1.1 Create `src/app/core/theme/theme.service.ts` — root-provided service with `isDark` signal, reads from localStorage on init, falls back to `prefers-color-scheme`, toggles `.light` class on `document.documentElement`
- [x] 1.2 Add `toggle()` method that flips the signal, updates the DOM class, and writes to `localStorage`

## 2. Light Theme CSS

- [x] 2.1 Add `:root.light { ... }` block to `src/styles.css` with light-mode overrides for all 17 colour tokens (`--bg`, `--bg-card`, `--bg-elevated`, `--bg-hover`, `--border`, `--border-hover`, `--accent`, `--accent-hover`, `--accent-subtle`, `--text-1`, `--text-2`, `--text-3`, and the six semantic colours + their subtle variants)
- [x] 2.2 Add `html.light input, html.light textarea, html.light select { color-scheme: light; }` to override the global `color-scheme: dark` rule on native widgets

## 3. Theme Toggle Button in Sidebar

- [x] 3.1 Inject `ThemeService` into `shell.component.ts`
- [x] 3.2 Add a sun/moon toggle button in the `.sidebar-user` section (alongside the logout button), using `themeService.isDark()` to swap the SVG icon
- [x] 3.3 Add styles for the toggle button (match the existing `.logout-btn` pattern)

## 4. Candidate Page Icon Sizing

- [x] 4.1 In `candidates.component.ts`, update all action-button SVG `width` and `height` inline attributes from `13` to `16` (edit, invite, history, flag, save, cancel buttons)
- [x] 4.2 Update the "Invite Candidate" header button SVG inline attributes from `13` to `16`
- [x] 4.3 Add `.action-btn svg { width: 16px; height: 16px; flex-shrink: 0; }` to the component styles to CSS-enforce sizing

## 5. Verification

- [x] 5.1 Run `npm start` and visually verify dark→light and light→dark transitions across all pages
- [x] 5.2 Reload the page after toggling; confirm theme preference is restored from localStorage
- [x] 5.3 Clear localStorage and reload; confirm OS `prefers-color-scheme` default is applied
- [x] 5.4 Open the Candidates page; confirm all action icons render at 16 px
- [x] 5.5 Run `npm test` — no regressions
- [x] 5.6 Run `npx tsc --noEmit` — no type errors
