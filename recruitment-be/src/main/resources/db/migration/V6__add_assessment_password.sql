-- EP-05: Candidate Invitation — optional access password on assessments
ALTER TABLE assessments ADD COLUMN access_password_hash VARCHAR(255);
