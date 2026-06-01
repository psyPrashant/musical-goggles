package com.psybergate.recruitment.marking;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.marking.dto.*;
import com.psybergate.recruitment.repository.*;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SubmissionServiceImpl implements SubmissionService {

    @Autowired private CandidateSubmissionRepository submissionRepository;
    @Autowired private CandidateAnswerRepository answerRepository;
    @Autowired private AnswerScoreRepository scoreRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private AssessmentQuestionRepository assessmentQuestionRepository;
    @Autowired private QuestionRepository questionRepository;

    @Override
    public List<SubmissionSummaryResponse> listSubmissions(UUID assessmentId) {
        assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        List<CandidateSubmission> submissions = submissionRepository.findByAssessmentId(assessmentId);
        return buildSummaries(submissions);
    }

    @Override
    public List<SubmissionSummaryResponse> listAllSubmissions() {
        return buildSummaries(submissionRepository.findAll());
    }

    @Override
    @Transactional
    public AnswerScoreResponse scoreAnswer(UUID submissionId, UUID answerId, int score, String feedback, UUID markerId) {
        submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        CandidateAnswer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Answer not found"));

        if (!answer.getSubmissionId().equals(submissionId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Answer does not belong to this submission");
        }

        if (score < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Score must be non-negative");
        }

        AnswerScore answerScore = scoreRepository.findByCandidateAnswerId(answerId)
                .orElseGet(AnswerScore::new);

        answerScore.setCandidateAnswerId(answerId);
        answerScore.setScore(score);
        answerScore.setFeedback(feedback);
        answerScore.setMarkedBy(markerId);
        answerScore.setMarkedAt(Instant.now());
        answerScore.setAutoMarked(false);

        answerScore = scoreRepository.save(answerScore);

        return new AnswerScoreResponse(
                answerId, answerScore.getScore(), answerScore.getFeedback(),
                answerScore.isAutoMarked(), answerScore.getMarkedBy(), answerScore.getMarkedAt()
        );
    }

    @Override
    public ResultSummaryResponse getResult(UUID submissionId) {
        CandidateSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        Assessment assessment = assessmentRepository.findById(submission.getAssessmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        Candidate candidate = candidateRepository.findById(submission.getCandidateId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        // Load all questions in display order
        List<AssessmentQuestion> aqList = assessmentQuestionRepository
                .findByAssessmentIdOrderByDisplayOrder(submission.getAssessmentId());

        // Load all answers for this submission
        List<CandidateAnswer> answers = answerRepository.findBySubmissionId(submissionId);
        Map<UUID, CandidateAnswer> answerByQuestionId = answers.stream()
                .collect(Collectors.toMap(CandidateAnswer::getQuestionId, Function.identity()));

        // Load all scores for these answers
        Set<UUID> answerIds = answers.stream().map(CandidateAnswer::getId).collect(Collectors.toSet());
        Map<UUID, AnswerScore> scoreByAnswerId = answerIds.isEmpty() ? Map.of() :
                scoreRepository.findByCandidateAnswerIdIn(answerIds).stream()
                        .collect(Collectors.toMap(AnswerScore::getCandidateAnswerId, Function.identity()));

        // Build per-question DTOs
        List<ResultQuestionDto> questionDtos = new ArrayList<>();
        int totalScore = 0;
        boolean fullyMarked = true;

        for (AssessmentQuestion aq : aqList) {
            Question rawQ = (Question) Hibernate.unproxy(aq.getQuestion());
            CandidateAnswer answer = answerByQuestionId.get(rawQ.getId());

            String candidateAnswerText = null;
            Integer score = null;
            String feedback = null;
            boolean autoMarked = false;
            UUID markedBy = null;
            Instant markedAt = null;

            if (answer != null) {
                candidateAnswerText = resolveCandidateAnswer(answer, rawQ);

                AnswerScore answerScore = scoreByAnswerId.get(answer.getId());
                if (answerScore != null) {
                    score = answerScore.getScore();
                    feedback = answerScore.getFeedback();
                    autoMarked = answerScore.isAutoMarked();
                    markedBy = answerScore.getMarkedBy();
                    markedAt = answerScore.getMarkedAt();
                    totalScore += score;
                } else {
                    fullyMarked = false;
                }
            } else {
                fullyMarked = false;
            }

            questionDtos.add(new ResultQuestionDto(
                    rawQ.getId(),
                    answer != null ? answer.getId() : null,
                    rawQ.getTitle(), rawQ.getType(),
                    candidateAnswerText, score, feedback, autoMarked, markedBy, markedAt
            ));
        }

        String markingStatus = fullyMarked && !aqList.isEmpty() ? "FULLY_MARKED" : "PENDING_REVIEW";

        return new ResultSummaryResponse(
                submissionId,
                candidate.getFirstName() + " " + candidate.getLastName(),
                assessment.getTitle(),
                submission.getSubmittedAt(),
                totalScore,
                markingStatus,
                questionDtos
        );
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private List<SubmissionSummaryResponse> buildSummaries(List<CandidateSubmission> submissions) {
        if (submissions.isEmpty()) return List.of();

        Set<UUID> candidateIds = submissions.stream()
                .map(CandidateSubmission::getCandidateId).collect(Collectors.toSet());
        Map<UUID, Candidate> candidateMap = candidateRepository.findAllById(candidateIds).stream()
                .collect(Collectors.toMap(Candidate::getId, Function.identity()));

        // Load answers and scores for all submissions at once
        Set<UUID> submissionIds = submissions.stream()
                .map(CandidateSubmission::getId).collect(Collectors.toSet());
        List<CandidateAnswer> allAnswers = submissionIds.isEmpty() ? List.of() :
                submissionIds.stream()
                        .flatMap(sid -> answerRepository.findBySubmissionId(sid).stream())
                        .toList();

        Map<UUID, Long> answeredBySubmission = allAnswers.stream()
                .collect(Collectors.groupingBy(CandidateAnswer::getSubmissionId, Collectors.counting()));

        Set<UUID> allAnswerIds = allAnswers.stream().map(CandidateAnswer::getId).collect(Collectors.toSet());
        Map<UUID, UUID> submissionByAnswerId = allAnswers.stream()
                .collect(Collectors.toMap(CandidateAnswer::getId, CandidateAnswer::getSubmissionId));
        Map<UUID, Long> scoredBySubmission = allAnswerIds.isEmpty() ? Map.of() :
                scoreRepository.findByCandidateAnswerIdIn(allAnswerIds).stream()
                        .collect(Collectors.groupingBy(
                                as -> submissionByAnswerId.get(as.getCandidateAnswerId()),
                                Collectors.counting()
                        ));

        return submissions.stream()
                .sorted(Comparator
                        .comparing((CandidateSubmission s) -> s.getStatus() == SubmissionStatus.IN_PROGRESS ? 1 : 0)
                        .thenComparing(Comparator.comparing(
                                s -> s.getSubmittedAt() != null ? s.getSubmittedAt() : Instant.MIN,
                                Comparator.reverseOrder()))
                )
                .map(s -> {
                    Candidate c = candidateMap.get(s.getCandidateId());
                    String name = c != null ? c.getFirstName() + " " + c.getLastName() : "Unknown";
                    int answered = answeredBySubmission.getOrDefault(s.getId(), 0L).intValue();
                    int marked = scoredBySubmission.getOrDefault(s.getId(), 0L).intValue();
                    return new SubmissionSummaryResponse(
                            s.getId(), s.getCandidateId(), name, s.getStatus(),
                            s.getSubmittedAt(), answered, answered, marked
                    );
                })
                .toList();
    }

    private String resolveCandidateAnswer(CandidateAnswer answer, Question question) {
        if (answer.getTextContent() != null) return answer.getTextContent();

        if (answer.getSelectedOptionIds() != null && question instanceof McqQuestion mcq) {
            // Resolve first selected option ID to its text
            String raw = answer.getSelectedOptionIds().replace("[", "").replace("]", "").replace("\"", "").trim();
            if (!raw.isBlank()) {
                String firstIdStr = raw.split(",")[0].trim();
                try {
                    UUID optId = UUID.fromString(firstIdStr);
                    return mcq.getOptions().stream()
                            .filter(o -> o.getId().equals(optId))
                            .map(QuestionOption::getOptionText)
                            .findFirst()
                            .orElse(firstIdStr);
                } catch (Exception e) {
                    return raw;
                }
            }
        }
        return null;
    }
}
