-- EP-06: Candidate Assessment Taking — candidate_answers table
CREATE TABLE candidate_answers (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    submission_id       UUID        NOT NULL,
    question_id         UUID        NOT NULL,
    selected_option_ids TEXT,
    text_content        TEXT,
    is_draft            BOOLEAN     NOT NULL DEFAULT TRUE,
    saved_at            TIMESTAMPTZ NOT NULL,
    CONSTRAINT candidate_answers_pk                    PRIMARY KEY (id),
    CONSTRAINT uq_candidate_answer_submission_question UNIQUE (submission_id, question_id),
    CONSTRAINT candidate_answers_submission_fk         FOREIGN KEY (submission_id)
        REFERENCES candidate_submissions (id) ON DELETE CASCADE
);
