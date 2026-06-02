ALTER TABLE assessments
    ADD COLUMN reminder_days_before INTEGER;

CREATE TABLE reminder_send_log (
    id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    invitation_id UUID        NOT NULL REFERENCES candidate_invitations (id),
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    send_type     VARCHAR(20) NOT NULL CHECK (send_type IN ('AUTOMATED', 'MANUAL')),
    sent_by       UUID        REFERENCES users (id)
);

CREATE INDEX idx_reminder_send_log_invitation_id ON reminder_send_log (invitation_id);
