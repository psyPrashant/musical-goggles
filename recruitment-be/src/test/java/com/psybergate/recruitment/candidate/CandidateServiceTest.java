package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;
import com.psybergate.recruitment.candidate.dto.ContactCandidateRequest;
import com.psybergate.recruitment.domain.Candidate;
import com.psybergate.recruitment.email.EmailService;
import com.psybergate.recruitment.repository.CandidateRepository;
import com.psybergate.recruitment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTest {

    @Mock private CandidateRepository candidateRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private CandidateServiceImpl service;

    private UUID creatorId;

    @BeforeEach
    void setUp() {
        creatorId = UUID.randomUUID();
    }

    @Test
    void create_withPhone_responseIncludesPhone() {
        CandidateRequest request = new CandidateRequest("Alice", "Smith", "alice@example.com", "+27 82 123 4567");
        Candidate saved = candidateWithPhone(request.cellPhone());
        when(candidateRepository.existsByEmail(any())).thenReturn(false);
        when(candidateRepository.save(any())).thenReturn(saved);

        CandidateResponse response = service.create(request, creatorId);

        assertThat(response.cellPhone()).isEqualTo("+27 82 123 4567");
    }

    @Test
    void create_withoutPhone_responseHasNullPhone() {
        CandidateRequest request = new CandidateRequest("Bob", "Jones", "bob@example.com", null);
        Candidate saved = candidateWithPhone(null);
        when(candidateRepository.existsByEmail(any())).thenReturn(false);
        when(candidateRepository.save(any())).thenReturn(saved);

        CandidateResponse response = service.create(request, creatorId);

        assertThat(response.cellPhone()).isNull();
    }

    @Test
    void update_setsPhone_andClearsPhone() {
        UUID id = UUID.randomUUID();
        Candidate existing = candidateWithPhone(null);
        when(candidateRepository.findById(id)).thenReturn(Optional.of(existing));
        when(candidateRepository.existsByEmailAndIdNot(any(), any())).thenReturn(false);
        when(candidateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CandidateRequest setRequest = new CandidateRequest("Bob", "Jones", "bob@example.com", "+27 71 999 0000");
        CandidateResponse setResponse = service.update(id, setRequest);
        assertThat(setResponse.cellPhone()).isEqualTo("+27 71 999 0000");

        CandidateRequest clearRequest = new CandidateRequest("Bob", "Jones", "bob@example.com", null);
        CandidateResponse clearResponse = service.update(id, clearRequest);
        assertThat(clearResponse.cellPhone()).isNull();
    }

    // ── contactCandidate ────────────────────────────────────────────────────

    @Test
    void contactCandidate_sendsEmailAndSetsActionRequired() {
        UUID id = UUID.randomUUID();
        Candidate candidate = candidateWithPhone(null);
        when(candidateRepository.findById(id)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.contactCandidate(id, new ContactCandidateRequest("Subject", "Hello"));

        verify(emailService).sendContactMessage(candidate, "Subject", "Hello");
        assertThat(candidate.isActionRequired()).isTrue();
    }

    @Test
    void contactCandidate_throwsNotFound_whenCandidateMissing() {
        UUID id = UUID.randomUUID();
        when(candidateRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.contactCandidate(id, new ContactCandidateRequest("S", "M")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Candidate not found");
    }

    // ── setBlacklisted ──────────────────────────────────────────────────────

    @Test
    void setBlacklisted_true_allowedForRecruiter() {
        UUID id = UUID.randomUUID();
        Candidate candidate = candidateWithPhone(null);
        when(candidateRepository.findById(id)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CandidateResponse response = service.setBlacklisted(id, true, false);

        assertThat(response.blacklisted()).isTrue();
    }

    @Test
    void setBlacklisted_false_forbiddenForRecruiter() {
        UUID id = UUID.randomUUID();

        assertThatThrownBy(() -> service.setBlacklisted(id, false, false))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Only admins");
    }

    @Test
    void setBlacklisted_false_allowedForAdmin() {
        UUID id = UUID.randomUUID();
        Candidate candidate = candidateWithPhone(null);
        candidate.setBlacklisted(true);
        when(candidateRepository.findById(id)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CandidateResponse response = service.setBlacklisted(id, false, true);

        assertThat(response.blacklisted()).isFalse();
    }

    private Candidate candidateWithPhone(String phone) {
        Candidate c = new Candidate();
        c.setFirstName("Test");
        c.setLastName("User");
        c.setEmail("test@example.com");
        c.setCellPhone(phone);
        return c;
    }
}
