package com.psybergate.recruitment.take;

import com.psybergate.recruitment.take.dto.AssessmentTakeResponse;
import com.psybergate.recruitment.take.dto.SaveAnswersRequest;
import com.psybergate.recruitment.take.dto.SaveAnswersResponse;
import com.psybergate.recruitment.take.dto.SubmitResponse;

import java.util.UUID;

public interface CandidateTakeService {

    AssessmentTakeResponse loadAssessment(UUID candidateId, UUID assessmentId);

    SaveAnswersResponse saveAnswers(UUID candidateId, UUID assessmentId, SaveAnswersRequest request);

    SubmitResponse submitAssessment(UUID candidateId, UUID assessmentId, boolean autoSubmitted);
}
