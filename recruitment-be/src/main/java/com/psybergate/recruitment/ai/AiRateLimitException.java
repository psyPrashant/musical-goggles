package com.psybergate.recruitment.ai;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class AiRateLimitException extends RuntimeException {

    public AiRateLimitException(String message) {
        super(message);
    }
}
