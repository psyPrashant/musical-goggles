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
                q.setStarterCode(blankToNull(req.starterCode()));
                q.setStarterCodeJava(blankToNull(req.starterCodeJava()));
                q.setStarterCodeCsharp(blankToNull(req.starterCodeCsharp()));
                q.setStarterCodePython(blankToNull(req.starterCodePython()));
                applyTestCases(q, req.testCases());
                yield q;
            }
            case GROUP -> buildGroup(req);
        };
    }

    private GroupQuestion buildGroup(QuestionRequest req) {
        List<UUID> memberIds = req.memberQuestionIds();
        if (memberIds == null || memberIds.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "GROUP question must have at least 2 member questions");
        }
        GroupQuestion gq = new GroupQuestion();
        gq.setTitle(req.title());
        gq.setBody(req.body());
        for (int i = 0; i < memberIds.size(); i++) {
            UUID memberId = memberIds.get(i);
            Question member = questionRepository.findById(memberId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Member question not found: " + memberId));
            if (member.getType() == QuestionType.GROUP) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Nested GROUP questions are not supported");
            }
            GroupQuestionMember m = new GroupQuestionMember();
            m.setGroupQuestion(gq);
            m.setQuestion(member);
            m.setDisplayOrder(i);
            gq.getMembers().add(m);
        }
        return gq;
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
            csq.setStarterCode(blankToNull(req.starterCode()));
            csq.setStarterCodeJava(blankToNull(req.starterCodeJava()));
            csq.setStarterCodeCsharp(blankToNull(req.starterCodeCsharp()));
            csq.setStarterCodePython(blankToNull(req.starterCodePython()));
            applyTestCases(csq, req.testCases());
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
            case "GROUP" -> GroupQuestion.class;
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
        String starterCode = null;
        List<CodeTestCaseResponse> testCases = null;
        List<QuestionResponse> memberQuestions = null;

        if (q instanceof McqQuestion mcq) {
            options = mcq.getOptions().stream()
                    .map(o -> new QuestionOptionResponse(o.getId(), o.getOptionText(), o.isCorrect()))
                    .toList();
        } else if (q instanceof CodeSubmissionQuestion csq) {
            languageHint = csq.getLanguageHint();
            starterCode = csq.getStarterCode();
            testCases = csq.getTestCases().stream()
                    .map(tc -> new CodeTestCaseResponse(
                            tc.getId(), tc.getDescription(), tc.getStdin(),
                            tc.getExpectedOutput(), tc.isVisible(), tc.getDisplayOrder(),
                            tc.isRunOnlyOnSubmit()))
                    .toList();
        } else if (q instanceof GroupQuestion gq) {
            memberQuestions = gq.getMembers().stream()
                    .map(m -> toResponse((Question) org.hibernate.Hibernate.unproxy(m.getQuestion())))
                    .toList();
        }

        List<String> tags = q.getTags().stream().map(Tag::getName).sorted().toList();

        String starterCodeJava = null;
        String starterCodeCsharp = null;
        String starterCodePython = null;
        if (q instanceof CodeSubmissionQuestion csq) {
            starterCodeJava = csq.getStarterCodeJava();
            starterCodeCsharp = csq.getStarterCodeCsharp();
            starterCodePython = csq.getStarterCodePython();
        }

        return new QuestionResponse(
                q.getId(), q.getType(), q.getTitle(), q.getBody(),
                tags, options, languageHint, memberQuestions, q.getCreatedAt(), q.getUpdatedAt(),
                starterCode, testCases, starterCodeJava, starterCodeCsharp, starterCodePython
        );
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private void applyTestCases(CodeSubmissionQuestion q, List<CodeTestCaseRequest> cases) {
        q.getTestCases().clear();
        if (cases == null || cases.isEmpty()) return;
        for (CodeTestCaseRequest req : cases) {
            CodeTestCase tc = new CodeTestCase();
            tc.setQuestion(q);   // bidirectional back-reference — Hibernate needs this to set the FK on INSERT
            tc.setDescription(req.description());
            tc.setStdin(req.stdin());
            tc.setExpectedOutput(req.expectedOutput());
            tc.setVisible(req.visible());
            tc.setDisplayOrder(req.displayOrder());
            tc.setRunOnlyOnSubmit(req.runOnlyOnSubmit());
            q.getTestCases().add(tc);
        }
    }
}
