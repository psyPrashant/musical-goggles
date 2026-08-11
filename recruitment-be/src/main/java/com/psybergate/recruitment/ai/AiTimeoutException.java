package com.psybergate.recruitment.ai;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.GATEWAY_TIMEOUT)
public class AiTimeoutException extends RuntimeException {

    public AiTimeoutException(String message) {
        super(message);
    }
}
