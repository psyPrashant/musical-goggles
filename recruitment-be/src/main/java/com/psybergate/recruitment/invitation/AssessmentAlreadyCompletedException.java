package com.psybergate.recruitment.invitation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "ASSESSMENT_ALREADY_COMPLETED")
public class AssessmentAlreadyCompletedException extends RuntimeException {
    public AssessmentAlreadyCompletedException() {
        super("ASSESSMENT_ALREADY_COMPLETED");
    }
}
