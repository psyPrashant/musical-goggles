package com.psybergate.recruitment.question;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.question.dto.*;
import com.psybergate.recruitment.repository.QuestionRepository;
import com.psybergate.recruitment.repository.UserRepository;
import com.psybergate.recruitment.tag.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class QuestionServiceImpl implements QuestionService {

    @Autowired private QuestionRepository questionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TagService tagService;

    @Override
    public QuestionResponse create(QuestionRequest req, UUID createdById) {
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Question question = buildEntity(req);
        question.setCreatedBy(creator);
        question.setTags(tagService.resolveTagNames(req.tags()));

        return toResponse(questionRepository.save(question));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> findAll(String type, String tag) {
        List<Question> questions = (tag != null)
                ? questionRepository.findByTagName(tag.toLowerCase())
                : questionRepository.findAll();

        if (type != null) {
            Class<?> typeClass = resolveTypeClass(type);
            questions = questions.stream().filter(q -> q.getClass().equals(typeClass)).toList();
        }
        return questions.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse findById(UUID id) {
        return toResponse(requireQuestion(id));
    }

    @Override
    public QuestionResponse update(UUID id, QuestionRequest req) {
        Question question = requireQuestion(id);

        if (question.getType() != req.type()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change question type");
        }

        question.setTitle(req.title());
        question.setBody(req.body());
        question.getTags().clear();
        question.getTags().addAll(tagService.resolveTagNames(req.tags()));

        applyTypeSpecificUpdate(question, req);

        QuestionResponse response = toResponse(questionRepository.save(question));
        tagService.cleanupOrphans();
        return response;
    }

    @Override
    public void delete(UUID id) {
        Question question = requireQuestion(id);
        questionRepository.delete(question);
        tagService.cleanupOrphans();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Question buildEntity(QuestionRequest req) {
        return switch (req.type()) {
            case MCQ -> buildMcq(req);
            case TEXT -> {
                TextQuestion q = new TextQuestion();
                q.setTitle(req.title());
                q.setBody(req.body());
                yield q;
            }
            case CODE_SUBMISSION -> {
                CodeSubmissionQuestion q = new CodeSubmissionQuestion();
                q.setTitle(req.title());
                q.setBody(req.body());
                q.setLanguageHint(req.languageHint());
                yield q;
            }
        };
    }

    private McqQuestion buildMcq(QuestionRequest req) {
        validateMcqOptions(req);
        McqQuestion q = new McqQuestion();
        q.setTitle(req.title());
        q.setBody(req.body());
        req.options().forEach(opt -> {
            QuestionOption option = new QuestionOption();
            option.setMcqQuestion(q);
            option.setOptionText(opt.text());
            option.setCorrect(opt.correct());
            q.getOptions().add(option);
        });
        return q;
    }

    private void applyTypeSpecificUpdate(Question question, QuestionRequest req) {
        if (question instanceof McqQuestion mcq) {
            validateMcqOptions(req);
            mcq.getOptions().clear();
            req.options().forEach(opt -> {
                QuestionOption option = new QuestionOption();
                option.setMcqQuestion(mcq);
                option.setOptionText(opt.text());
                option.setCorrect(opt.correct());
                mcq.getOptions().add(option);
            });
        } else if (question instanceof CodeSubmissionQuestion csq) {
            csq.setLanguageHint(req.languageHint());
        }
    }

    private void validateMcqOptions(QuestionRequest req) {
        List<?> options = req.options();
        if (options == null || options.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MCQ requires at least 2 options");
        }
        long correctCount = req.options().stream().filter(QuestionOptionRequest::correct).count();
        if (correctCount != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MCQ must have exactly 1 correct option");
        }
    }

    private Class<?> resolveTypeClass(String type) {
        if (type == null) return null;
        return switch (type.toUpperCase()) {
            case "MCQ" -> McqQuestion.class;
            case "TEXT" -> TextQuestion.class;
            case "CODE_SUBMISSION" -> CodeSubmissionQuestion.class;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown type: " + type);
        };
    }

    private Question requireQuestion(UUID id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
    }

    QuestionResponse toResponse(Question q) {
        List<QuestionOptionResponse> options = null;
        String languageHint = null;

        if (q instanceof McqQuestion mcq) {
            options = mcq.getOptions().stream()
                    .map(o -> new QuestionOptionResponse(o.getId(), o.getOptionText(), o.isCorrect()))
                    .toList();
        } else if (q instanceof CodeSubmissionQuestion csq) {
            languageHint = csq.getLanguageHint();
        }

        List<String> tags = q.getTags().stream().map(Tag::getName).sorted().toList();

        return new QuestionResponse(
                q.getId(), q.getType(), q.getTitle(), q.getBody(),
                tags, options, languageHint, q.getCreatedAt(), q.getUpdatedAt()
        );
    }
}
