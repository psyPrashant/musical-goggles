## Requirements

### Requirement: Psybergate orange accent colour
The system SHALL use Psybergate orange (`#f26522`) as the primary accent colour for all interactive elements — buttons, active nav items, focus indicators, user avatar borders, and highlights — in both dark and light themes. Hover variants SHALL provide sufficient contrast (lighter tint in dark mode, darker tint in light mode).

#### Scenario: Dark theme accent colour
- **WHEN** the app is displayed in dark mode
- **THEN** all elements using `var(--accent)` render in `#f26522` (Psybergate orange)

#### Scenario: Light theme accent colour
- **WHEN** the app is displayed in light mode
- **THEN** all elements using `var(--accent)` render in `#f26522` (Psybergate orange)

#### Scenario: No hardcoded non-accent blues
- **WHEN** the assessment form is displayed
- **THEN** the primary button and back-link use `var(--accent)` rather than a hardcoded blue

### Requirement: Psybergate logo in sidebar
The sidebar SHALL display the official Psybergate logo image. The white variant (`psybergate-wht-footer.png`) SHALL be used when the app is in dark mode; the primary colour variant (`psybergate-60.png`) SHALL be used in light mode. The logo SHALL have appropriate height (≈28 px) and preserve its aspect ratio.

#### Scenario: Dark mode logo
- **WHEN** the app is in dark mode
- **THEN** the sidebar logo shows the white Psybergate logo image

#### Scenario: Light mode logo
- **WHEN** the app is in light mode
- **THEN** the sidebar logo shows the primary (coloured) Psybergate logo image

#### Scenario: Logo alt text
- **WHEN** the logo image fails to load
- **THEN** the alt text "Psybergate" is displayed
