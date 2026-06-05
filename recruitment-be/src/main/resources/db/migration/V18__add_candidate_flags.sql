ALTER TABLE candidates
    ADD COLUMN action_required BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN blacklisted     BOOLEAN NOT NULL DEFAULT false;
