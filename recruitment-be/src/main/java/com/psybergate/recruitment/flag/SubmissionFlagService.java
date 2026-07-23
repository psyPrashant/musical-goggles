package com.psybergate.recruitment.flag;

import com.psybergate.recruitment.domain.FlagStatus;
import com.psybergate.recruitment.flag.domain.FlagReason;
import com.psybergate.recruitment.flag.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SubmissionFlagService {

    FlagResponse createFlag(UUID submissionId, FlagReason reason, UUID actorId, String actorUsername);

    FlagResponse transitionFlag(UUID submissionId, UUID flagId, FlagStatus newStatus, String resolutionNotes,
                                UUID actorId, String actorUsername);

    List<FlagAuditResponse> getAuditTrail(UUID submissionId, UUID flagId);

    List<FlagListItemResponse> getFlagsForCandidate(UUID candidateId);

    List<FlagListItemResponse> getAllFlags(FlagReason reason, UUID assessmentId, LocalDate fromDate, LocalDate toDate);
}
