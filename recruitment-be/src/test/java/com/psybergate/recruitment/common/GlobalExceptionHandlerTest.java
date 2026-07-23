package com.psybergate.recruitment.common;

import com.psybergate.recruitment.invitation.DuplicateInviteException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void accessDeniedException_returns403() {
        ProblemDetail result = handler.handleAccessDenied(new AccessDeniedException("Access is denied"));

        assertThat(result.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
    }

    @Test
    void responseStatusException_preservesStatusAndReason() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found");

        ProblemDetail result = handler.handleException(ex);

        assertThat(result.getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(result.getDetail()).isEqualTo("Assessment not found");
    }

    @Test
    void annotatedCustomException_usesResponseStatusAnnotation() {
        DuplicateInviteException ex = new DuplicateInviteException();

        ProblemDetail result = handler.handleException(ex);

        assertThat(result.getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(result.getDetail()).isEqualTo("DUPLICATE_INVITE");
    }

    @Test
    void unexpectedException_returnsGeneric500() {
        ProblemDetail result = handler.handleException(new RuntimeException("boom"));

        assertThat(result.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        assertThat(result.getDetail()).isEqualTo("An unexpected error occurred");
    }

    @Test
    void dataIntegrityViolation_returns409WithGenericMessage() {
        ProblemDetail result = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate key value violates unique constraint"));

        assertThat(result.getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(result.getDetail()).isEqualTo("The request could not be completed because it conflicts with existing data");
    }
}
