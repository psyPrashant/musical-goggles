package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;

import java.util.List;
import java.util.UUID;

public interface CandidateService {
    CandidateResponse create(CandidateRequest request, UUID createdById);
    List<CandidateResponse> findAll();
    CandidateResponse findById(UUID id);
}
