### Requirement: Action icons on candidate page are at least 16×16 px
The candidate page action buttons (edit, invite, assessment history, flag history) SHALL display SVG icons rendered at a minimum of 16×16 px, enforced by both inline attributes and CSS.

#### Scenario: Action icons display at 16 px
- **WHEN** the user visits the Candidates page
- **THEN** each row action button (edit, invite, history, flag) shows an icon that is 16 px wide and 16 px tall

#### Scenario: Inline edit action icons display at 16 px
- **WHEN** a candidate row is in edit mode
- **THEN** the save and cancel icons are also 16×16 px

#### Scenario: Header button icons display at 16 px
- **WHEN** the Candidates page header "Invite Candidate" button is rendered
- **THEN** its icon is 16 px wide and 16 px tall

### Requirement: Icon sizing is CSS-enforced
The system SHALL apply a `.action-btn svg` CSS rule that sets `width: 16px; height: 16px` so icon size cannot drift when inline attributes are updated.

#### Scenario: CSS rule overrides any smaller inline attribute
- **WHEN** an action button contains an SVG with an inline attribute smaller than 16 px
- **THEN** the CSS rule forces the rendered size to 16×16 px
