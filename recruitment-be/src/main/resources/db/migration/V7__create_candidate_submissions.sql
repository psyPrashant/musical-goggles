-- EP-06: Candidate Assessment Taking — candidate_submissions table
CREATE TABLE candidate_submissions (
    id            UUID        NOT NULL DEFAULT gen_random_uuid(),
    candidate_id  UUID        NOT NULL,
    assessment_id UUID        NOT NULL,
    invitation_id UUID        NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at    TIMESTAMPTZ NOT NULL,
    submitted_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT candidate_submissions_pk         PRIMARY KEY (id),
    CONSTRAINT candidate_submissions_invitation UNIQUE (invitation_id)
);
