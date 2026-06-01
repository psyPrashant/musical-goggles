package com.psybergate.recruitment.assessment;

import com.psybergate.recruitment.assessment.dto.*;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.AssessmentQuestionRepository;
import com.psybergate.recruitment.repository.AssessmentRepository;
import com.psybergate.recruitment.repository.QuestionRepository;
import com.psybergate.recruitment.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AssessmentServiceImpl implements AssessmentService {

    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private AssessmentQuestionRepository assessmentQuestionRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public AssessmentDetailResponse create(AssessmentRequest req, UUID createdById) {
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Assessment assessment = new Assessment();
        assessment.setTitle(req.title());
        assessment.setDescription(req.description());
        assessment.setTimeLimitMinutes(req.timeLimitMinutes());
        assessment.setCreatedBy(creator);
        applyPassword(assessment, req.accessPassword());

        return toDetailResponse(assessmentRepository.save(assessment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssessmentSummaryResponse> findAll() {
        return assessmentRepository.findAll().stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentDetailResponse findById(UUID id) {
        return toDetailResponse(requireAssessment(id));
    }

    @Override
    public AssessmentDetailResponse update(UUID id, AssessmentRequest req) {
        Assessment assessment = requireAssessment(id);
        assessment.setTitle(req.title());
        assessment.setDescription(req.description());
        assessment.setTimeLimitMinutes(req.timeLimitMinutes());
        applyPassword(assessment, req.accessPassword());
        return toDetailResponse(assessmentRepository.save(assessment));
    }

    @Override
    public void delete(UUID id) {
        assessmentRepository.delete(requireAssessment(id));
    }

    @Override
    public AssessmentDetailResponse publish(UUID id) {
        Assessment assessment = requireAssessment(id);
        if (assessment.getStatus() == AssessmentStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Assessment is already published");
        }
        assessment.setStatus(AssessmentStatus.PUBLISHED);
        return toDetailResponse(assessmentRepository.save(assessment));
    }

    @Override
    public AddQuestionResult addQuestion(UUID assessmentId, AddAssessmentQuestionRequest req) {
        Assessment assessment = requireAssessment(assessmentId);

        Question question = questionRepository.findById(req.questionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        // Enforce max-one CODE_SUBMISSION rule (skip check if idempotent update of existing item).
        // Decision (EP-10): this limit applies to TOP-LEVEL questions only. A GROUP question that
        // contains a CODE_SUBMISSION sub-question does NOT count toward this limit, because the
        // JPQL query checks TYPE(aq.question) = CodeSubmissionQuestion at the top-level join.
        boolean alreadyLinked = assessmentQuestionRepository
                .findByAssessmentIdAndQuestionId(assessmentId, req.questionId()).isPresent();

        if (!alreadyLinked && question.getType() == QuestionType.CODE_SUBMISSION) {
            long existingCount = assessmentQuestionRepository.countCodeSubmissionInAssessment(assessmentId);
            if (existingCount >= 1) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "An assessment may contain at most one code submission question");
            }
        }

        boolean[] created = {false};
        assessmentQuestionRepository.findByAssessmentIdAndQuestionId(assessmentId, req.questionId())
                .ifPresentOrElse(
                        existing -> existing.setDisplayOrder(req.displayOrder()),
                        () -> {
                            AssessmentQuestion aq = new AssessmentQuestion();
                            aq.setAssessment(assessment);
                            aq.setQuestion(question);
                            aq.setDisplayOrder(req.displayOrder());
                            assessmentQuestionRepository.save(aq);
                            assessment.getQuestions().add(aq);
                            created[0] = true;
                        }
                );

        return new AddQuestionResult(toDetailResponse(assessment), created[0]);
    }

    @Override
    public void removeQuestion(UUID assessmentId, UUID questionId) {
        requireAssessment(assessmentId);
        AssessmentQuestion item = assessmentQuestionRepository
                .findByAssessmentIdAndQuestionId(assessmentId, questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Question is not part of this assessment"));
        assessmentQuestionRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public AssessmentPreviewResponse getPreview(UUID assessmentId) {
        Assessment assessment = requireAssessment(assessmentId);

        List<PreviewQuestionDto> questions = assessment.getQuestions().stream()
                .sorted(Comparator.comparingInt(AssessmentQuestion::getDisplayOrder))
                .map(aq -> toPreviewQuestion(aq.getQuestion()))
                .toList();

        return new AssessmentPreviewResponse(
                assessment.getId(),
                assessment.getTitle(),
                assessment.getDescription(),
                assessment.getTimeLimitMinutes(),
                assessment.getAccessPasswordHash() != null,
                questions
        );
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Assessment requireAssessment(UUID id) {
        return assessmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));
    }

    private void applyPassword(Assessment assessment, String rawPassword) {
        if (rawPassword != null && !rawPassword.isBlank()) {
            assessment.setAccessPasswordHash(passwordEncoder.encode(rawPassword));
        } else if (rawPassword != null) {
            // Explicitly blank → clear any existing password
            assessment.setAccessPasswordHash(null);
        }
        // null → leave unchanged
    }

    private AssessmentSummaryResponse toSummaryResponse(Assessment a) {
        return new AssessmentSummaryResponse(
                a.getId(), a.getTitle(), a.getDescription(), a.getTimeLimitMinutes(),
                a.getStatus(), a.getQuestions().size(),
                a.getAccessPasswordHash() != null,
                a.getCreatedAt(), a.getUpdatedAt()
        );
    }

    private AssessmentDetailResponse toDetailResponse(Assessment a) {
        List<AssessmentQuestionItemResponse> questions = a.getQuestions().stream()
                .sorted(Comparator.comparingInt(AssessmentQuestion::getDisplayOrder))
                .map(aq -> {
                    Question q = (Question) Hibernate.unproxy(aq.getQuestion());
                    int subCount = (q instanceof GroupQuestion gq) ? gq.getMembers().size() : 0;
                    return new AssessmentQuestionItemResponse(
                            q.getId(), q.getTitle(), q.getType(), aq.getDisplayOrder(), subCount
                    );
                })
                .toList();

        return new AssessmentDetailResponse(
                a.getId(), a.getTitle(), a.getDescription(), a.getTimeLimitMinutes(),
                a.getStatus(), questions,
                a.getAccessPasswordHash() != null,
                a.getCreatedAt(), a.getUpdatedAt()
        );
    }

    private PreviewQuestionDto toPreviewQuestion(Question q) {
        // Unproxy required: JOINED-inheritance @ManyToOne(LAZY) produces a Question proxy;
        // instanceof checks against the proxy type always fail for subclasses.
        Question unproxied = (Question) Hibernate.unproxy(q);
        List<PreviewOptionDto> options = null;
        String languageHint = null;
        List<PreviewQuestionDto> subQuestions = null;

        if (unproxied instanceof McqQuestion mcq) {
            options = mcq.getOptions().stream()
                    .map(o -> new PreviewOptionDto(o.getId(), o.getOptionText()))
                    .toList();
        } else if (unproxied instanceof CodeSubmissionQuestion csq) {
            languageHint = csq.getLanguageHint();
        } else if (unproxied instanceof GroupQuestion gq) {
            // GROUP question: body is the preamble; members become sub-questions.
            // Sub-questions are rendered using their native type (MCQ/TEXT/CODE_SUBMISSION).
            subQuestions = gq.getMembers().stream()
                    .map(m -> toPreviewQuestion((Question) Hibernate.unproxy(m.getQuestion())))
                    .toList();
        }

        return new PreviewQuestionDto(q.getId(), q.getType(), q.getBody(), options, languageHint, subQuestions);
    }
}
