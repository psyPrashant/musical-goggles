package com.psybergate.recruitment.execution;

import com.psybergate.recruitment.execution.dto.RunCodeRequest;
import com.psybergate.recruitment.execution.dto.RunCodeResponse;

public interface CodeExecutionService {

    RunCodeResponse run(RunCodeRequest request);
}
