## 1. Create V11 Migration File (MG-72)

- [x] 1.1 Create `recruitment-be/src/main/resources/db/migration/V11__seed_dev_data.sql`
- [x] 1.2 Insert admin user row: `id = '00000000-0000-0000-0000-000000000001'`, `email = 'admin@recruitment.dev'`, `role = 'ADMIN'`, `ON CONFLICT (id) DO NOTHING`
- [x] 1.3 Insert 6 tags with deterministic UUIDs: `algorithms`, `data-structures`, `oop`, `sql`, `system-design`, `java` — each `ON CONFLICT (id) DO NOTHING`

## 2. MCQ Questions (MG-72)

- [x] 2.1 Insert 8 MCQ `questions` rows (type='MCQ', created_by = admin UUID) with deterministic UUIDs
- [x] 2.2 Insert corresponding 8 `mcq_questions` rows (id = same UUID as questions row)
- [x] 2.3 Insert 4 `question_options` per MCQ (exactly 1 `is_correct = TRUE` per question)
  - Q1: Big-O complexity of binary search
  - Q2: Hash map average-case lookup
  - Q3: OOP polymorphism definition
  - Q4: SQL INNER JOIN behaviour on non-matching rows
  - Q5: Git `rebase` vs `merge` — which rewrites history
  - Q6: HTTP method that is idempotent but not safe
  - Q7: Binary tree — max nodes at depth d
  - Q8: SQL GROUP BY — which clause filters grouped results

## 3. TEXT Questions (MG-72)

- [x] 3.1 Insert 5 TEXT `questions` rows (type='TEXT') with deterministic UUIDs
- [x] 3.2 Insert corresponding 5 `text_questions` rows
  - Q9: Describe the Factory design pattern and a use case
  - Q10: Explain the SOLID principles — focus on SRP and OCP
  - Q11: Compare REST and GraphQL — trade-offs for a mobile client
  - Q12: Explain 3NF database normalisation with an example
  - Q13: How would you design a URL shortener — describe components and trade-offs

## 4. CODE_SUBMISSION Questions (MG-72)

- [x] 4.1 Insert 4 CODE_SUBMISSION `questions` rows (type='CODE_SUBMISSION') with deterministic UUIDs
- [x] 4.2 Insert corresponding 4 `code_submission_questions` rows with `language_hint`
  - Q14: Implement binary search — `language_hint = 'Java'`
  - Q15: Flatten a nested list — `language_hint = 'Python'`
  - Q16: Write a SQL query — total sales per product category, top 3 only — `language_hint = 'SQL'`
  - Q17: Reverse a string without built-in reverse — `language_hint = 'Java'`

## 5. GROUP Questions (MG-72)

- [x] 5.1 Insert 2 GROUP `questions` rows (type='GROUP') with deterministic UUIDs and scenario preamble in `body`
- [x] 5.2 Insert corresponding 2 `group_questions` rows
- [x] 5.3 Insert `group_question_members` rows:
  - Group 1 "Java OOP Scenario": member 1 = Q3 (MCQ, display_order=0), member 2 = Q10 (TEXT, display_order=1)
  - Group 2 "SQL Case Study": member 1 = Q8 (MCQ, display_order=0), member 2 = Q16 (CODE_SUBMISSION, display_order=1)

## 6. Tags and Assessments (MG-72)

- [x] 6.1 Insert `question_tags` rows linking questions to relevant tags (algorithms, data-structures, oop, sql, java, system-design)
- [x] 6.2 Insert 3 `assessments` rows with deterministic UUIDs:
  - "Junior Backend Developer" — PUBLISHED, time_limit_minutes=60
  - "Senior Full Stack Engineer" — PUBLISHED, time_limit_minutes=90
  - "SQL & Database Foundations" — DRAFT, time_limit_minutes=45
- [x] 6.3 Insert `assessment_questions` rows with display_order for each assessment:
  - Junior (8 questions): 5 MCQ (Q1,Q2,Q4,Q5,Q7) + 2 TEXT (Q9,Q12) + 1 CODE (Q14)
  - Senior (9 questions): 4 MCQ (Q3,Q6,Q7,Q8) + 3 TEXT (Q10,Q11,Q13) + 1 CODE (Q15) + 1 GROUP (G2)
  - SQL (8 questions): 5 MCQ (Q1,Q4,Q7,Q8,Q2) + 2 TEXT (Q12,Q13) + 1 CODE (Q16)

## 7. Verification (MG-72)

- [x] 7.1 Run `docker compose down -v && docker compose build backend && docker compose up -d`
- [x] 7.2 Log in → Question Bank shows 19 questions (8 MCQ, 5 TEXT, 4 CODE_SUBMISSION, 2 GROUP)
- [x] 7.3 Assessments page shows 3 entries — 2 PUBLISHED, 1 DRAFT
- [x] 7.4 Restart app without `-v` — no duplicate-key errors (idempotency confirmed)
