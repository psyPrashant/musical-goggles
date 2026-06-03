ALTER TABLE questions
    ADD COLUMN difficulty VARCHAR(10) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD'));
