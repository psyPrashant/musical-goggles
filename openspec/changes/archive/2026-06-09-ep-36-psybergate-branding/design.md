## Context

The frontend uses a single CSS custom-property system (`--accent`, `--accent-hover`, `--accent-subtle`) defined in `styles.css` for both dark and light themes. All interactive elements — buttons, active nav items, focus rings, user avatars — reference these variables. The sidebar logo is an inline SVG geometric mark hardcoded in `shell.component.ts`. Two additional hardcoded blue values exist in `assessment-form.component.ts`.

## Goals / Non-Goals

**Goals:**
- Replace `--accent` family variables centrally so every accent-coloured element switches to orange automatically.
- Replace the placeholder sidebar logo with the official Psybergate image, theme-aware (white variant for dark, colour variant for light).
- Remove the two hardcoded `#2563eb` values in `assessment-form.component.ts`.

**Non-Goals:**
- Downloading/hosting logo assets locally (remote CDN URLs from psybergate.co.za are used directly).
- Changing any structural layout, typography, or non-accent colours.
- Touching the candidate-facing assessment-taking views beyond what is covered by `--accent`.

## Decisions

**Centralised CSS variables only**  
All colour changes are made in `styles.css` `:root` and `:root.light` blocks. No component-level overrides. This was the existing pattern and keeps future rebrands to a single-file edit.

**Remote logo URLs, not local assets**  
The official logo images are served from `psybergate.co.za`. Fetching them at render time avoids adding binary assets to the repo. Risk: external dependency on CDN uptime — acceptable for an internal tool.

**Theme-aware `<img>` with `[src]` binding**  
`shell.component.ts` already has `theme.isDark()` available. A single `<img [src]="...">` with a ternary expression is the minimal change; no new service or directive needed.

## Risks / Trade-offs

- [Logo CDN unavailable] → white box appears. Mitigation: add `alt="Psybergate"` and keep the `.logo-text` brand label alongside the image so the name is always visible.
- [Exact orange hex unverified from live site] → visually close but may differ from design team's spec. Mitigation: `#f26522` is the standard Psybergate brand orange; confirm with design team before final sign-off.

## Migration Plan

No server-side or database changes. The change is purely frontend CSS and template. Deploy by building and serving the frontend as normal. Rollback: revert the three changed files.
