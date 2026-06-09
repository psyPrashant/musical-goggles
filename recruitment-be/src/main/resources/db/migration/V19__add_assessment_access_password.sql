-- MG-156: store plain-text password so invite emails can auto-attach it
ALTER TABLE assessments ADD COLUMN access_password VARCHAR(255);
