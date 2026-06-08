ALTER TABLE code_submission_questions
    ADD COLUMN starter_code TEXT;

CREATE TABLE code_test_cases (
    id              UUID    NOT NULL DEFAULT gen_random_uuid(),
    question_id     UUID    NOT NULL,
    display_order   INT     NOT NULL DEFAULT 0,
    description     VARCHAR(255),
    stdin           TEXT,
    expected_output TEXT    NOT NULL,
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT code_test_cases_pk          PRIMARY KEY (id),
    CONSTRAINT code_test_cases_question_fk FOREIGN KEY (question_id)
        REFERENCES code_submission_questions (id) ON DELETE CASCADE
);

CREATE TABLE code_test_results (
    id              UUID    NOT NULL DEFAULT gen_random_uuid(),
    answer_id       UUID    NOT NULL,
    test_case_id    UUID    NOT NULL,
    passed          BOOLEAN NOT NULL,
    actual_output   TEXT,
    stderr          TEXT,
    judge0_status   INT,
    execution_ms    NUMERIC(8,2),
    CONSTRAINT code_test_results_pk             PRIMARY KEY (id),
    CONSTRAINT uq_code_test_results_ans_case    UNIQUE (answer_id, test_case_id),
    CONSTRAINT code_test_results_answer_fk      FOREIGN KEY (answer_id)
        REFERENCES candidate_answers (id) ON DELETE CASCADE,
    CONSTRAINT code_test_results_test_case_fk   FOREIGN KEY (test_case_id)
        REFERENCES code_test_cases (id) ON DELETE CASCADE
);
