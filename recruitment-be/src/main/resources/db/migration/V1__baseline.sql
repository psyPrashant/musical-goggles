-- ============================================================
-- V1: Baseline schema — Sprint 1
-- ============================================================

-- Spring Session JDBC tables (replaces db/init.sql)
CREATE TABLE IF NOT EXISTS SPRING_SESSION (
    PRIMARY_ID            CHAR(36) NOT NULL,
    SESSION_ID            CHAR(36) NOT NULL,
    CREATION_TIME         BIGINT   NOT NULL,
    LAST_ACCESS_TIME      BIGINT   NOT NULL,
    MAX_INACTIVE_INTERVAL INT      NOT NULL,
    EXPIRY_TIME           BIGINT   NOT NULL,
    PRINCIPAL_NAME        VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);

CREATE UNIQUE INDEX IF NOT EXISTS SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX IF NOT EXISTS SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX IF NOT EXISTS SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE IF NOT EXISTS SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36)     NOT NULL,
    ATTRIBUTE_NAME     VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES    BYTEA        NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID)
        REFERENCES SPRING_SESSION (PRIMARY_ID) ON DELETE CASCADE
);

-- ============================================================
-- EP-01: Auth & Access Control
-- ============================================================

CREATE TABLE users (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'RECRUITER', 'CANDIDATE')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT users_pk PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email)
);

-- ============================================================
-- EP-02: Question Bank
-- ============================================================

CREATE TABLE questions (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    title        VARCHAR(500) NOT NULL,
    body         TEXT         NOT NULL,
    type         VARCHAR(30)  NOT NULL CHECK (type IN ('MCQ', 'TEXT', 'CODE_SUBMISSION')),
    created_by   UUID         NOT NULL REFERENCES users (id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT questions_pk PRIMARY KEY (id)
);

CREATE TABLE mcq_questions (
    id UUID NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    CONSTRAINT mcq_questions_pk PRIMARY KEY (id)
);

CREATE TABLE question_options (
    id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    mcq_question_id UUID         NOT NULL REFERENCES mcq_questions (id) ON DELETE CASCADE,
    option_text     TEXT         NOT NULL,
    is_correct      BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT question_options_pk PRIMARY KEY (id)
);

CREATE TABLE text_questions (
    id UUID NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    CONSTRAINT text_questions_pk PRIMARY KEY (id)
);

CREATE TABLE code_submission_questions (
    id            UUID         NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    language_hint VARCHAR(100),
    CONSTRAINT code_submission_questions_pk PRIMARY KEY (id)
);

CREATE TABLE question_groups (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    is_structured BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT question_groups_pk PRIMARY KEY (id),
    CONSTRAINT question_groups_name_unique UNIQUE (name)
);

CREATE TABLE question_group_items (
    id            UUID        NOT NULL DEFAULT gen_random_uuid(),
    group_id      UUID        NOT NULL REFERENCES question_groups (id) ON DELETE CASCADE,
    question_id   UUID        NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    display_order INT,
    CONSTRAINT question_group_items_pk PRIMARY KEY (id),
    CONSTRAINT question_group_items_unique UNIQUE (group_id, question_id)
);

CREATE TABLE tags (
    id   UUID         NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    CONSTRAINT tags_pk PRIMARY KEY (id),
    CONSTRAINT tags_name_unique UNIQUE (name)
);

CREATE TABLE question_tags (
    question_id UUID NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    CONSTRAINT question_tags_pk PRIMARY KEY (question_id, tag_id)
);
