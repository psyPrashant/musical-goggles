package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;
import com.psybergate.recruitment.domain.Candidate;
import com.psybergate.recruitment.repository.CandidateRepository;
import com.psybergate.recruitment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CandidateServiceImpl implements CandidateService {

    @Autowired private CandidateRepository candidateRepository;
    @Autowired private UserRepository userRepository;

    @Override
    public CandidateResponse create(CandidateRequest request, UUID createdById) {
        if (candidateRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A candidate with this email already exists");
        }
        Candidate candidate = new Candidate();
        candidate.setFirstName(request.firstName());
        candidate.setLastName(request.lastName());
        candidate.setEmail(request.email());
        candidate.setCellPhone(request.cellPhone());
        userRepository.findById(createdById).ifPresent(candidate::setCreatedBy);
        return toResponse(candidateRepository.save(candidate));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> findAll() {
        return candidateRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateResponse findById(UUID id) {
        return toResponse(candidateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found")));
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateResponse getByEmail(String email) {
        return toResponse(candidateRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found")));
    }

    @Override
    public CandidateResponse update(UUID id, CandidateRequest request) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));
        if (candidateRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A candidate with this email already exists");
        }
        candidate.setFirstName(request.firstName());
        candidate.setLastName(request.lastName());
        candidate.setEmail(request.email());
        candidate.setCellPhone(request.cellPhone());
        return toResponse(candidateRepository.save(candidate));
    }

    private CandidateResponse toResponse(Candidate c) {
        return new CandidateResponse(c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(), c.getCellPhone(), c.getCreatedAt());
    }
}
