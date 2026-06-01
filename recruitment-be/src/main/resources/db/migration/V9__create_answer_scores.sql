-- EP-07: Marking & Evaluation — answer_scores table
CREATE TABLE answer_scores (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    candidate_answer_id UUID        NOT NULL,
    score               INTEGER     NOT NULL DEFAULT 0,
    feedback            TEXT,
    marked_by           UUID,
    marked_at           TIMESTAMPTZ NOT NULL,
    is_auto_marked      BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT answer_scores_pk                        PRIMARY KEY (id),
    CONSTRAINT uq_answer_scores_candidate_answer       UNIQUE (candidate_answer_id),
    CONSTRAINT answer_scores_candidate_answer_fk       FOREIGN KEY (candidate_answer_id)
        REFERENCES candidate_answers (id) ON DELETE CASCADE,
    CONSTRAINT answer_scores_score_non_negative        CHECK (score >= 0)
);
