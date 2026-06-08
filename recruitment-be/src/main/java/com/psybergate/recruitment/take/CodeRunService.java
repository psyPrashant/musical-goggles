package com.psybergate.recruitment.take;

import com.psybergate.recruitment.take.dto.RunCodeResponse;

import java.util.UUID;

public interface CodeRunService {
    RunCodeResponse run(UUID assessmentId, UUID questionId, String sourceCode, String language);
}
