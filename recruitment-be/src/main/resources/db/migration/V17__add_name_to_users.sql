ALTER TABLE users
    ADD COLUMN first_name VARCHAR(100),
    ADD COLUMN last_name  VARCHAR(100);

UPDATE users SET first_name = 'Admin',     last_name = 'User' WHERE role = 'ADMIN';
UPDATE users SET first_name = 'Recruiter', last_name = 'User' WHERE role = 'RECRUITER';
UPDATE users SET first_name = 'Candidate', last_name = 'User' WHERE role = 'CANDIDATE';

ALTER TABLE users
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name  SET NOT NULL;
