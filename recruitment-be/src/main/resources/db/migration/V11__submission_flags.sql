-- EP-11: Assessment Integrity — submission_flags and audit tables

CREATE TABLE submission_flags (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    submission_id       UUID        NOT NULL,
    reason              VARCHAR(50) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'FLAGGED',
    resolution_notes    TEXT,
    created_by          UUID        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT submission_flags_pk                  PRIMARY KEY (id),
    CONSTRAINT submission_flags_submission_fk       FOREIGN KEY (submission_id)
        REFERENCES candidate_submissions (id) ON DELETE CASCADE,
    CONSTRAINT submission_flags_status_check        CHECK (status IN ('FLAGGED','UNDER_REVIEW','RESOLVED','DISMISSED')),
    CONSTRAINT submission_flags_reason_check        CHECK (reason IN (
        'COPIED_ANSWERS','TIMING_ANOMALY','AI_GENERATED_CONTENT','SUSPICIOUS_BEHAVIOUR','OTHER'
    ))
);

CREATE TABLE submission_flag_audit (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    flag_id         UUID        NOT NULL,
    action          VARCHAR(20) NOT NULL,
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    actor_user_id   UUID        NOT NULL,
    actor_username  VARCHAR(255) NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT submission_flag_audit_pk         PRIMARY KEY (id),
    CONSTRAINT submission_flag_audit_flag_fk    FOREIGN KEY (flag_id)
        REFERENCES submission_flags (id) ON DELETE CASCADE
);

-- Task 1.3: unique partial index — only one open flag per submission
CREATE UNIQUE INDEX uq_submission_flags_open
    ON submission_flags (submission_id)
    WHERE status IN ('FLAGGED', 'UNDER_REVIEW');
