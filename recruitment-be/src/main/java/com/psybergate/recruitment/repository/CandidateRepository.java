package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    Optional<Candidate> findByEmail(String email);
    boolean existsByEmail(String email);
}
