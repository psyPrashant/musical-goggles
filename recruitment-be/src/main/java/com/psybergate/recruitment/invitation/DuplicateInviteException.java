package com.psybergate.recruitment.invitation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT, reason = "DUPLICATE_INVITE")
public class DuplicateInviteException extends RuntimeException {
    public DuplicateInviteException() {
        super("DUPLICATE_INVITE");
    }
}
