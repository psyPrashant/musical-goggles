-- EP-03: Assessment Builder — assessments table
CREATE TABLE assessments (
    id                  UUID         NOT NULL DEFAULT gen_random_uuid(),
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    time_limit_minutes  INT          NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    created_by          UUID         NOT NULL REFERENCES users (id),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT assessments_pk PRIMARY KEY (id)
);
