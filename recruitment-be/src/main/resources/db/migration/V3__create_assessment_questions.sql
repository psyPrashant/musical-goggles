-- EP-03: Assessment Builder — assessment_questions join table
CREATE TABLE assessment_questions (
    id             UUID NOT NULL DEFAULT gen_random_uuid(),
    assessment_id  UUID NOT NULL REFERENCES assessments (id) ON DELETE CASCADE,
    question_id    UUID NOT NULL REFERENCES questions (id)   ON DELETE CASCADE,
    display_order  INT  NOT NULL,
    CONSTRAINT assessment_questions_pk     PRIMARY KEY (id),
    CONSTRAINT assessment_questions_unique UNIQUE (assessment_id, question_id)
);
