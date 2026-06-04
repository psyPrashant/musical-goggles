### Requirement: Theme toggle button visible in sidebar
The shell sidebar SHALL display a sun/moon icon button that allows the user to switch between dark and light mode at any time.

#### Scenario: Toggle button is always visible
- **WHEN** any authenticated page is loaded
- **THEN** the theme toggle button is visible in the sidebar user section

#### Scenario: Icon reflects current theme
- **WHEN** the application is in dark mode
- **THEN** the toggle button displays a sun icon (indicating "switch to light")
- **WHEN** the application is in light mode
- **THEN** the toggle button displays a moon icon (indicating "switch to dark")

### Requirement: Toggling switches the active theme
The system SHALL switch the active theme between dark and light when the toggle button is clicked.

#### Scenario: Switch from dark to light
- **WHEN** the user clicks the toggle button while in dark mode
- **THEN** the UI transitions to the light colour scheme

#### Scenario: Switch from light to dark
- **WHEN** the user clicks the toggle button while in light mode
- **THEN** the UI transitions to the dark colour scheme

### Requirement: Theme preference persists across sessions
The system SHALL save the user's chosen theme to localStorage so it is restored on the next visit.

#### Scenario: Preference is saved on toggle
- **WHEN** the user toggles the theme
- **THEN** the preference is written to `localStorage` under the key `theme`

#### Scenario: Preference is restored on reload
- **WHEN** the user reloads the page
- **THEN** the previously saved theme is applied before any content renders

### Requirement: OS colour-scheme preference used as default
The system SHALL default to the OS colour-scheme preference (`prefers-color-scheme`) when no saved preference exists in localStorage.

#### Scenario: No saved preference — OS is light
- **WHEN** no `theme` key exists in localStorage
- **AND** `prefers-color-scheme` is `light`
- **THEN** the application starts in light mode

#### Scenario: No saved preference — OS is dark
- **WHEN** no `theme` key exists in localStorage
- **AND** `prefers-color-scheme` is `dark` or not set
- **THEN** the application starts in dark mode

### Requirement: Light theme provides readable colour scheme
The system SHALL provide a complete set of light-mode colour tokens that maintain WCAG AA contrast ratios.

#### Scenario: Light mode renders all pages
- **WHEN** light mode is active
- **THEN** all pages (dashboard, candidates, assessments, questions, results, flagged) render with legible text and visible UI elements

#### Scenario: Input native widgets use light colour scheme
- **WHEN** light mode is active
- **THEN** browser-native input widgets (date pickers, select dropdowns, scrollbars) render in light style
