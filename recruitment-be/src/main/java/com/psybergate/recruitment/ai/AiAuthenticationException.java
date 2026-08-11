package com.psybergate.recruitment.ai;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class AiAuthenticationException extends RuntimeException {

    public AiAuthenticationException(String message) {
        super(message);
    }
}
