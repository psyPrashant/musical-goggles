package com.psybergate.recruitment.marking;

import java.util.UUID;

public interface MarkingService {

    /** Auto-score all MCQ answers in the given submission. No-op if already scored. */
    void autoMarkMcq(UUID submissionId);

    /** Auto-score all CODE_SUBMISSION answers in the given submission via Judge0. No-op if already scored. */
    void autoMarkCode(UUID submissionId);
}
