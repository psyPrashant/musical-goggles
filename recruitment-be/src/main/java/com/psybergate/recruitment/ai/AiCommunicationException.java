package com.psybergate.recruitment.ai;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class AiCommunicationException extends RuntimeException {

    public AiCommunicationException(String message) {
        super(message);
    }
}
