## Why

The platform currently ships with a hardcoded dark theme and small action icons on the candidate page, reducing comfort for users in bright environments and making touch/click targets unnecessarily difficult to hit.

## What Changes

- Users can toggle between dark mode and light mode via a button in the sidebar; preference persists across sessions
- System colour-scheme preference (`prefers-color-scheme`) is respected as the default before any manual toggle
- Action-button icons on the candidate page (edit, invite, history, flag) are enlarged from 13×13 to 16×16 px, with CSS enforcing consistent sizing

## Capabilities

### New Capabilities

- `dark-light-mode-toggle`: Toggle between dark and light themes; preference stored in localStorage and loaded on startup; falls back to OS preference
- `candidate-page-icon-sizing`: Larger, consistently-sized SVG icons on the candidate page action buttons for improved legibility and click-target size

### Modified Capabilities

<!-- none -->

## Impact

- **FE only** — no backend or API changes
- `src/styles.css`: Add `:root.light { ... }` overrides for all 17 colour variables; update `color-scheme` on inputs
- New `src/app/core/theme/theme.service.ts`: Angular service managing theme toggle and localStorage persistence
- `src/app/layout/shell.component.ts`: Sun/moon toggle button added to sidebar user section
- `src/app/features/candidates/candidates.component.ts`: SVG `width`/`height` attributes on action icons increased; `.action-btn svg` CSS rule added for consistent sizing
