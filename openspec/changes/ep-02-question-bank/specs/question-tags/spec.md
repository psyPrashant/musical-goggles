## ADDED Requirements

### Requirement: Questions can be tagged with free-form labels
The system SHALL allow one or more tags to be associated with a question at creation time or via update. Tags are free-form strings (e.g., "Java", "Algorithms", "Senior"). Tag names SHALL be stored lowercase and treated case-insensitively. A tag that does not yet exist SHALL be created automatically when first used.

#### Scenario: Create question with tags
- **WHEN** an Admin or Recruiter creates a question with `tags: ["Java", "OOP"]`
- **THEN** the question is persisted with those tags, and the tags are stored as lowercase (`"java"`, `"oop"`) in the `tags` table

#### Scenario: Reusing an existing tag does not create a duplicate
- **WHEN** two questions are created with the same tag name (any casing)
- **THEN** only one `tag` record exists for that name

#### Scenario: Question with no tags is valid
- **WHEN** a question is created without specifying any tags
- **THEN** the question is persisted successfully with an empty tag list

### Requirement: The question list can be filtered by tag
The `GET /api/questions?tag={tagName}` endpoint SHALL return only questions associated with the specified tag. The filter SHALL be case-insensitive.

#### Scenario: Filter returns only tagged questions
- **WHEN** an Admin or Recruiter calls `GET /api/questions?tag=java`
- **THEN** only questions tagged with "java" (any casing) are returned

#### Scenario: Filter with non-existent tag returns empty list
- **WHEN** an Admin or Recruiter calls `GET /api/questions?tag=nonexistent`
- **THEN** the response is HTTP 200 with an empty array (not 404)

### Requirement: All existing tags can be listed for autocomplete
The system SHALL expose `GET /api/tags` returning an alphabetically sorted list of all tag names currently in use. This supports autocomplete in the question creation/edit form.

#### Scenario: Tag list returns all in-use tags
- **WHEN** an Admin or Recruiter calls `GET /api/tags`
- **THEN** the response includes every unique tag name that is associated with at least one question

#### Scenario: Deleting all questions with a tag removes the tag from the list
- **WHEN** all questions with a specific tag are deleted
- **THEN** that tag no longer appears in `GET /api/tags` (orphaned tags are cleaned up)
