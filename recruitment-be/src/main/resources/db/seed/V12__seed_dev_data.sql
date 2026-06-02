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

-- ============================================================
-- Additional seed data: 20 more questions, 8 candidates, 2 assessments
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Additional tags
-- ────────────────────────────────────────────────────────────
INSERT INTO tags (id, name) VALUES
    ('00000000-0000-0000-0001-000000000007', 'javascript'),
    ('00000000-0000-0000-0001-000000000008', 'concurrency'),
    ('00000000-0000-0000-0001-000000000009', 'testing'),
    ('00000000-0000-0000-0001-00000000000a', 'rest-api')
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- New MCQ questions (8, IDs 0002-09 to 0002-10)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0002-000000000009',
     'Stack vs Queue',
     'What is the fundamental difference in ordering between a Stack and a Queue?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-00000000000a',
     'Java: The final Keyword',
     'What is the effect of declaring a class with the final keyword in Java?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-00000000000b',
     'Design Pattern: Singleton',
     'Which of the following best describes the Singleton design pattern?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-00000000000c',
     'REST: Statelessness',
     'Which of the following correctly describes the statelessness constraint of REST?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-00000000000d',
     'Linked List vs Array',
     'Which operation has O(1) time complexity in a singly linked list but O(n) in an unsorted array?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-00000000000e',
     'Java: Checked vs Unchecked Exceptions',
     'What is the compiler-enforced rule for checked exceptions in Java?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-00000000000f',
     'SQL: Subquery vs JOIN Performance',
     'Which of the following statements about SQL subqueries and JOINs is generally true for large datasets?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0002-000000000010',
     'Big-O: Bubble Sort',
     'What is the worst-case time complexity of the Bubble Sort algorithm?',
     'MCQ', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO mcq_questions (id) VALUES
    ('00000000-0000-0000-0002-000000000009'),
    ('00000000-0000-0000-0002-00000000000a'),
    ('00000000-0000-0000-0002-00000000000b'),
    ('00000000-0000-0000-0002-00000000000c'),
    ('00000000-0000-0000-0002-00000000000d'),
    ('00000000-0000-0000-0002-00000000000e'),
    ('00000000-0000-0000-0002-00000000000f'),
    ('00000000-0000-0000-0002-000000000010')
ON CONFLICT (id) DO NOTHING;

-- Options for Q9: Stack vs Queue (correct: Stack=LIFO, Queue=FIFO)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0002-000000000009', 'A Stack follows LIFO (Last-In-First-Out) and a Queue follows FIFO (First-In-First-Out)', TRUE),
    ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0002-000000000009', 'A Stack follows FIFO and a Queue follows LIFO', FALSE),
    ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0002-000000000009', 'Both Stack and Queue follow FIFO ordering', FALSE),
    ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0002-000000000009', 'Both Stack and Queue follow LIFO ordering', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q10: Java final class (correct: cannot be subclassed)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-00000000000a', 'A final class cannot be instantiated using the new keyword', FALSE),
    ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0002-00000000000a', 'A final class cannot be extended by a subclass', TRUE),
    ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0002-00000000000a', 'A final class cannot contain non-final methods', FALSE),
    ('00000000-0000-0000-0003-00000000003a', '00000000-0000-0000-0002-00000000000a', 'A final class is loaded into memory only once by the JVM', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q11: Singleton (correct: one instance + global access point)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-00000000003b', '00000000-0000-0000-0002-00000000000b', 'Ensures a class has exactly one instance and provides a global point of access to it', TRUE),
    ('00000000-0000-0000-0003-00000000003c', '00000000-0000-0000-0002-00000000000b', 'Defines an interface for creating objects and lets subclasses decide which class to instantiate', FALSE),
    ('00000000-0000-0000-0003-00000000003d', '00000000-0000-0000-0002-00000000000b', 'Attaches additional responsibilities to an object dynamically at runtime', FALSE),
    ('00000000-0000-0000-0003-00000000003e', '00000000-0000-0000-0002-00000000000b', 'Provides a simplified interface to a complex subsystem', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q12: REST statelessness (correct: each request is self-contained)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-00000000003f', '00000000-0000-0000-0002-00000000000c', 'The server maintains a session for each client across multiple requests', FALSE),
    ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0002-00000000000c', 'Each request must contain all information needed; the server stores no client context between requests', TRUE),
    ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0002-00000000000c', 'Statelessness is optional and only applies to GET requests', FALSE),
    ('00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0002-00000000000c', 'The server stores state in a shared cache to compensate for stateless HTTP', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q13: Linked List vs Array (correct: O(1) head insertion)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000043', '00000000-0000-0000-0002-00000000000d', 'Random access by index', FALSE),
    ('00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0002-00000000000d', 'Insertion at the head without shifting elements', TRUE),
    ('00000000-0000-0000-0003-000000000045', '00000000-0000-0000-0002-00000000000d', 'Binary search on sorted elements', FALSE),
    ('00000000-0000-0000-0003-000000000046', '00000000-0000-0000-0002-00000000000d', 'Lower memory overhead per element', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q14: Checked vs Unchecked exceptions (correct: must be caught or declared)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0002-00000000000e', 'Unchecked exceptions must be declared with the throws keyword in the method signature', FALSE),
    ('00000000-0000-0000-0003-000000000048', '00000000-0000-0000-0002-00000000000e', 'Checked exceptions must be either caught with try-catch or declared in the method signature', TRUE),
    ('00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0002-00000000000e', 'Checked exceptions extend RuntimeException', FALSE),
    ('00000000-0000-0000-0003-00000000004a', '00000000-0000-0000-0002-00000000000e', 'Unchecked exceptions are verified by the compiler at compile time', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q15: SQL subquery vs JOIN (correct: JOINs often better optimized)
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-00000000004b', '00000000-0000-0000-0002-00000000000f', 'Correlated subqueries always outperform equivalent JOINs because they execute once per query', FALSE),
    ('00000000-0000-0000-0003-00000000004c', '00000000-0000-0000-0002-00000000000f', 'Using a subquery in the WHERE clause is always faster than a JOIN on large tables', FALSE),
    ('00000000-0000-0000-0003-00000000004d', '00000000-0000-0000-0002-00000000000f', 'For large datasets, JOINs are often better optimized by the query planner than equivalent correlated subqueries', TRUE),
    ('00000000-0000-0000-0003-00000000004e', '00000000-0000-0000-0002-00000000000f', 'Subqueries and JOINs always produce different result sets even when logically equivalent', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Options for Q16: Bubble Sort worst-case (correct: O(n²))
INSERT INTO question_options (id, mcq_question_id, option_text, is_correct) VALUES
    ('00000000-0000-0000-0003-00000000004f', '00000000-0000-0000-0002-000000000010', 'O(n)', FALSE),
    ('00000000-0000-0000-0003-000000000050', '00000000-0000-0000-0002-000000000010', 'O(n log n)', FALSE),
    ('00000000-0000-0000-0003-000000000051', '00000000-0000-0000-0002-000000000010', 'O(n²)', TRUE),
    ('00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0002-000000000010', 'O(log n)', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- New TEXT questions (4, IDs 0004-06 to 0004-09)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0004-000000000006',
     'Microservices vs Monolith',
     'Compare microservices and monolithic architecture. What are the key advantages and disadvantages of each? Describe a scenario where you would recommend migrating from a monolith to microservices, and the main challenges you would anticipate.',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0004-000000000007',
     'Java Concurrency: Threads and Synchronisation',
     'Explain the difference between a Thread and a Runnable in Java. Describe three common concurrency problems (race conditions, deadlocks, and thread starvation) and the Java mechanisms available to address each.',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0004-000000000008',
     'Test-Driven Development',
     'Explain the Red-Green-Refactor cycle in TDD. What are the main benefits of TDD, and what are the most common pitfalls teams encounter when adopting it for the first time?',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0004-000000000009',
     'CAP Theorem',
     'Describe the CAP theorem and explain what it means for distributed system design. Give a concrete example of a system that prioritises CP (Consistency and Partition Tolerance) and one that prioritises AP (Availability and Partition Tolerance).',
     'TEXT', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO text_questions (id) VALUES
    ('00000000-0000-0000-0004-000000000006'),
    ('00000000-0000-0000-0004-000000000007'),
    ('00000000-0000-0000-0004-000000000008'),
    ('00000000-0000-0000-0004-000000000009')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- New CODE_SUBMISSION questions (4, IDs 0005-05 to 0005-08)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0005-000000000005',
     'Two Sum',
     'Given an array of integers and a target sum, find two numbers that add up to the target and return their indices. Assume exactly one solution exists. Aim for O(n) time complexity.',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0005-000000000006',
     'Find Duplicate Values',
     'Write a function that takes an array of integers and returns a new array containing only the values that appear more than once. Each duplicate value should appear once in the result. Example: [1, 2, 3, 2, 4, 3] → [2, 3].',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0005-000000000007',
     'Detect a Cycle in a Linked List',
     'Given the head of a singly linked list, determine whether it contains a cycle. Return true if a cycle exists, false otherwise. Implement this in O(1) extra space using Floyd''s cycle-detection algorithm.',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0005-000000000008',
     'SQL: Employee Department Report',
     'Given tables employees(id, name, department_id, salary) and departments(id, name), write a SQL query that returns each department name, the number of employees in it, and the average salary — but only for departments with more than 2 employees. Order by average salary descending.',
     'CODE_SUBMISSION', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO code_submission_questions (id, language_hint) VALUES
    ('00000000-0000-0000-0005-000000000005', 'Java'),
    ('00000000-0000-0000-0005-000000000006', 'JavaScript'),
    ('00000000-0000-0000-0005-000000000007', 'Python'),
    ('00000000-0000-0000-0005-000000000008', 'SQL')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- New GROUP questions (4, IDs 0006-03 to 0006-06)
-- ────────────────────────────────────────────────────────────
INSERT INTO questions (id, title, body, type, created_by) VALUES
    ('00000000-0000-0000-0006-000000000003',
     'Java Collections Scenario',
     'A colleague is designing an in-memory queue for a print-spooler application in Java. They are unsure whether to use a LinkedList or an ArrayList as the underlying data structure. Answer the following questions about these data structure choices.',
     'GROUP', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0006-000000000004',
     'Java Error Handling Scenario',
     'You are reviewing a Java service class that interacts with a database and an external payment gateway. The code must handle both expected and unexpected failures cleanly. Answer the following questions about Java exception handling best practices.',
     'GROUP', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0006-000000000005',
     'REST API Design Scenario',
     'Your team is building a public-facing API for a travel booking platform. The API must serve a mobile app and a web app that have different data needs, and must scale under high traffic. Answer the following questions about API design decisions.',
     'GROUP', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0006-000000000006',
     'Database Query Optimisation Scenario',
     'A reporting dashboard is running slowly due to expensive SQL queries on a large e-commerce database. The team suspects poorly structured queries are the bottleneck. Answer the following questions and write an optimised query.',
     'GROUP', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO group_questions (id) VALUES
    ('00000000-0000-0000-0006-000000000003'),
    ('00000000-0000-0000-0006-000000000004'),
    ('00000000-0000-0000-0006-000000000005'),
    ('00000000-0000-0000-0006-000000000006')
ON CONFLICT (id) DO NOTHING;

-- Group 3 (Java Collections): Q9 Stack/Queue + Q13 Linked List vs Array
INSERT INTO group_question_members (id, group_question_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0002-000000000009', 0),
    ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0002-00000000000d', 1)
ON CONFLICT (id) DO NOTHING;

-- Group 4 (Java Error Handling): Q10 final keyword + Q14 checked/unchecked exceptions
INSERT INTO group_question_members (id, group_question_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0007-000000000007', '00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0002-00000000000a', 0),
    ('00000000-0000-0000-0007-000000000008', '00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0002-00000000000e', 1)
ON CONFLICT (id) DO NOTHING;

-- Group 5 (REST API Design): Q12 REST statelessness + T3 REST vs GraphQL
INSERT INTO group_question_members (id, group_question_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0007-000000000009', '00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0002-00000000000c', 0),
    ('00000000-0000-0000-0007-00000000000a', '00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0004-000000000003', 1)
ON CONFLICT (id) DO NOTHING;

-- Group 6 (DB Optimisation): Q15 subquery vs JOIN + C8 employee report SQL
INSERT INTO group_question_members (id, group_question_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0007-00000000000b', '00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0002-00000000000f', 0),
    ('00000000-0000-0000-0007-00000000000c', '00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0005-000000000008', 1)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- Additional question tags
-- ────────────────────────────────────────────────────────────
INSERT INTO question_tags (question_id, tag_id)
SELECT q, t.id FROM tags t, (VALUES
    ('00000000-0000-0000-0002-000000000009'::uuid, 'data-structures'),
    ('00000000-0000-0000-0002-00000000000a'::uuid, 'java'),
    ('00000000-0000-0000-0002-00000000000b'::uuid, 'oop'),
    ('00000000-0000-0000-0002-00000000000c'::uuid, 'rest-api'),
    ('00000000-0000-0000-0002-00000000000d'::uuid, 'data-structures'),
    ('00000000-0000-0000-0002-00000000000e'::uuid, 'java'),
    ('00000000-0000-0000-0002-00000000000f'::uuid, 'sql'),
    ('00000000-0000-0000-0002-000000000010'::uuid, 'algorithms'),
    ('00000000-0000-0000-0004-000000000006'::uuid, 'system-design'),
    ('00000000-0000-0000-0004-000000000007'::uuid, 'java'),
    ('00000000-0000-0000-0004-000000000007'::uuid, 'concurrency'),
    ('00000000-0000-0000-0004-000000000008'::uuid, 'testing'),
    ('00000000-0000-0000-0004-000000000009'::uuid, 'system-design'),
    ('00000000-0000-0000-0005-000000000005'::uuid, 'algorithms'),
    ('00000000-0000-0000-0005-000000000005'::uuid, 'java'),
    ('00000000-0000-0000-0005-000000000006'::uuid, 'algorithms'),
    ('00000000-0000-0000-0005-000000000006'::uuid, 'javascript'),
    ('00000000-0000-0000-0005-000000000007'::uuid, 'algorithms'),
    ('00000000-0000-0000-0005-000000000008'::uuid, 'sql')
) AS src(q, tag_name) WHERE t.name = src.tag_name
ON CONFLICT (question_id, tag_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- Candidates (8)
-- ────────────────────────────────────────────────────────────
INSERT INTO candidates (id, first_name, last_name, email, created_by) VALUES
    ('00000000-0000-0000-000a-000000000001', 'Alice',  'Johnson',  'alice.johnson@example.com',  (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),
    ('00000000-0000-0000-000a-000000000002', 'Bob',    'Smith',    'bob.smith@example.com',      (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),
    ('00000000-0000-0000-000a-000000000003', 'Carol',  'Williams', 'carol.williams@example.com', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),
    ('00000000-0000-0000-000a-000000000004', 'David',  'Chen',     'david.chen@example.com',     (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),
    ('00000000-0000-0000-000a-000000000005', 'Emma',   'Davis',    'emma.davis@example.com',     (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),
    ('00000000-0000-0000-000a-000000000006', 'Frank',  'Wilson',   'frank.wilson@example.com',   (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),
    ('00000000-0000-0000-000a-000000000007', 'Grace',  'Lee',      'grace.lee@example.com',      (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),
    ('00000000-0000-0000-000a-000000000008', 'Harry',  'Martinez', 'harry.martinez@example.com', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (email) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- New assessments (2)
-- ────────────────────────────────────────────────────────────
INSERT INTO assessments (id, title, description, time_limit_minutes, status, created_by) VALUES
    ('00000000-0000-0000-0008-000000000004',
     'Frontend JavaScript Developer',
     'Covers JavaScript fundamentals, REST API consumption, and testing practices for frontend developer roles.',
     60, 'PUBLISHED', (SELECT id FROM users WHERE email = 'admin@recruitment.dev')),

    ('00000000-0000-0000-0008-000000000005',
     'Java Backend Engineer',
     'Covers Java-specific concepts including OOP, exception handling, concurrency, and algorithmic problem-solving for backend roles.',
     75, 'PUBLISHED', (SELECT id FROM users WHERE email = 'admin@recruitment.dev'))
ON CONFLICT (id) DO NOTHING;

-- Assessment 4: Frontend JavaScript Developer
-- 3 MCQ + 2 TEXT + 1 CODE + 1 GROUP = 7 questions
INSERT INTO assessment_questions (id, assessment_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0009-000000000026', '00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0002-000000000006', 1),
    ('00000000-0000-0000-0009-000000000027', '00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0002-000000000009', 2),
    ('00000000-0000-0000-0009-000000000028', '00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0002-00000000000c', 3),
    ('00000000-0000-0000-0009-000000000029', '00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0004-000000000003', 4),
    ('00000000-0000-0000-0009-00000000002a', '00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0004-000000000008', 5),
    ('00000000-0000-0000-0009-00000000002b', '00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0005-000000000006', 6),
    ('00000000-0000-0000-0009-00000000002c', '00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0006-000000000005', 7)
ON CONFLICT (id) DO NOTHING;

-- Assessment 5: Java Backend Engineer
-- 3 MCQ + 2 TEXT + 2 CODE + 1 GROUP = 8 questions
INSERT INTO assessment_questions (id, assessment_id, question_id, display_order) VALUES
    ('00000000-0000-0000-0009-00000000002d', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0002-00000000000a', 1),
    ('00000000-0000-0000-0009-00000000002e', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0002-00000000000e', 2),
    ('00000000-0000-0000-0009-00000000002f', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0002-000000000010', 3),
    ('00000000-0000-0000-0009-000000000030', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0004-000000000007', 4),
    ('00000000-0000-0000-0009-000000000031', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0004-000000000009', 5),
    ('00000000-0000-0000-0009-000000000032', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0005-000000000005', 6),
    ('00000000-0000-0000-0009-000000000033', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0005-000000000007', 7),
    ('00000000-0000-0000-0009-000000000034', '00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0006-000000000004', 8)
ON CONFLICT (id) DO NOTHING;
