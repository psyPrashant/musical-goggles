package com.psybergate.recruitment.marking;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.judge0.CodeLanguage;
import com.psybergate.recruitment.judge0.Judge0Client;
import com.psybergate.recruitment.repository.*;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarkingServiceImpl implements MarkingService {

    @Autowired private CandidateAnswerRepository answerRepository;
    @Autowired private AnswerScoreRepository scoreRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private CodeTestCaseRepository testCaseRepository;
    @Autowired private CodeTestResultRepository testResultRepository;
    @Autowired private Judge0Client judge0Client;
    @Autowired private CodeLanguage codeLanguage;

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void autoMarkMcq(UUID submissionId) {
        List<CandidateAnswer> answers = answerRepository.findBySubmissionId(submissionId);
        if (answers.isEmpty()) return;

        // Load all questions for those answers in one batch
        Set<UUID> questionIds = answers.stream()
                .map(CandidateAnswer::getQuestionId)
                .collect(Collectors.toSet());
        Map<UUID, Question> questionMap = questionRepository.findAllById(questionIds).stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        Instant now = Instant.now();

        for (CandidateAnswer answer : answers) {
            Question rawQ = questionMap.get(answer.getQuestionId());
            if (rawQ == null) continue;
            Question q = (Question) Hibernate.unproxy(rawQ);
            if (!(q instanceof McqQuestion mcq)) continue;

            // Skip if already scored (idempotency — don't overwrite existing score)
            if (scoreRepository.findByCandidateAnswerId(answer.getId()).isPresent()) continue;

            int score = computeMcqScore(answer, mcq);

            AnswerScore answerScore = new AnswerScore();
            answerScore.setCandidateAnswerId(answer.getId());
            answerScore.setScore(score);
            answerScore.setAutoMarked(true);
            answerScore.setMarkedAt(now);
            scoreRepository.save(answerScore);
        }
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void autoMarkCode(UUID submissionId) {
        List<CandidateAnswer> answers = answerRepository.findBySubmissionId(submissionId);
        if (answers.isEmpty()) return;

        Set<UUID> questionIds = answers.stream()
                .map(CandidateAnswer::getQuestionId)
                .collect(Collectors.toSet());
        Map<UUID, Question> questionMap = questionRepository.findAllById(questionIds).stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        Instant now = Instant.now();

        for (CandidateAnswer answer : answers) {
            Question rawQ = questionMap.get(answer.getQuestionId());
            if (rawQ == null) continue;
            Question q = (Question) Hibernate.unproxy(rawQ);
            if (!(q instanceof CodeSubmissionQuestion)) continue;
            if (answer.getTextContent() == null || answer.getTextContent().isBlank()) continue;

            // Skip if already scored (idempotency)
            if (scoreRepository.findByCandidateAnswerId(answer.getId()).isPresent()) continue;

            List<CodeTestCase> allCases = testCaseRepository
                    .findByQuestion_IdOrderByDisplayOrder(answer.getQuestionId());

            // Delete any previous run results for this answer before re-inserting
            testResultRepository.deleteByAnswerId(answer.getId());

            int passed = 0;
            int langId = codeLanguage.toJudge0Id(answer.getSelectedLanguage());
            for (CodeTestCase tc : allCases) {
                Judge0Client.SubmissionResult result =
                        judge0Client.execute(answer.getTextContent(), tc.getStdin(), langId);
                String actual = normalise(result.stdout());
                String expected = normalise(tc.getExpectedOutput());
                boolean casePass = result.status().id() == 3 && actual.equals(expected);

                CodeTestResult ctr = new CodeTestResult();
                ctr.setAnswerId(answer.getId());
                ctr.setTestCaseId(tc.getId());
                ctr.setPassed(casePass);
                ctr.setActualOutput(result.stdout());
                String stderr = result.stderr() != null ? result.stderr()
                        : result.compileOutput() != null ? result.compileOutput()
                        : result.message();
                ctr.setStderr(stderr);
                ctr.setJudge0Status(result.status().id());
                if (result.time() != null) {
                    try {
                        ctr.setExecutionMs(new BigDecimal(result.time()).multiply(BigDecimal.valueOf(1000)));
                    } catch (NumberFormatException ignored) {}
                }
                testResultRepository.save(ctr);
                if (casePass) passed++;
            }

            AnswerScore answerScore = new AnswerScore();
            answerScore.setCandidateAnswerId(answer.getId());
            answerScore.setScore(passed);
            answerScore.setAutoMarked(true);
            answerScore.setMarkedAt(now);
            scoreRepository.save(answerScore);
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String normalise(String s) {
        return s == null ? "" : s.stripTrailing();
    }

    private int computeMcqScore(CandidateAnswer answer, McqQuestion mcq) {
        Set<UUID> correctIds = mcq.getOptions().stream()
                .filter(QuestionOption::isCorrect)
                .map(QuestionOption::getId)
                .collect(Collectors.toSet());

        Set<UUID> selectedIds = parseSelectedOptionIds(answer.getSelectedOptionIds());

        // Score 1 only if selected set exactly matches correct set
        return selectedIds.equals(correctIds) ? 1 : 0;
    }

    private Set<UUID> parseSelectedOptionIds(String json) {
        if (json == null || json.isBlank()) return Set.of();
        try {
            // Simple JSON array parsing: ["uuid1","uuid2"]
            String inner = json.strip();
            if (inner.startsWith("[")) inner = inner.substring(1);
            if (inner.endsWith("]")) inner = inner.substring(0, inner.length() - 1);
            if (inner.isBlank()) return Set.of();
            Set<UUID> result = new HashSet<>();
            for (String part : inner.split(",")) {
                String cleaned = part.strip().replace("\"", "");
                if (!cleaned.isBlank()) result.add(UUID.fromString(cleaned));
            }
            return result;
        } catch (Exception e) {
            return Set.of();
        }
    }
}
