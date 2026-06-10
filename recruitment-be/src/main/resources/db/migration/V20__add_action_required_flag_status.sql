-- EP-37: Add ACTION_REQUIRED to flag status

-- Update the status check constraint to allow ACTION_REQUIRED
ALTER TABLE submission_flags DROP CONSTRAINT IF EXISTS submission_flags_status_check;
ALTER TABLE submission_flags ADD CONSTRAINT submission_flags_status_check
    CHECK (status IN ('FLAGGED','UNDER_REVIEW','ACTION_REQUIRED','RESOLVED','DISMISSED'));

-- Recreate the unique partial index to include ACTION_REQUIRED as an open status
DROP INDEX IF EXISTS uq_submission_flags_open;
CREATE UNIQUE INDEX uq_submission_flags_open
    ON submission_flags (submission_id)
    WHERE status IN ('FLAGGED', 'UNDER_REVIEW', 'ACTION_REQUIRED');
