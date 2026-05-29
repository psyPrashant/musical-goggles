package com.psybergate.recruitment.questiongroup;

import com.psybergate.recruitment.questiongroup.dto.AddQuestionToGroupRequest;
import com.psybergate.recruitment.questiongroup.dto.QuestionGroupRequest;
import com.psybergate.recruitment.questiongroup.dto.QuestionGroupResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/question-groups")
@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
public class QuestionGroupController {

    @Autowired
    private QuestionGroupService questionGroupService;

    @PostMapping
    public ResponseEntity<QuestionGroupResponse> create(@RequestBody @Valid QuestionGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionGroupService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<QuestionGroupResponse>> list() {
        return ResponseEntity.ok(questionGroupService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionGroupResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(questionGroupService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionGroupResponse> update(@PathVariable UUID id,
                                                        @RequestBody @Valid QuestionGroupRequest request) {
        return ResponseEntity.ok(questionGroupService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        questionGroupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<QuestionGroupResponse> addQuestion(@PathVariable UUID id,
                                                             @RequestBody @Valid AddQuestionToGroupRequest request) {
        return ResponseEntity.ok(questionGroupService.addQuestion(id, request));
    }

    @DeleteMapping("/{id}/questions/{questionId}")
    public ResponseEntity<Void> removeQuestion(@PathVariable UUID id, @PathVariable UUID questionId) {
        questionGroupService.removeQuestion(id, questionId);
        return ResponseEntity.noContent().build();
    }
}
