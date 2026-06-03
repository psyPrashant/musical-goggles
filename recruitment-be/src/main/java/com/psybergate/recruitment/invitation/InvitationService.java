package com.psybergate.recruitment.invitation;

import com.psybergate.recruitment.invitation.dto.InviteRequest;
import com.psybergate.recruitment.invitation.dto.InviteResponse;

import java.util.UUID;

public interface InvitationService {
    InviteResponse invite(InviteRequest request, String baseUrl);
    void cancelInvitation(UUID invitationId);
}
