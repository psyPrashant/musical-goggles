-- EP-33: Snapshot of randomised question selection per candidate submission

CREATE TABLE submission_question_snapshots (
    id              UUID    NOT NULL DEFAULT gen_random_uuid(),
    submission_id   UUID    NOT NULL REFERENCES candidate_submissions(id) ON DELETE CASCADE,
    question_id     UUID    NOT NULL,
    display_order   INT     NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX idx_submission_question_snapshots_submission_id
    ON submission_question_snapshots (submission_id);
