-- EP-10: Group Question Type Refactor
-- NOTE: No production data exists in question_groups / question_group_items — safe to drop.

-- 1. Widen type constraint to include GROUP
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
    CHECK (type IN ('MCQ', 'TEXT', 'CODE_SUBMISSION', 'GROUP'));

-- 2. JPA joined-inheritance sub-table for GroupQuestion
CREATE TABLE group_questions (
    id UUID NOT NULL,
    CONSTRAINT group_questions_pk PRIMARY KEY (id),
    CONSTRAINT group_questions_question_fk FOREIGN KEY (id)
        REFERENCES questions (id) ON DELETE CASCADE
);

-- 3. Ordered sub-question membership table
CREATE TABLE group_question_members (
    id                UUID        NOT NULL DEFAULT gen_random_uuid(),
    group_question_id UUID        NOT NULL,
    question_id       UUID        NOT NULL,
    display_order     INT         NOT NULL DEFAULT 0,
    CONSTRAINT group_question_members_pk          PRIMARY KEY (id),
    CONSTRAINT uq_group_question_member           UNIQUE (group_question_id, question_id),
    CONSTRAINT group_question_members_group_fk    FOREIGN KEY (group_question_id)
        REFERENCES questions (id) ON DELETE CASCADE,
    CONSTRAINT group_question_members_question_fk FOREIGN KEY (question_id)
        REFERENCES questions (id) ON DELETE CASCADE
);

-- 4. Drop old question-group tables (no data, clean removal)
DROP TABLE IF EXISTS question_group_items;
DROP TABLE IF EXISTS question_groups;
