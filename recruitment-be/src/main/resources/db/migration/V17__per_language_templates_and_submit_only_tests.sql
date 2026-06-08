-- Per-language starter code templates on code submission questions
ALTER TABLE code_submission_questions
    ADD COLUMN starter_code_java   TEXT,
    ADD COLUMN starter_code_csharp TEXT,
    ADD COLUMN starter_code_python TEXT;

-- Submit-only flag on test cases: when true the test case is excluded from "Test Code"
-- runs but is still evaluated at final submission for auto-scoring.
ALTER TABLE code_test_cases
    ADD COLUMN run_only_on_submit BOOLEAN NOT NULL DEFAULT FALSE;
