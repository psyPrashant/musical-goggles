package com.psybergate.recruitment.questiongroup;

import com.psybergate.recruitment.domain.Question;
import com.psybergate.recruitment.domain.QuestionGroup;
import com.psybergate.recruitment.domain.QuestionGroupItem;
import com.psybergate.recruitment.questiongroup.dto.*;
import com.psybergate.recruitment.repository.QuestionGroupItemRepository;
import com.psybergate.recruitment.repository.QuestionGroupRepository;
import com.psybergate.recruitment.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class QuestionGroupServiceImpl implements QuestionGroupService {

    @Autowired private QuestionGroupRepository groupRepository;
    @Autowired private QuestionGroupItemRepository itemRepository;
    @Autowired private QuestionRepository questionRepository;

    @Override
    public QuestionGroupResponse create(QuestionGroupRequest req) {
        if (groupRepository.findByNameIgnoreCase(req.name()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Group name already exists");
        }
        QuestionGroup group = new QuestionGroup();
        group.setName(req.name());
        group.setDescription(req.description());
        group.setStructured(req.structured());
        return toResponse(groupRepository.save(group));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionGroupResponse> findAll() {
        return groupRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionGroupResponse findById(UUID id) {
        return toResponse(requireGroup(id));
    }

    @Override
    public QuestionGroupResponse update(UUID id, QuestionGroupRequest req) {
        QuestionGroup group = requireGroup(id);
        if (groupRepository.existsByNameIgnoreCaseAndIdNot(req.name(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Group name already exists");
        }
        group.setName(req.name());
        group.setDescription(req.description());
        group.setStructured(req.structured());
        return toResponse(groupRepository.save(group));
    }

    @Override
    public void delete(UUID id) {
        groupRepository.delete(requireGroup(id));
    }

    @Override
    public QuestionGroupResponse addQuestion(UUID groupId, AddQuestionToGroupRequest req) {
        QuestionGroup group = requireGroup(groupId);

        if (group.isStructured() && req.displayOrder() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "display_order is required for structured groups");
        }

        Question question = questionRepository.findById(req.questionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        // Idempotent — if already a member, just return current state
        itemRepository.findByGroupIdAndQuestionId(groupId, req.questionId()).ifPresentOrElse(
                existing -> existing.setDisplayOrder(req.displayOrder()),
                () -> {
                    QuestionGroupItem item = new QuestionGroupItem();
                    item.setGroup(group);
                    item.setQuestion(question);
                    item.setDisplayOrder(req.displayOrder());
                    itemRepository.save(item);
                    group.getItems().add(item);
                }
        );

        return toResponse(group);
    }

    @Override
    public void removeQuestion(UUID groupId, UUID questionId) {
        QuestionGroupItem item = itemRepository.findByGroupIdAndQuestionId(groupId, questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not in group"));
        itemRepository.delete(item);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private QuestionGroup requireGroup(UUID id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));
    }

    private QuestionGroupResponse toResponse(QuestionGroup group) {
        List<GroupQuestionResponse> questions = group.getItems().stream()
                .sorted(Comparator.comparingInt(i -> i.getDisplayOrder() != null ? i.getDisplayOrder() : Integer.MAX_VALUE))
                .map(i -> new GroupQuestionResponse(
                        i.getQuestion().getId(),
                        i.getQuestion().getTitle(),
                        i.getQuestion().getType(),
                        i.getDisplayOrder()
                ))
                .toList();

        return new QuestionGroupResponse(
                group.getId(), group.getName(), group.getDescription(),
                group.isStructured(), questions, group.getCreatedAt(), group.getUpdatedAt()
        );
    }
}
