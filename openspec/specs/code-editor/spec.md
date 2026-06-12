# code-editor Specification

## Purpose

An in-browser Monaco code editor for CODE_SUBMISSION questions during assessment taking — Java syntax highlighting, theme-aware, lazily loaded with a textarea fallback, prefilled starter template, and integration with the existing answer autosave flow.

## Requirements

### Requirement: Code questions render in a Monaco editor
The assessment-taking UI SHALL render `CODE_SUBMISSION` questions (both top-level and inside GROUP questions) in a Monaco code editor with Java syntax highlighting and line numbers, replacing the plain textarea. The editor SHALL display the question's `languageHint` when present.

#### Scenario: Top-level code question shows the editor
- **WHEN** a candidate navigates to a top-level `CODE_SUBMISSION` question
- **THEN** a Monaco editor with Java syntax highlighting is displayed instead of a plain textarea

#### Scenario: Code sub-question inside a GROUP shows the editor
- **WHEN** a candidate views a GROUP question containing a `CODE_SUBMISSION` sub-question
- **THEN** the sub-question renders the same Monaco editor

### Requirement: Monaco loads lazily and never blocks the candidate
Monaco assets SHALL be self-hosted (served from the application, no CDN) and SHALL load only when a `CODE_SUBMISSION` question is rendered — assessments without code questions MUST NOT load any Monaco assets. If the editor fails to load, the UI SHALL fall back to a plain textarea wired to the same answer-change handling so the candidate can still answer.

#### Scenario: No code questions means no Monaco assets
- **WHEN** a candidate takes an assessment containing no `CODE_SUBMISSION` questions
- **THEN** no requests for Monaco assets (`/monaco/*`) are made

#### Scenario: Editor load failure falls back to textarea
- **WHEN** the Monaco loader fails (e.g., assets unreachable)
- **THEN** a plain textarea is rendered and the candidate's typing is still captured and autosaved

### Requirement: Editor integrates with existing answer autosave
Edits in the code editor SHALL flow through the existing answer-change path (`setAnswer`) so that code answers are debounced and autosaved to `PUT /api/take/answers` exactly as textarea answers were, and previously saved code SHALL be restored into the editor when the candidate returns to the question.

#### Scenario: Typing code triggers autosave
- **WHEN** a candidate edits code and pauses typing
- **THEN** the answer is autosaved via `PUT /api/take/answers` with the editor content as `textContent` after the existing debounce interval

#### Scenario: Saved code is restored on navigation
- **WHEN** a candidate navigates away from a code question and returns
- **THEN** the editor shows the previously saved code

### Requirement: Empty code answers are prefilled with a starter template
When a `CODE_SUBMISSION` answer is empty, the editor SHALL display a Java starter template declaring `public class Main` with a `main` method. The untouched template MUST NOT be autosaved and MUST NOT cause the question to count as answered; only a real edit by the candidate triggers answer handling.

#### Scenario: Starter template shown for unanswered question
- **WHEN** a candidate opens a code question they have not answered
- **THEN** the editor is prefilled with the `public class Main` starter template and the question still counts as unanswered

#### Scenario: Untouched template is not saved
- **WHEN** a candidate views the starter template without editing and navigates away
- **THEN** no autosave request is sent for that question

### Requirement: Editor follows the application theme
The code editor SHALL follow the application's dark/light theme, switching between Monaco's dark and light themes when the candidate toggles the theme.

#### Scenario: Theme toggle switches editor theme
- **WHEN** the candidate toggles the app from light to dark mode while a code editor is visible
- **THEN** the editor switches to the dark theme without losing content
