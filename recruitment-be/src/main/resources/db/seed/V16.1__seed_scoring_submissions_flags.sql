-- ============================================================
-- V16.1: Scoring, difficulty, submissions, answers, scores, flags
-- Idempotent UPDATE statements for scoring/difficulty.
-- Idempotent INSERTs (ON CONFLICT DO NOTHING) for all new rows.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Update question difficulty and max_score
--    MCQ = 1 pt  |  TEXT = 5 or 10 pts  |  CODE = 5 or 10 pts
-- ────────────────────────────────────────────────────────────

-- MCQ questions (1 pt each)
UPDATE questions SET difficulty = 'EASY',   max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000001'; -- Big-O Binary Search
UPDATE questions SET difficulty = 'EASY',   max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000002'; -- Hash Map Lookup
UPDATE questions SET difficulty = 'MEDIUM', max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000003'; -- OOP Polymorphism
UPDATE questions SET difficulty = 'EASY',   max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000004'; -- SQL INNER JOIN
UPDATE questions SET difficulty = 'MEDIUM', max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000005'; -- Git Rebase
UPDATE questions SET difficulty = 'MEDIUM', max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000006'; -- HTTP Idempotency
UPDATE questions SET difficulty = 'HARD',   max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000007'; -- Binary Trees Node Count
UPDATE questions SET difficulty = 'EASY',   max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000008'; -- SQL HAVING
UPDATE questions SET difficulty = 'EASY',   max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000009'; -- Stack vs Queue
UPDATE questions SET difficulty = 'MEDIUM', max_score = 1  WHERE id = '00000000-0000-0000-0002-00000000000a'; -- Java final keyword
UPDATE questions SET difficulty = 'MEDIUM', max_score = 1  WHERE id = '00000000-0000-0000-0002-00000000000b'; -- Singleton Pattern
UPDATE questions SET difficulty = 'MEDIUM', max_score = 1  WHERE id = '00000000-0000-0000-0002-00000000000c'; -- REST Statelessness
UPDATE questions SET difficulty = 'EASY',   max_score = 1  WHERE id = '00000000-0000-0000-0002-00000000000d'; -- Linked List vs Array
UPDATE questions SET difficulty = 'MEDIUM', max_score = 1  WHERE id = '00000000-0000-0000-0002-00000000000e'; -- Checked vs Unchecked
UPDATE questions SET difficulty = 'HARD',   max_score = 1  WHERE id = '00000000-0000-0000-0002-00000000000f'; -- SQL Subquery vs JOIN
UPDATE questions SET difficulty = 'EASY',   max_score = 1  WHERE id = '00000000-0000-0000-0002-000000000010'; -- Bubble Sort

-- TEXT questions
UPDATE questions SET difficulty = 'MEDIUM', max_score = 5  WHERE id = '00000000-0000-0000-0004-000000000001'; -- Design Patterns Factory
UPDATE questions SET difficulty = 'MEDIUM', max_score = 5  WHERE id = '00000000-0000-0000-0004-000000000002'; -- SOLID Principles
UPDATE questions SET difficulty = 'MEDIUM', max_score = 5  WHERE id = '00000000-0000-0000-0004-000000000003'; -- REST vs GraphQL
UPDATE questions SET difficulty = 'MEDIUM', max_score = 5  WHERE id = '00000000-0000-0000-0004-000000000004'; -- Database Normalisation 3NF
UPDATE questions SET difficulty = 'HARD',   max_score = 10 WHERE id = '00000000-0000-0000-0004-000000000005'; -- System Design URL Shortener
UPDATE questions SET difficulty = 'HARD',   max_score = 10 WHERE id = '00000000-0000-0000-0004-000000000006'; -- Microservices vs Monolith
UPDATE questions SET difficulty = 'HARD',   max_score = 10 WHERE id = '00000000-0000-0000-0004-000000000007'; -- Java Concurrency
UPDATE questions SET difficulty = 'MEDIUM', max_score = 5  WHERE id = '00000000-0000-0000-0004-000000000008'; -- Test-Driven Development
UPDATE questions SET difficulty = 'HARD',   max_score = 10 WHERE id = '00000000-0000-0000-0004-000000000009'; -- CAP Theorem

-- CODE questions
UPDATE questions SET difficulty = 'MEDIUM', max_score = 10 WHERE id = '00000000-0000-0000-0005-000000000001'; -- Binary Search
UPDATE questions SET difficulty = 'HARD',   max_score = 10 WHERE id = '00000000-0000-0000-0005-000000000002'; -- Flatten Nested List
UPDATE questions SET difficulty = 'MEDIUM', max_score = 10 WHERE id = '00000000-0000-0000-0005-000000000003'; -- SQL Top 3 Categories
UPDATE questions SET difficulty = 'EASY',   max_score = 5  WHERE id = '00000000-0000-0000-0005-000000000004'; -- Reverse a String
UPDATE questions SET difficulty = 'MEDIUM', max_score = 10 WHERE id = '00000000-0000-0000-0005-000000000005'; -- Two Sum
UPDATE questions SET difficulty = 'EASY',   max_score = 5  WHERE id = '00000000-0000-0000-0005-000000000006'; -- Find Duplicate Values
UPDATE questions SET difficulty = 'HARD',   max_score = 10 WHERE id = '00000000-0000-0000-0005-000000000007'; -- Detect Cycle in Linked List
UPDATE questions SET difficulty = 'HARD',   max_score = 10 WHERE id = '00000000-0000-0000-0005-000000000008'; -- SQL Employee Dept Report

-- ────────────────────────────────────────────────────────────
-- 2. Candidate invitations (all COMPLETED — submission exists)
-- ────────────────────────────────────────────────────────────
INSERT INTO candidate_invitations (id, candidate_id, assessment_id, invitation_token, status, expires_at, created_at)
VALUES
    -- Alice → Junior Backend Developer
    ('00000000-0000-0000-000b-000000000001',
     '00000000-0000-0000-000a-000000000001',
     '00000000-0000-0000-0008-000000000001',
     'inv-alice-junior-backend-001', 'COMPLETED',
     '2026-05-16 09:00:00+00', '2026-05-14 08:00:00+00'),

    -- Bob → Junior Backend Developer
    ('00000000-0000-0000-000b-000000000002',
     '00000000-0000-0000-000a-000000000002',
     '00000000-0000-0000-0008-000000000001',
     'inv-bob-junior-backend-001', 'COMPLETED',
     '2026-05-17 09:00:00+00', '2026-05-14 08:30:00+00'),

    -- Carol → Senior Full Stack Engineer
    ('00000000-0000-0000-000b-000000000003',
     '00000000-0000-0000-000a-000000000003',
     '00000000-0000-0000-0008-000000000002',
     'inv-carol-senior-fullstack-001', 'COMPLETED',
     '2026-05-18 10:00:00+00', '2026-05-15 09:00:00+00'),

    -- David → Java Backend Engineer
    ('00000000-0000-0000-000b-000000000004',
     '00000000-0000-0000-000a-000000000004',
     '00000000-0000-0000-0008-000000000005',
     'inv-david-java-backend-001', 'COMPLETED',
     '2026-05-19 11:00:00+00', '2026-05-16 10:00:00+00'),

    -- Emma → Frontend JavaScript Developer
    ('00000000-0000-0000-000b-000000000005',
     '00000000-0000-0000-000a-000000000005',
     '00000000-0000-0000-0008-000000000004',
     'inv-emma-frontend-js-001', 'COMPLETED',
     '2026-05-20 14:00:00+00', '2026-05-17 13:00:00+00'),

    -- Frank → Senior Full Stack Engineer
    ('00000000-0000-0000-000b-000000000006',
     '00000000-0000-0000-000a-000000000006',
     '00000000-0000-0000-0008-000000000002',
     'inv-frank-senior-fullstack-001', 'COMPLETED',
     '2026-05-21 09:00:00+00', '2026-05-18 08:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. Candidate submissions
-- ────────────────────────────────────────────────────────────
INSERT INTO candidate_submissions (id, candidate_id, assessment_id, invitation_id, status, started_at, submitted_at, created_at)
VALUES
    -- Sub 1: Alice — Junior Backend Developer — good score (20/25)
    ('00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-000a-000000000001',
     '00000000-0000-0000-0008-000000000001',
     '00000000-0000-0000-000b-000000000001',
     'SUBMITTED', '2026-05-15 09:00:00+00', '2026-05-15 10:05:00+00', '2026-05-15 09:00:00+00'),

    -- Sub 2: Bob — Junior Backend Developer — low score (7/25), flagged COPIED_ANSWERS
    ('00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-000a-000000000002',
     '00000000-0000-0000-0008-000000000001',
     '00000000-0000-0000-000b-000000000002',
     'SUBMITTED', '2026-05-16 14:00:00+00', '2026-05-16 14:28:00+00', '2026-05-16 14:00:00+00'),

    -- Sub 3: Carol — Senior Full Stack Engineer — high score (30/34)
    ('00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-000a-000000000003',
     '00000000-0000-0000-0008-000000000002',
     '00000000-0000-0000-000b-000000000003',
     'SUBMITTED', '2026-05-17 10:00:00+00', '2026-05-17 11:25:00+00', '2026-05-17 10:00:00+00'),

    -- Sub 4: David — Java Backend Engineer — decent score (29/44), TIMING_ANOMALY flag
    ('00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-000a-000000000004',
     '00000000-0000-0000-0008-000000000005',
     '00000000-0000-0000-000b-000000000004',
     'SUBMITTED', '2026-05-18 11:00:00+00', '2026-05-18 11:18:00+00', '2026-05-18 11:00:00+00'),

    -- Sub 5: Emma — Frontend JavaScript — AUTO_SUBMITTED at time limit (13/21)
    ('00000000-0000-0000-000c-000000000005',
     '00000000-0000-0000-000a-000000000005',
     '00000000-0000-0000-0008-000000000004',
     '00000000-0000-0000-000b-000000000005',
     'AUTO_SUBMITTED', '2026-05-19 14:00:00+00', '2026-05-19 15:00:00+00', '2026-05-19 14:00:00+00'),

    -- Sub 6: Frank — Senior Full Stack Engineer — average score (18/34), AI_GENERATED flag RESOLVED
    ('00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-000a-000000000006',
     '00000000-0000-0000-0008-000000000002',
     '00000000-0000-0000-000b-000000000006',
     'SUBMITTED', '2026-05-20 09:00:00+00', '2026-05-20 10:30:00+00', '2026-05-20 09:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 4. Candidate answers
--    selected_option_ids stored as JSON array string e.g. '["uuid"]'
--    is_draft = false for all (submitted answers)
-- ────────────────────────────────────────────────────────────

-- ── Sub 1: Alice — Junior Backend Developer ──────────────────
-- Assessment 1 questions: Q1, Q2, Q4, Q5, Q7 (MCQ), T1, T4 (TEXT), C1 (CODE)
INSERT INTO candidate_answers (id, submission_id, question_id, selected_option_ids, text_content, is_draft, saved_at)
VALUES
    -- Q1 Big-O Binary Search → correct: O(log n)
    ('00000000-0000-0000-000d-000000000001',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0002-000000000001',
     '["00000000-0000-0000-0003-000000000002"]', NULL, false,
     '2026-05-15 10:02:00+00'),

    -- Q2 Hash Map Lookup → correct: O(1)
    ('00000000-0000-0000-000d-000000000002',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0002-000000000002',
     '["00000000-0000-0000-0003-000000000005"]', NULL, false,
     '2026-05-15 10:02:00+00'),

    -- Q4 INNER JOIN → correct: Returns no rows
    ('00000000-0000-0000-000d-000000000003',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0002-000000000004',
     '["00000000-0000-0000-0003-000000000015"]', NULL, false,
     '2026-05-15 10:03:00+00'),

    -- Q5 Git Rebase → WRONG: git merge selected
    ('00000000-0000-0000-000d-000000000004',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0002-000000000005',
     '["00000000-0000-0000-0003-000000000017"]', NULL, false,
     '2026-05-15 10:03:00+00'),

    -- Q7 Binary Trees → correct: 2^d
    ('00000000-0000-0000-000d-000000000005',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0002-000000000007',
     '["00000000-0000-0000-0003-000000000027"]', NULL, false,
     '2026-05-15 10:04:00+00'),

    -- T1 Design Patterns: Factory
    ('00000000-0000-0000-000d-000000000006',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0004-000000000001',
     NULL,
     'The Factory pattern is a creational design pattern that provides an interface for creating objects without specifying the exact class. It solves the problem of tight coupling between the creator and the concrete products. For example, in a payment processing system you might use a PaymentFactory that returns either a CreditCardProcessor or a PaypalProcessor based on the payment type. The client code works only with the abstract interface, so adding new payment methods does not require changing existing code.',
     false, '2026-05-15 10:40:00+00'),

    -- T4 Database Normalisation 3NF
    ('00000000-0000-0000-000d-000000000007',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0004-000000000004',
     NULL,
     'Third Normal Form requires that a table is in 2NF and that all non-key attributes depend only on the primary key — no transitive dependencies. For example: OrderDetails(order_id, product_id, product_name, supplier_id, supplier_city) violates 3NF because supplier_city depends on supplier_id, not on the primary key. To normalise, we split into OrderDetails(order_id, product_id, supplier_id) and Suppliers(supplier_id, supplier_city). This eliminates update anomalies where changing a supplier city would require updating every order row.',
     false, '2026-05-15 10:58:00+00'),

    -- C1 Binary Search
    ('00000000-0000-0000-000d-000000000008',
     '00000000-0000-0000-000c-000000000001',
     '00000000-0000-0000-0005-000000000001',
     NULL,
     'public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}',
     false, '2026-05-15 10:04:00+00')
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- ── Sub 2: Bob — Junior Backend Developer (flagged) ──────────
INSERT INTO candidate_answers (id, submission_id, question_id, selected_option_ids, text_content, is_draft, saved_at)
VALUES
    -- Q1 → WRONG: O(1)
    ('00000000-0000-0000-000d-000000000009',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0002-000000000001',
     '["00000000-0000-0000-0003-000000000001"]', NULL, false,
     '2026-05-16 14:20:00+00'),

    -- Q2 → WRONG: O(n)
    ('00000000-0000-0000-000d-00000000000a',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0002-000000000002',
     '["00000000-0000-0000-0003-000000000007"]', NULL, false,
     '2026-05-16 14:20:00+00'),

    -- Q4 → WRONG: Returns all rows from left table
    ('00000000-0000-0000-000d-00000000000b',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0002-000000000004',
     '["00000000-0000-0000-0003-000000000013"]', NULL, false,
     '2026-05-16 14:21:00+00'),

    -- Q5 → WRONG: git merge
    ('00000000-0000-0000-000d-00000000000c',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0002-000000000005',
     '["00000000-0000-0000-0003-000000000017"]', NULL, false,
     '2026-05-16 14:22:00+00'),

    -- Q7 → correct: 2^d
    ('00000000-0000-0000-000d-00000000000d',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0002-000000000007',
     '["00000000-0000-0000-0003-000000000027"]', NULL, false,
     '2026-05-16 14:22:00+00'),

    -- T1 — thin answer, suspiciously similar wording to Alice
    ('00000000-0000-0000-000d-00000000000e',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0004-000000000001',
     NULL,
     'Factory pattern creates objects. It is used to decouple creation from use. You can add new types without changing the client.',
     false, '2026-05-16 14:25:00+00'),

    -- T4 — thin answer
    ('00000000-0000-0000-000d-00000000000f',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0004-000000000004',
     NULL,
     '3NF means no transitive dependencies. Split tables so each column depends only on the key.',
     false, '2026-05-16 14:26:00+00'),

    -- C1 — incomplete implementation
    ('00000000-0000-0000-000d-000000000010',
     '00000000-0000-0000-000c-000000000002',
     '00000000-0000-0000-0005-000000000001',
     NULL,
     'public int binarySearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}',
     false, '2026-05-16 14:27:00+00')
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- ── Sub 3: Carol — Senior Full Stack Engineer ─────────────────
-- Assessment 2: Q3, Q6, Q7, Q8 (MCQ), T2, T3, T5 (TEXT), C2 (CODE)
INSERT INTO candidate_answers (id, submission_id, question_id, selected_option_ids, text_content, is_draft, saved_at)
VALUES
    -- Q3 OOP Polymorphism → correct
    ('00000000-0000-0000-000d-000000000011',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0002-000000000003',
     '["00000000-0000-0000-0003-000000000010"]', NULL, false,
     '2026-05-17 11:20:00+00'),

    -- Q6 HTTP Idempotency → correct: PUT
    ('00000000-0000-0000-000d-000000000012',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0002-000000000006',
     '["00000000-0000-0000-0003-000000000023"]', NULL, false,
     '2026-05-17 11:20:00+00'),

    -- Q7 Binary Trees → WRONG: 2d
    ('00000000-0000-0000-000d-000000000013',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0002-000000000007',
     '["00000000-0000-0000-0003-000000000026"]', NULL, false,
     '2026-05-17 11:21:00+00'),

    -- Q8 SQL HAVING → correct
    ('00000000-0000-0000-000d-000000000014',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0002-000000000008',
     '["00000000-0000-0000-0003-000000000030"]', NULL, false,
     '2026-05-17 11:21:00+00'),

    -- T2 SOLID Principles — excellent answer
    ('00000000-0000-0000-000d-000000000015',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0004-000000000002',
     NULL,
     'SOLID: Single Responsibility — a class should have one reason to change (e.g. separate UserRepository from EmailService). Open/Closed — classes open for extension, closed for modification; use abstractions so new behaviour is added via new classes, not edits. Liskov Substitution — subtypes must be substitutable for base types without breaking correctness. Interface Segregation — prefer narrow interfaces over fat ones. Dependency Inversion — high-level modules depend on abstractions, not concretions.

SRP example: a ReportGenerator that both fetches data and formats HTML violates SRP; split into DataFetcher and ReportFormatter.
OCP example: a discount system that hard-codes if/else for each discount type violates OCP; define a Discount interface and add new discount classes without touching existing ones.',
     false, '2026-05-17 11:10:00+00'),

    -- T3 REST vs GraphQL — excellent answer
    ('00000000-0000-0000-000d-000000000016',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0004-000000000003',
     NULL,
     'REST exposes resources as URLs with standard HTTP verbs; GraphQL exposes a single endpoint where clients describe exactly what data they need. Key trade-offs for a mobile client hitting multiple backends: REST may cause over-fetching (too many fields) or under-fetching (needing multiple round-trips), which is costly on mobile. GraphQL solves both with a single query. However, GraphQL introduces query complexity management, caching is harder (queries are POST), and tooling/error handling is more involved. For a mobile app with varied screens consuming data from 3+ services, GraphQL with a backend-for-frontend layer would reduce round-trips and payload size significantly.',
     false, '2026-05-17 11:18:00+00'),

    -- T5 System Design URL Shortener — very good answer
    ('00000000-0000-0000-000d-000000000017',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0004-000000000005',
     NULL,
     'Components: API servers, a URL mapping service, a distributed key-value store (Redis/DynamoDB), and a redirect CDN. Data model: {shortCode: string PK, longUrl: string, createdAt, userId}. Short code generation: base62 encode a distributed counter (Snowflake ID) or use a random 6-char code with collision check. Read path: client hits short URL → CDN cache → if miss, lookup store → 301/302 redirect. Write path: generate code, write to primary, async replicate. Trade-offs: 301 (permanent) caches at browser reducing load but prevents analytics; 302 (temp) allows tracking every click. Collisions: rare with 62^7 = ~3.5T codes; can retry with a new code if collision detected.',
     false, '2026-05-17 11:22:00+00'),

    -- C2 Flatten Nested List — great solution
    ('00000000-0000-0000-000d-000000000018',
     '00000000-0000-0000-000c-000000000003',
     '00000000-0000-0000-0005-000000000002',
     NULL,
     'def flatten(nested):
    result = []
    def helper(lst):
        for item in lst:
            if isinstance(item, list):
                helper(item)
            else:
                result.append(item)
    helper(nested)
    return result

# Alternatively using a generator:
def flatten_gen(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten_gen(item)
        else:
            yield item',
     false, '2026-05-17 11:24:00+00')
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- ── Sub 4: David — Java Backend Engineer (TIMING_ANOMALY) ────
-- Assessment 5: Q10, Q14, Q16 (MCQ), T7, T9 (TEXT), C5, C7 (CODE)
INSERT INTO candidate_answers (id, submission_id, question_id, selected_option_ids, text_content, is_draft, saved_at)
VALUES
    -- Q10 Java final keyword → correct: cannot be extended
    ('00000000-0000-0000-000d-000000000019',
     '00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-0002-00000000000a',
     '["00000000-0000-0000-0003-000000000038"]', NULL, false,
     '2026-05-18 11:15:00+00'),

    -- Q14 Checked vs Unchecked → correct: must be caught or declared
    ('00000000-0000-0000-000d-00000000001a',
     '00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-0002-00000000000e',
     '["00000000-0000-0000-0003-000000000048"]', NULL, false,
     '2026-05-18 11:15:00+00'),

    -- Q16 Bubble Sort → correct: O(n²)
    ('00000000-0000-0000-000d-00000000001b',
     '00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-0002-000000000010',
     '["00000000-0000-0000-0003-000000000051"]', NULL, false,
     '2026-05-18 11:16:00+00'),

    -- T7 Java Concurrency — decent but light
    ('00000000-0000-0000-000d-00000000001c',
     '00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-0004-000000000007',
     NULL,
     'Thread extends Thread class or implements Runnable; Runnable is preferred as it allows extending other classes. Race condition: multiple threads access shared state without synchronisation — fix with synchronized blocks or AtomicInteger. Deadlock: two threads each hold a lock the other needs — fix with consistent lock ordering or tryLock. Thread starvation: low-priority threads never get CPU — fix with fair locks (ReentrantLock with fairness=true). Java tools: synchronized, volatile, java.util.concurrent (locks, executors, atomic classes).',
     false, '2026-05-18 11:16:00+00'),

    -- T9 CAP Theorem — decent
    ('00000000-0000-0000-000d-00000000001d',
     '00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-0004-000000000009',
     NULL,
     'CAP states a distributed system can only guarantee two of Consistency, Availability, and Partition Tolerance simultaneously. Since network partitions are inevitable in practice, the real choice is CP vs AP. CP example: Apache ZooKeeper — during a partition it refuses writes to stay consistent. AP example: Apache Cassandra — during a partition it continues serving reads/writes, accepting eventual consistency. The tradeoff is whether your system can tolerate stale reads (AP) or must reject requests to stay accurate (CP).',
     false, '2026-05-18 11:17:00+00'),

    -- C5 Two Sum — correct O(n) solution
    ('00000000-0000-0000-000d-00000000001e',
     '00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-0005-000000000005',
     NULL,
     'public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {
            return new int[]{seen.get(complement), i};
        }
        seen.put(nums[i], i);
    }
    throw new IllegalArgumentException("No solution found");
}',
     false, '2026-05-18 11:17:00+00'),

    -- C7 Detect Cycle — Floyd algorithm, partial (missing null checks)
    ('00000000-0000-0000-000d-00000000001f',
     '00000000-0000-0000-000c-000000000004',
     '00000000-0000-0000-0005-000000000007',
     NULL,
     'def hasCycle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False',
     false, '2026-05-18 11:18:00+00')
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- ── Sub 5: Emma — Frontend JavaScript Developer (AUTO_SUBMITTED) ──
-- Assessment 4: Q6, Q9, Q12 (MCQ), T3, T8 (TEXT), C6 (CODE)
INSERT INTO candidate_answers (id, submission_id, question_id, selected_option_ids, text_content, is_draft, saved_at)
VALUES
    -- Q6 HTTP Idempotency → correct: PUT
    ('00000000-0000-0000-000d-000000000020',
     '00000000-0000-0000-000c-000000000005',
     '00000000-0000-0000-0002-000000000006',
     '["00000000-0000-0000-0003-000000000023"]', NULL, false,
     '2026-05-19 14:55:00+00'),

    -- Q9 Stack vs Queue → WRONG: Stack follows FIFO
    ('00000000-0000-0000-000d-000000000021',
     '00000000-0000-0000-000c-000000000005',
     '00000000-0000-0000-0002-000000000009',
     '["00000000-0000-0000-0003-000000000034"]', NULL, false,
     '2026-05-19 14:55:00+00'),

    -- Q12 REST Statelessness → correct
    ('00000000-0000-0000-000d-000000000022',
     '00000000-0000-0000-000c-000000000005',
     '00000000-0000-0000-0002-00000000000c',
     '["00000000-0000-0000-0003-000000000040"]', NULL, false,
     '2026-05-19 14:56:00+00'),

    -- T3 REST vs GraphQL — good answer
    ('00000000-0000-0000-000d-000000000023',
     '00000000-0000-0000-000c-000000000005',
     '00000000-0000-0000-0004-000000000003',
     NULL,
     'REST uses resource-based URLs and HTTP verbs. GraphQL uses a single endpoint with typed queries. For a mobile client hitting multiple services, REST may require multiple network calls and returns more data than needed. GraphQL lets the client request exactly the fields it needs in one query. Downside: GraphQL is harder to cache, requires schema management, and has a steeper learning curve. I would consider GraphQL when the client has very specific data shape requirements across multiple data sources.',
     false, '2026-05-19 14:50:00+00'),

    -- T8 TDD
    ('00000000-0000-0000-000d-000000000024',
     '00000000-0000-0000-000c-000000000005',
     '00000000-0000-0000-0004-000000000008',
     NULL,
     'TDD Red-Green-Refactor: Red — write a failing test that defines expected behaviour. Green — write the minimum code to make the test pass. Refactor — clean up the code without breaking tests. Benefits: forces clear requirements upfront, acts as living documentation, and gives confidence during refactoring. Common pitfalls: writing tests after code, testing implementation details instead of behaviour, and slow test suites discouraging frequent runs.',
     false, '2026-05-19 14:57:00+00'),

    -- C6 Find Duplicate Values — correct solution
    ('00000000-0000-0000-000d-000000000025',
     '00000000-0000-0000-000c-000000000005',
     '00000000-0000-0000-0005-000000000006',
     NULL,
     'function findDuplicates(arr) {
    const seen = new Set();
    const duplicates = new Set();
    for (const val of arr) {
        if (seen.has(val)) duplicates.add(val);
        else seen.add(val);
    }
    return [...duplicates];
}',
     false, '2026-05-19 14:59:00+00')
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- ── Sub 6: Frank — Senior Full Stack Engineer (AI_GENERATED, RESOLVED) ──
-- Assessment 2: Q3, Q6, Q7, Q8 (MCQ), T2, T3, T5 (TEXT), C2 (CODE)
INSERT INTO candidate_answers (id, submission_id, question_id, selected_option_ids, text_content, is_draft, saved_at)
VALUES
    -- Q3 OOP Polymorphism → WRONG: "ability to hide internal implementation"
    ('00000000-0000-0000-000d-000000000026',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0002-000000000003',
     '["00000000-0000-0000-0003-000000000009"]', NULL, false,
     '2026-05-20 10:28:00+00'),

    -- Q6 HTTP Idempotency → correct: PUT
    ('00000000-0000-0000-000d-000000000027',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0002-000000000006',
     '["00000000-0000-0000-0003-000000000023"]', NULL, false,
     '2026-05-20 10:28:00+00'),

    -- Q7 Binary Trees → correct: 2^d
    ('00000000-0000-0000-000d-000000000028',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0002-000000000007',
     '["00000000-0000-0000-0003-000000000027"]', NULL, false,
     '2026-05-20 10:29:00+00'),

    -- Q8 SQL HAVING → WRONG: WHERE
    ('00000000-0000-0000-000d-000000000029',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0002-000000000008',
     '["00000000-0000-0000-0003-000000000029"]', NULL, false,
     '2026-05-20 10:29:00+00'),

    -- T2 SOLID — suspiciously fluent, AI-like
    ('00000000-0000-0000-000d-00000000002a',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0004-000000000002',
     NULL,
     'The SOLID principles are a cornerstone of object-oriented software engineering, providing a framework for writing clean, maintainable, and extensible code. Single Responsibility Principle dictates that each class should encapsulate a single concern. Open/Closed Principle advocates that software entities should be open for extension but closed for modification, achieved through abstraction and polymorphism. Liskov Substitution ensures semantic consistency across inheritance hierarchies. Interface Segregation prevents the accumulation of unrelated methods in a single interface. Finally, Dependency Inversion decouples high-level business logic from low-level implementation details.',
     false, '2026-05-20 10:10:00+00'),

    -- T3 REST vs GraphQL — AI-like, correct but generic
    ('00000000-0000-0000-000d-00000000002b',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0004-000000000003',
     NULL,
     'REST (Representational State Transfer) is an architectural style leveraging HTTP semantics and resource-centric endpoints. GraphQL, developed by Facebook, introduces a query language that enables clients to request precisely the data they require, eliminating over-fetching and under-fetching. For mobile clients integrating with disparate backend services, GraphQL presents clear advantages: reduced network overhead, a unified schema acting as a contract, and introspective capabilities. However, considerations around caching complexity, query depth attacks, and the learning curve must be weighed against these benefits.',
     false, '2026-05-20 10:20:00+00'),

    -- T5 URL Shortener — AI-like
    ('00000000-0000-0000-000d-00000000002c',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0004-000000000005',
     NULL,
     'A URL shortening service requires careful consideration of multiple architectural components: an ingestion API, a distributed ID generator, a persistent mapping store, and a redirection layer. The core data model consists of a mapping from short code to original URL with associated metadata. Short codes may be generated via base62 encoding of auto-incremented identifiers or through cryptographic hashing with truncation. Scalability is addressed through horizontal scaling of stateless application servers, distributed caching for hot URLs, and database sharding. Collision avoidance is inherently addressed by using unique identifiers as the encoding basis.',
     false, '2026-05-20 10:25:00+00'),

    -- C2 Flatten Nested List — AI-like but works
    ('00000000-0000-0000-000d-00000000002d',
     '00000000-0000-0000-000c-000000000006',
     '00000000-0000-0000-0005-000000000002',
     NULL,
     'def flatten(nested_list):
    """
    Recursively flattens a nested list structure of arbitrary depth.
    Utilises Python''s isinstance for type discrimination and recursive
    accumulation to produce a flat sequence of scalar values.
    """
    flattened = []
    for element in nested_list:
        if isinstance(element, list):
            flattened.extend(flatten(element))
        else:
            flattened.append(element)
    return flattened',
     false, '2026-05-20 10:27:00+00')
ON CONFLICT (submission_id, question_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 5. Answer scores (one row per answered question)
--    admin user ID: 00000000-0000-0000-0000-000000000001
-- ────────────────────────────────────────────────────────────

-- ── Sub 1 scores: Alice (20/25 total) ────────────────────────
INSERT INTO answer_scores (id, candidate_answer_id, score, feedback, marked_by, marked_at, is_auto_marked)
VALUES
    ('00000000-0000-0000-000e-000000000001', '00000000-0000-0000-000d-000000000001', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-15 10:05:10+00', true),   -- Q1 correct
    ('00000000-0000-0000-000e-000000000002', '00000000-0000-0000-000d-000000000002', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-15 10:05:10+00', true),   -- Q2 correct
    ('00000000-0000-0000-000e-000000000003', '00000000-0000-0000-000d-000000000003', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-15 10:05:10+00', true),   -- Q4 correct
    ('00000000-0000-0000-000e-000000000004', '00000000-0000-0000-000d-000000000004', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-15 10:05:10+00', true),   -- Q5 wrong
    ('00000000-0000-0000-000e-000000000005', '00000000-0000-0000-000d-000000000005', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-15 10:05:10+00', true),   -- Q7 correct
    ('00000000-0000-0000-000e-000000000006', '00000000-0000-0000-000d-000000000006', 4, 'Good explanation with a relevant example. Missing discussion of when NOT to use Factory.',
     '00000000-0000-0000-0000-000000000001', '2026-05-15 12:30:00+00', false),  -- T1 4/5
    ('00000000-0000-0000-000e-000000000007', '00000000-0000-0000-000d-000000000007', 4, 'Clear example of 3NF violation and fix. Could expand on why update anomalies matter in practice.',
     '00000000-0000-0000-0000-000000000001', '2026-05-15 12:35:00+00', false),  -- T4 4/5
    ('00000000-0000-0000-000e-000000000008', '00000000-0000-0000-000d-000000000008', 8, 'Correct O(log n) implementation with mid-overflow protection. Missing null/empty array guards.',
     '00000000-0000-0000-0000-000000000001', '2026-05-15 12:40:00+00', false)   -- C1 8/10
ON CONFLICT (candidate_answer_id) DO NOTHING;

-- ── Sub 2 scores: Bob (7/25 total) ───────────────────────────
INSERT INTO answer_scores (id, candidate_answer_id, score, feedback, marked_by, marked_at, is_auto_marked)
VALUES
    ('00000000-0000-0000-000e-000000000009', '00000000-0000-0000-000d-000000000009', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-16 14:28:05+00', true),   -- Q1 wrong
    ('00000000-0000-0000-000e-00000000000a', '00000000-0000-0000-000d-00000000000a', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-16 14:28:05+00', true),   -- Q2 wrong
    ('00000000-0000-0000-000e-00000000000b', '00000000-0000-0000-000d-00000000000b', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-16 14:28:05+00', true),   -- Q4 wrong
    ('00000000-0000-0000-000e-00000000000c', '00000000-0000-0000-000d-00000000000c', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-16 14:28:05+00', true),   -- Q5 wrong
    ('00000000-0000-0000-000e-00000000000d', '00000000-0000-0000-000d-00000000000d', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-16 14:28:05+00', true),   -- Q7 correct
    ('00000000-0000-0000-000e-00000000000e', '00000000-0000-0000-000d-00000000000e', 2, 'Very thin answer — correct direction but no example and minimal detail. Appears to paraphrase known definitions.',
     '00000000-0000-0000-0000-000000000001', '2026-05-16 16:00:00+00', false),  -- T1 2/5
    ('00000000-0000-0000-000e-00000000000f', '00000000-0000-0000-000d-00000000000f', 1, 'Barely touches the requirement. No example of a normalisation violation or corrected schema.',
     '00000000-0000-0000-0000-000000000001', '2026-05-16 16:05:00+00', false),  -- T4 1/5
    ('00000000-0000-0000-000e-000000000010', '00000000-0000-0000-000d-000000000010', 3, 'Linear search not binary search — does not meet the O(log n) requirement. Code runs but is functionally incorrect for the task.',
     '00000000-0000-0000-0000-000000000001', '2026-05-16 16:10:00+00', false)   -- C1 3/10
ON CONFLICT (candidate_answer_id) DO NOTHING;

-- ── Sub 3 scores: Carol (30/34 total) ────────────────────────
INSERT INTO answer_scores (id, candidate_answer_id, score, feedback, marked_by, marked_at, is_auto_marked)
VALUES
    ('00000000-0000-0000-000e-000000000011', '00000000-0000-0000-000d-000000000011', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-17 11:25:05+00', true),   -- Q3 correct
    ('00000000-0000-0000-000e-000000000012', '00000000-0000-0000-000d-000000000012', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-17 11:25:05+00', true),   -- Q6 correct
    ('00000000-0000-0000-000e-000000000013', '00000000-0000-0000-000d-000000000013', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-17 11:25:05+00', true),   -- Q7 wrong
    ('00000000-0000-0000-000e-000000000014', '00000000-0000-0000-000d-000000000014', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-17 11:25:05+00', true),   -- Q8 correct
    ('00000000-0000-0000-000e-000000000015', '00000000-0000-0000-000d-000000000015', 5, 'Excellent — covers all five principles clearly with accurate code-level examples for SRP and OCP.',
     '00000000-0000-0000-0000-000000000001', '2026-05-17 14:00:00+00', false),  -- T2 5/5
    ('00000000-0000-0000-000e-000000000016', '00000000-0000-0000-000d-000000000016', 5, 'Outstanding comparison. Correctly identifies mobile-specific concerns (over-fetching, round-trips) and discusses BFF pattern.',
     '00000000-0000-0000-0000-000000000001', '2026-05-17 14:05:00+00', false),  -- T3 5/5
    ('00000000-0000-0000-000e-000000000017', '00000000-0000-0000-000d-000000000017', 8, 'Strong design covering all main components. Loses 2 marks for not discussing analytics trade-off of 301 vs 302 in depth and missing rate-limiting on write path.',
     '00000000-0000-0000-0000-000000000001', '2026-05-17 14:10:00+00', false),  -- T5 8/10
    ('00000000-0000-0000-000e-000000000018', '00000000-0000-0000-000d-000000000018', 9, 'Correct recursive + generator implementations. Minor: no handling of non-list iterables (tuples etc.).',
     '00000000-0000-0000-0000-000000000001', '2026-05-17 14:15:00+00', false)   -- C2 9/10
ON CONFLICT (candidate_answer_id) DO NOTHING;

-- ── Sub 4 scores: David (29/44 total) ────────────────────────
INSERT INTO answer_scores (id, candidate_answer_id, score, feedback, marked_by, marked_at, is_auto_marked)
VALUES
    ('00000000-0000-0000-000e-000000000019', '00000000-0000-0000-000d-000000000019', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-18 11:18:05+00', true),   -- Q10 correct
    ('00000000-0000-0000-000e-00000000001a', '00000000-0000-0000-000d-00000000001a', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-18 11:18:05+00', true),   -- Q14 correct
    ('00000000-0000-0000-000e-00000000001b', '00000000-0000-0000-000d-00000000001b', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-18 11:18:05+00', true),   -- Q16 correct
    ('00000000-0000-0000-000e-00000000001c', '00000000-0000-0000-000d-00000000001c', 6, 'Solid coverage of the three problems and solutions. Missing distinction between Thread and Runnable — both are valid but rationale is expected.',
     '00000000-0000-0000-0000-000000000001', '2026-05-18 13:00:00+00', false),  -- T7 6/10
    ('00000000-0000-0000-000e-00000000001d', '00000000-0000-0000-000d-00000000001d', 7, 'Good CP/AP examples. Could expand on why partition tolerance is non-negotiable in distributed systems and how CRDT addresses AP consistency.',
     '00000000-0000-0000-0000-000000000001', '2026-05-18 13:05:00+00', false),  -- T9 7/10
    ('00000000-0000-0000-000e-00000000001e', '00000000-0000-0000-000d-00000000001e', 8, 'Correct HashMap approach with O(n) time and space. Missing edge case: what if nums is empty or null?',
     '00000000-0000-0000-0000-000000000001', '2026-05-18 13:10:00+00', false),  -- C5 8/10
    ('00000000-0000-0000-000e-00000000001f', '00000000-0000-0000-000d-00000000001f', 5, 'Floyd''s algorithm correct. No null check for head — would throw NullPointerException on empty list. Partial marks.',
     '00000000-0000-0000-0000-000000000001', '2026-05-18 13:15:00+00', false)   -- C7 5/10
ON CONFLICT (candidate_answer_id) DO NOTHING;

-- ── Sub 5 scores: Emma (13/21 total) ─────────────────────────
INSERT INTO answer_scores (id, candidate_answer_id, score, feedback, marked_by, marked_at, is_auto_marked)
VALUES
    ('00000000-0000-0000-000e-000000000020', '00000000-0000-0000-000d-000000000020', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-19 15:00:05+00', true),   -- Q6 correct
    ('00000000-0000-0000-000e-000000000021', '00000000-0000-0000-000d-000000000021', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-19 15:00:05+00', true),   -- Q9 wrong
    ('00000000-0000-0000-000e-000000000022', '00000000-0000-0000-000d-000000000022', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-19 15:00:05+00', true),   -- Q12 correct
    ('00000000-0000-0000-000e-000000000023', '00000000-0000-0000-000d-000000000023', 4, 'Good comparison hitting the key mobile concerns. Could better address the BFF pattern and caching limitations of GraphQL.',
     '00000000-0000-0000-0000-000000000001', '2026-05-19 16:30:00+00', false),  -- T3 4/5
    ('00000000-0000-0000-000e-000000000024', '00000000-0000-0000-000d-000000000024', 3, 'Correct cycle description. Benefits are accurate but pitfalls section is thin — only mentions slow tests.',
     '00000000-0000-0000-0000-000000000001', '2026-05-19 16:35:00+00', false),  -- T8 3/5
    ('00000000-0000-0000-000e-000000000025', '00000000-0000-0000-000d-000000000025', 4, 'Correct use of Set for O(n) solution. Clean code. Minor: result order is non-deterministic with Set spread.',
     '00000000-0000-0000-0000-000000000001', '2026-05-19 16:40:00+00', false)   -- C6 4/5
ON CONFLICT (candidate_answer_id) DO NOTHING;

-- ── Sub 6 scores: Frank (18/34 total) ────────────────────────
INSERT INTO answer_scores (id, candidate_answer_id, score, feedback, marked_by, marked_at, is_auto_marked)
VALUES
    ('00000000-0000-0000-000e-000000000026', '00000000-0000-0000-000d-000000000026', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-20 10:30:05+00', true),   -- Q3 wrong
    ('00000000-0000-0000-000e-000000000027', '00000000-0000-0000-000d-000000000027', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-20 10:30:05+00', true),   -- Q6 correct
    ('00000000-0000-0000-000e-000000000028', '00000000-0000-0000-000d-000000000028', 1, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-20 10:30:05+00', true),   -- Q7 correct
    ('00000000-0000-0000-000e-000000000029', '00000000-0000-0000-000d-000000000029', 0, NULL, '00000000-0000-0000-0000-000000000001', '2026-05-20 10:30:05+00', true),   -- Q8 wrong
    ('00000000-0000-0000-000e-00000000002a', '00000000-0000-0000-000d-00000000002a', 3, 'Technically accurate but reads as generated text — no personal examples, overly formal vocabulary, and bullet-point structure typical of LLM output. Flagged for AI content review.',
     '00000000-0000-0000-0000-000000000001', '2026-05-20 12:00:00+00', false),  -- T2 3/5
    ('00000000-0000-0000-000e-00000000002b', '00000000-0000-0000-000d-00000000002b', 3, 'Correct facts presented in an unnaturally polished style. No concrete scenario grounding. Consistent with prior text answers in style — AI generation suspected.',
     '00000000-0000-0000-0000-000000000001', '2026-05-20 12:05:00+00', false),  -- T3 3/5
    ('00000000-0000-0000-000e-00000000002c', '00000000-0000-0000-000d-00000000002c', 5, 'Covers main components adequately. Lacks depth on trade-offs and scalability specifics. Style consistent with AI generation.',
     '00000000-0000-0000-0000-000000000001', '2026-05-20 12:10:00+00', false),  -- T5 5/10
    ('00000000-0000-0000-000e-00000000002d', '00000000-0000-0000-000d-00000000002d', 5, 'Correct recursive solution with docstring that reads as AI-generated. Works but awarded partial marks pending integrity review.',
     '00000000-0000-0000-0000-000000000001', '2026-05-20 12:15:00+00', false)   -- C2 5/10
ON CONFLICT (candidate_answer_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. Submission flags
-- ────────────────────────────────────────────────────────────
INSERT INTO submission_flags (id, submission_id, reason, status, resolution_notes, created_by, created_at)
VALUES
    -- Flag 1: Bob — COPIED_ANSWERS, still FLAGGED (open)
    ('00000000-0000-0000-000f-000000000001',
     '00000000-0000-0000-000c-000000000002',
     'COPIED_ANSWERS', 'FLAGGED', NULL,
     '00000000-0000-0000-0000-000000000001',
     '2026-05-16 16:15:00+00'),

    -- Flag 2: David — TIMING_ANOMALY, moved to UNDER_REVIEW
    ('00000000-0000-0000-000f-000000000002',
     '00000000-0000-0000-000c-000000000004',
     'TIMING_ANOMALY', 'UNDER_REVIEW', NULL,
     '00000000-0000-0000-0000-000000000001',
     '2026-05-18 13:30:00+00'),

    -- Flag 3: Frank — AI_GENERATED_CONTENT, RESOLVED after review
    ('00000000-0000-0000-000f-000000000003',
     '00000000-0000-0000-000c-000000000006',
     'AI_GENERATED_CONTENT', 'RESOLVED',
     'All text answers reviewed against candidate LinkedIn profile and prior phone screen notes. Language pattern consistent with AI generation. Candidate acknowledged using AI assistance. Submission invalidated and candidate notified.',
     '00000000-0000-0000-0000-000000000001',
     '2026-05-20 12:20:00+00')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 7. Submission flag audit trail
-- ────────────────────────────────────────────────────────────
INSERT INTO submission_flag_audit (id, flag_id, action, from_status, to_status, actor_user_id, actor_username, occurred_at)
VALUES
    -- Flag 1 audit: Bob — created
    ('00000000-0000-0000-0010-000000000001',
     '00000000-0000-0000-000f-000000000001',
     'CREATED', NULL, 'FLAGGED',
     '00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev',
     '2026-05-16 16:15:00+00'),

    -- Flag 2 audit: David — created then moved to UNDER_REVIEW
    ('00000000-0000-0000-0010-000000000002',
     '00000000-0000-0000-000f-000000000002',
     'CREATED', NULL, 'FLAGGED',
     '00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev',
     '2026-05-18 13:30:00+00'),

    ('00000000-0000-0000-0010-000000000003',
     '00000000-0000-0000-000f-000000000002',
     'STATUS_CHANGED', 'FLAGGED', 'UNDER_REVIEW',
     '00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev',
     '2026-05-19 09:00:00+00'),

    -- Flag 3 audit: Frank — created → UNDER_REVIEW → RESOLVED
    ('00000000-0000-0000-0010-000000000004',
     '00000000-0000-0000-000f-000000000003',
     'CREATED', NULL, 'FLAGGED',
     '00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev',
     '2026-05-20 12:20:00+00'),

    ('00000000-0000-0000-0010-000000000005',
     '00000000-0000-0000-000f-000000000003',
     'STATUS_CHANGED', 'FLAGGED', 'UNDER_REVIEW',
     '00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev',
     '2026-05-20 14:00:00+00'),

    ('00000000-0000-0000-0010-000000000006',
     '00000000-0000-0000-000f-000000000003',
     'STATUS_CHANGED', 'UNDER_REVIEW', 'RESOLVED',
     '00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev',
     '2026-05-21 10:30:00+00')
ON CONFLICT (id) DO NOTHING;
