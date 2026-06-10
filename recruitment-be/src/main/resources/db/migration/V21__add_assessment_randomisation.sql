-- EP-33: Add randomise_questions flag and per-type quota table to assessments

ALTER TABLE assessments
    ADD COLUMN randomise_questions BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE assessment_randomisation_quotas (
    id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    assessment_id   UUID         NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_type   VARCHAR(50)  NOT NULL,
    count           INT          NOT NULL CHECK (count >= 0),
    PRIMARY KEY (id)
);
