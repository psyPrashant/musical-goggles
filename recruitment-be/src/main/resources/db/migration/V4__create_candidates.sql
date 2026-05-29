-- EP-05: Candidate Invitation — candidates table
CREATE TABLE candidates (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name  VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES users (id),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT candidates_pk    PRIMARY KEY (id),
    CONSTRAINT candidates_email UNIQUE (email)
);
