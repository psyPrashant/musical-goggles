package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateHistoryItemResponse;
import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;
import com.psybergate.recruitment.candidate.dto.ContactCandidateRequest;

import java.util.List;
import java.util.UUID;

public interface CandidateService {
    CandidateResponse create(CandidateRequest request, UUID createdById);
    List<CandidateResponse> findAll();
    CandidateResponse findById(UUID id);
    CandidateResponse getByEmail(String email);
    CandidateResponse update(UUID id, CandidateRequest request);
    List<CandidateHistoryItemResponse> getAssessmentHistory(UUID candidateId);
    void contactCandidate(UUID candidateId, ContactCandidateRequest req);
    CandidateResponse setBlacklisted(UUID candidateId, boolean blacklisted, boolean isAdmin);
}
