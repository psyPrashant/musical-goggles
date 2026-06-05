package com.psybergate.recruitment.marking;

import com.psybergate.recruitment.marking.dto.AnswerScoreResponse;
import com.psybergate.recruitment.marking.dto.ResultSummaryResponse;
import com.psybergate.recruitment.marking.dto.SubmissionSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface SubmissionService {

    List<SubmissionSummaryResponse> listSubmissions(UUID assessmentId);

    List<SubmissionSummaryResponse> listAllSubmissions();

    AnswerScoreResponse scoreAnswer(UUID submissionId, UUID answerId, int score, String feedback, UUID markerId);

    AnswerScoreResponse scoreByQuestionId(UUID submissionId, UUID questionId, int score, String feedback, UUID markerId);

    ResultSummaryResponse getResult(UUID submissionId);
}
