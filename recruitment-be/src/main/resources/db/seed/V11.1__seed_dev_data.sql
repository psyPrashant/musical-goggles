-- ============================================================
-- V11: Dev seed data
-- Idempotent — all inserts use ON CONFLICT (id) DO NOTHING
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Admin user
--    ON CONFLICT (email): skip if already exists (fresh DB or
--    existing DB — either way the subquery below resolves the id)
-- ────────────────────────────────────────────────────────────
INSERT INTO users (id, email, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. Tags
-- ────────────────────────────────────────────────────────────
INSERT INTO tags (id, name) VALUES
    ('00000000-0000-0000-0001-000000000001', 'algorithms'),
    ('00000000-0000-0000-0001-000000000002', 'data-structures'),
    ('00000000-0000-0000-0001-000000000003', 'oop'),
    ('00000000-0000-0000-0001-000000000004', 'sql'),
    ('00000000-0000-0000-0001-000000000005', 'system-design'),
    ('00000000-0000-0000-0001-000000000006', 'java')
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. MCQ questions (8)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0002-000000000001',
     'Big-O: Binary Search',
     'What is the time complexity of binary search on a sorted array of n elements?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000002',
     'Hash Map Lookup',
     'What is the average-case time complexity of a lookup operation in a hash map?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000003',
     'OOP: Polymorphism',
     'Which of the following best describes polymorphism in object-oriented programming?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000004',
     'SQL: INNER JOIN Behaviour',
     'What does an INNER JOIN return when no rows match the join condition?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000005',
     'Git: Rebase vs Merge',
     'Which Git operation rewrites commit history by replaying commits onto a new base?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000006',
     'HTTP Methods: Idempotency',
     'Which HTTP method is idempotent but NOT safe (i.e. may have side effects)?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000007',
     'Binary Trees: Node Count',
     'In a perfect binary tree, how many nodes exist at depth d (root is depth 0)?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000008',
     'SQL: Filtering Grouped Results',
     'Which SQL clause is used to filter rows AFTER a GROUP BY has been applied?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO mcq_questions (id) VALUES
    ('00000000-0000-0000-0002-000000000001'),
    ('00000000-0000-0000-0002-000000000002'),
    ('00000000-0000-0000-0002-000000000003'),
    ('00000000-0000-0000-0002-000000000004'),
    ('00000000-0000-0000-0002-000000000005'),
    ('00000000-0000-0000-0002-000000000006'),
    ('00000000-0000-0000-0002-000000000007'),
    ('00000000-0000-0000-0002-000000000008')
ON CONFLICT (id) DO NOTHING;

-- Options for Q1: Big-O Binary Search (correct: O(log n))
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', 'O(1)', FALSE),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', 'O(log n)', TRUE),
    ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001', 'O(n)', FALSE),
    ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000001', 'O(n log n)', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q2: Hash Map Lookup (correct: O(1))
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000002', 'O(1)', TRUE),
    ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000002', 'O(log n)', FALSE),
    ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000002', 'O(n)', FALSE),
    ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000002', 'O(n²)', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q3: Polymorphism (correct: ability of different classes to respond to same interface)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000003', 'The ability to hide internal implementation details', FALSE),
    ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000003', 'The ability for different classes to respond to the same method call in different ways', TRUE),
    ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000003', 'Allowing a class to inherit from multiple parent classes', FALSE),
    ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000003', 'Restricting access to class members', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q4: INNER JOIN (correct: returns empty result set / no rows)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000004', 'Returns all rows from the left table', FALSE),
    ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0002-000000000004', 'Returns all rows from both tables with NULLs for non-matches', FALSE),
    ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0002-000000000004', 'Returns no rows', TRUE),
    ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000004', 'Returns a Cartesian product of both tables', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q5: Git Rebase (correct: rebase)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0002-000000000005', 'git merge', FALSE),
    ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0002-000000000005', 'git rebase', TRUE),
    ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0002-000000000005', 'git cherry-pick', FALSE),
    ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0002-000000000005', 'git stash', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q6: HTTP Idempotent but not safe (correct: PUT)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0002-000000000006', 'GET', FALSE),
    ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0002-000000000006', 'POST', FALSE),
    ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0002-000000000006', 'PUT', TRUE),
    ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0002-000000000006', 'HEAD', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q7: Nodes at depth d (correct: 2^d)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0002-000000000007', 'd', FALSE),
    ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0002-000000000007', '2d', FALSE),
    ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0002-000000000007', '2^d', TRUE),
    ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0002-000000000007', '2^d - 1', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q8: SQL filter after GROUP BY (correct: HAVING)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0002-000000000008', 'WHERE', FALSE),
    ('00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0002-000000000008', 'HAVING', TRUE),
    ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0002-000000000008', 'FILTER', FALSE),
    ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0002-000000000008', 'ORDER BY', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 4. TEXT questions (5)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0004-000000000001',
     'Design Patterns: Factory',
     'Describe the Factory design pattern. What problem does it solve, and give a real-world example of when you would use it.',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0004-000000000002',
     'SOLID Principles',
     'Explain the SOLID principles of object-oriented design. Focus on the Single Responsibility Principle and the Open/Closed Principle — give a code-level example for each.',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0004-000000000003',
     'REST vs GraphQL',
     'Compare REST and GraphQL as API styles. What are the key trade-offs when choosing between them for a mobile client that consumes data from multiple backend services?',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0004-000000000004',
     'Database Normalisation: 3NF',
     'Explain Third Normal Form (3NF) in relational database design. Provide a concrete example of a table that violates 3NF and show the normalised version.',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0004-000000000005',
     'System Design: URL Shortener',
     'How would you design a URL shortener service like bit.ly? Describe the main components, data model, and key trade-offs around scalability and collision avoidance.',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO text_questions (id) VALUES
    ('00000000-0000-0000-0004-000000000001'),
    ('00000000-0000-0000-0004-000000000002'),
    ('00000000-0000-0000-0004-000000000003'),
    ('00000000-0000-0000-0004-000000000004'),
    ('00000000-0000-0000-0004-000000000005')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 5. CODE_SUBMISSION questions (4)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0005-000000000001',
     'Binary Search',
     'Implement binary search on a sorted integer array. The function should return the index of the target value, or -1 if not found. Aim for O(log n) time complexity.',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0005-000000000002',
     'Flatten Nested List',
     'Write a function that takes a nested list (a list that may contain other lists at any depth) and returns a single flat list of all the values. Example: [[1, [2, 3]], [4]] → [1, 2, 3, 4].',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0005-000000000003',
     'SQL: Top 3 Categories by Sales',
     'Given a table `orders(order_id, product_category, amount)`, write a SQL query that returns the top 3 product categories by total sales amount, including the total for each.',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0005-000000000004',
     'Reverse a String',
     'Implement a function to reverse a string without using any built-in reverse method or library. The function should handle null and empty string inputs gracefully.',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO code_submission_questions (id, language_hint) VALUES
    ('00000000-0000-0000-0005-000000000001', 'Java'),
    ('00000000-0000-0000-0005-000000000002', 'Python'),
    ('00000000-0000-0000-0005-000000000003', 'SQL'),
    ('00000000-0000-0000-0005-000000000004', 'Java')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. GROUP questions (2)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0006-000000000001',
     'Java OOP Scenario',
     'You are reviewing a Java codebase for a banking application. The codebase has a class hierarchy for account types (SavingsAccount, CheckingAccount, LoanAccount) that all extend a base Account class. Answer the following questions about the design.',
     'GROUP', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0006-000000000002',
     'SQL Case Study',
     'You have been given access to a retail database with the following tables: products(id, name, category, price), orders(id, customer_id, created_at), order_items(order_id, product_id, quantity). Answer the following questions.',
     'GROUP', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO group_questions (id) VALUES
    ('00000000-0000-0000-0006-000000000001'),
    ('00000000-0000-0000-0006-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Group 1 members: Q3 (OOP polymorphism MCQ) + Q2 (SOLID TEXT)
INSERT INTO group_question_members (id, group_question_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0002-000000000003', 0),
    ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0004-000000000002', 1)
ON CONFLICT (id) DO NOTHING;

-- Group 2 members: Q8 (HAVING MCQ) + Q3 (Top 3 categories SQL code)
INSERT INTO group_question_members (id, group_question_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0002-000000000008', 0),
    ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0005-000000000003', 1)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 7. Question tags
-- ────────────────────────────────────────────────────────────
INSERT INTO question_tags (question_id, tag_id)
SELECT q, t.id FROM tags t, (VALUES
    ('00000000-0000-0000-0002-000000000001'::uuid, 'algorithms'),
    ('00000000-0000-0000-0002-000000000001'::uuid, 'data-structures'),
    ('00000000-0000-0000-0002-000000000002'::uuid, 'data-structures'),
    ('00000000-0000-0000-0002-000000000003'::uuid, 'oop'),
    ('00000000-0000-0000-0002-000000000003'::uuid, 'java'),
    ('00000000-0000-0000-0002-000000000004'::uuid, 'sql'),
    ('00000000-0000-0000-0002-000000000007'::uuid, 'data-structures'),
    ('00000000-0000-0000-0002-000000000008'::uuid, 'sql'),
    ('00000000-0000-0000-0004-000000000001'::uuid, 'oop'),
    ('00000000-0000-0000-0004-000000000002'::uuid, 'oop'),
    ('00000000-0000-0000-0004-000000000002'::uuid, 'java'),
    ('00000000-0000-0000-0004-000000000003'::uuid, 'system-design'),
    ('00000000-0000-0000-0004-000000000004'::uuid, 'sql'),
    ('00000000-0000-0000-0004-000000000005'::uuid, 'system-design'),
    ('00000000-0000-0000-0005-000000000001'::uuid, 'algorithms'),
    ('00000000-0000-0000-0005-000000000001'::uuid, 'java'),
    ('00000000-0000-0000-0005-000000000002'::uuid, 'algorithms'),
    ('00000000-0000-0000-0005-000000000003'::uuid, 'sql'),
    ('00000000-0000-0000-0005-000000000004'::uuid, 'java')
) AS src(q, tag_name) WHERE t.name = src.tag_name
ON CONFLICT (question_id, tag_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 8. Assessments (3)
-- ────────────────────────────────────────────────────────────
INSERT INTO assessments (id, title, description, time_limit_minutes, status, created_by) VALUES
    ('00000000-0000-0000-0008-000000000001',
     'Junior Backend Developer',
     'A foundational assessment covering algorithms, data structures, OOP, and SQL for junior backend roles.',
     60, 'PUBLISHED', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0008-000000000002',
     'Senior Full Stack Engineer',
     'A comprehensive assessment for senior engineers covering system design, advanced SQL, OOP design, and coding.',
     90, 'PUBLISHED', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0008-000000000003',
     'SQL & Database Foundations',
     'Focuses on relational database concepts, SQL querying, and normalisation for data-focused roles.',
     45, 'DRAFT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 9. Assessment questions
-- ────────────────────────────────────────────────────────────

-- Assessment 1: Junior Backend Developer
-- 5 MCQ (Q1,Q2,Q4,Q5,Q7) + 2 TEXT (T1,T4) + 1 CODE (C1) = 8 questions
INSERT INTO assessment_questions (id, assessment_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0002-000000000001', 1),
    ('00000000-0000-0000-0009-000000000002', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0002-000000000002', 2),
    ('00000000-0000-0000-0009-000000000003', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0002-000000000004', 3),
    ('00000000-0000-0000-0009-000000000004', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0002-000000000005', 4),
    ('00000000-0000-0000-0009-000000000005', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0002-000000000007', 5),
    ('00000000-0000-0000-0009-000000000006', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0004-000000000001', 6),
    ('00000000-0000-0000-0009-000000000007', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0004-000000000004', 7),
    ('00000000-0000-0000-0009-000000000008', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0005-000000000001', 8)
ON CONFLICT (id) DO NOTHING;

-- Assessment 2: Senior Full Stack Engineer
-- 4 MCQ (Q3,Q6,Q7,Q8) + 3 TEXT (T2,T3,T5) + 1 CODE (C2) + 1 GROUP (G2) = 9 questions
INSERT INTO assessment_questions (id, assessment_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0009-000000000009',  '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0002-000000000003', 1),
    ('00000000-0000-0000-0009-000000000010', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0002-000000000006', 2),
    ('00000000-0000-0000-0009-000000000011', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0002-000000000007', 3),
    ('00000000-0000-0000-0009-000000000012', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0002-000000000008', 4),
    ('00000000-0000-0000-0009-000000000013', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0004-000000000002', 5),
    ('00000000-0000-0000-0009-000000000014', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0004-000000000003', 6),
    ('00000000-0000-0000-0009-000000000015', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0004-000000000005', 7),
    ('00000000-0000-0000-0009-000000000016', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0005-000000000002', 8),
    ('00000000-0000-0000-0009-000000000017', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0006-000000000002', 9)
ON CONFLICT (id) DO NOTHING;

-- Assessment 3: SQL & Database Foundations
-- 5 MCQ (Q1,Q2,Q4,Q7,Q8) + 2 TEXT (T3,T4) + 1 CODE (C3) = 8 questions
INSERT INTO assessment_questions (id, assessment_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0009-000000000018', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0002-000000000001', 1),
    ('00000000-0000-0000-0009-000000000019', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0002-000000000002', 2),
    ('00000000-0000-0000-0009-000000000020', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0002-000000000004', 3),
    ('00000000-0000-0000-0009-000000000021', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0002-000000000007', 4),
    ('00000000-0000-0000-0009-000000000022', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0002-000000000008', 5),
    ('00000000-0000-0000-0009-000000000023', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0004-000000000003', 6),
    ('00000000-0000-0000-0009-000000000024', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0004-000000000004', 7),
    ('00000000-0000-0000-0009-000000000025', '00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0005-000000000003', 8)
ON CONFLICT (id) DO NOTHING;
