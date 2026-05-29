package com.psybergate.recruitment.question;

import com.psybergate.recruitment.question.dto.QuestionRequest;
import com.psybergate.recruitment.question.dto.QuestionResponse;

import java.util.List;
import java.util.UUID;

public interface QuestionService {

    QuestionResponse create(QuestionRequest request, UUID createdById);

    List<QuestionResponse> findAll(String type, String tag);

    QuestionResponse findById(UUID id);

    QuestionResponse update(UUID id, QuestionRequest request);

    void delete(UUID id);
}
