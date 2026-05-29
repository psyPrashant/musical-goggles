-- EP-05: Candidate Invitation — candidate_invitations table
CREATE TABLE candidate_invitations (
    id               UUID         NOT NULL DEFAULT gen_random_uuid(),
    candidate_id     UUID         NOT NULL REFERENCES candidates (id) ON DELETE CASCADE,
    assessment_id    UUID         NOT NULL REFERENCES assessments (id) ON DELETE CASCADE,
    invitation_token TEXT         NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    expires_at       TIMESTAMPTZ  NOT NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT candidate_invitations_pk    PRIMARY KEY (id),
    CONSTRAINT candidate_invitations_token UNIQUE (invitation_token)
);
