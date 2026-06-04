## Context

The frontend currently applies a single hardcoded dark theme via CSS custom properties defined in `src/styles.css :root`. All 17 colour tokens (backgrounds, text, borders, accent, semantic states) are set at root level with no alternate set. The candidate page action buttons use inline `width="13" height="13"` SVG attributes, which produces 13 px icons that are hard to see and click accurately.

No Angular Material or icon library is in use — the project relies on hand-crafted inline SVGs and plain CSS.

## Goals / Non-Goals

**Goals:**
- Add a persistent dark/light theme toggle without introducing a CSS framework or third-party dependency
- Enlarge candidate page action icons for better usability
- Respect the user's OS colour-scheme preference before any manual override

**Non-Goals:**
- Per-page or per-component theming
- Theming any pages other than the existing ones (no new pages)
- Supporting more than two themes (dark / light)
- Replacing inline SVGs with an icon library

## Decisions

### Decision: CSS class on `<html>` element, not `<body>`

Toggle a `.light` class on `document.documentElement` (the `<html>` element) rather than `<body>`. Angular renders the app inside `<body>`, and some browser-level resets (scrollbar, `color-scheme`) target `html`. Keeping the toggle on `<html>` avoids specificity fights.

**Alternative considered:** data attribute (`data-theme="light"`) — equally valid, but a plain class is simpler to write in CSS (`:root.light` vs `[data-theme="light"]`).

### Decision: Angular service owns theme state

A `ThemeService` (root-provided, `inject`-able) centralises toggle logic, localStorage read/write, and initial preference detection. Components never write to the DOM directly — they call `themeService.toggle()`.

**Alternative considered:** Handling it directly in `ShellComponent` — works for a single toggle point, but a service makes it testable and available if a second entry point is needed later.

### Decision: `prefers-color-scheme` as default, localStorage overrides

On first load, read `localStorage.getItem('theme')`. If absent, fall back to `window.matchMedia('(prefers-color-scheme: light)').matches`. This gives users a sensible default without forcing them to configure anything.

### Decision: Icon size via CSS, not just inline attributes

Update inline SVG `width`/`height` to `16` and add a `.action-btn svg { width: 16px; height: 16px; flex-shrink: 0; }` CSS rule. The CSS rule prevents future inline edits from drifting out of sync; the attribute change ensures correct rendering before CSSOM applies.

## Risks / Trade-offs

- **Light theme colour design** — light colours need careful contrast to match the existing indigo accent. Risk: poor contrast ratios. Mitigation: define light tokens with sufficient contrast (WCAG AA minimum 4.5:1 for normal text).
- **`color-scheme` on inputs** — `styles.css` currently sets `color-scheme: dark` globally on inputs, which forces browser-native widgets (date pickers, scrollbars) to dark. In light mode this must switch to `light`. Mitigation: tie it to a `html.light` selector override.
- **Existing component-scoped dark assumptions** — individual components may hard-code dark hex values instead of using tokens. These will not respond to the theme toggle. Mitigation: scope is limited to token-based changes only; any component bypassing tokens is out of scope for this epic.
