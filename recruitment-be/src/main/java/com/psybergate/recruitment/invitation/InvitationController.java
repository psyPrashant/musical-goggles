package com.psybergate.recruitment.invitation;

import com.psybergate.recruitment.invitation.dto.InviteRequest;
import com.psybergate.recruitment.invitation.dto.InviteResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/invitations")
@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
public class InvitationController {

    @Value("${app.base-url}")
    private String frontendBaseUrl;

    @Autowired
    private InvitationService invitationService;

    @PostMapping
    public ResponseEntity<InviteResponse> invite(@RequestBody @Valid InviteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invitationService.invite(request, frontendBaseUrl));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        invitationService.cancelInvitation(id);
        return ResponseEntity.noContent().build();
    }
}
