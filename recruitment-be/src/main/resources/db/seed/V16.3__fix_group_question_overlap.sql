-- Several assessments have a GROUP question whose members were ALSO added to the same
-- assessment as their own standalone assessment_questions rows. This caused those
-- questions' scores to be counted twice when results were computed. Remove the redundant
-- standalone entries — the GROUP already carries them.

-- Assessment 2 (Senior Full Stack Engineer) / Group 2: member "HAVING vs WHERE" MCQ
-- was also standalone.
DELETE FROM assessment_questions
WHERE assessment_id = '00000000-0000-0000-0008-000000000002'
  AND question_id = '00000000-0000-0000-0002-000000000008';

-- Assessment 4 (Frontend JavaScript Developer) / Group 5 ("REST API Design Scenario"):
-- both members ("REST: Statelessness", "REST vs GraphQL") were also standalone.
DELETE FROM assessment_questions
WHERE assessment_id = '00000000-0000-0000-0008-000000000004'
  AND question_id IN (
      '00000000-0000-0000-0002-00000000000c', -- REST: Statelessness
      '00000000-0000-0000-0004-000000000003'   -- REST vs GraphQL
  );

-- Assessment 5 (Java Backend Engineer) / Group 4 ("Java Error Handling"): both members
-- ("final keyword", "checked/unchecked exceptions") were also standalone.
DELETE FROM assessment_questions
WHERE assessment_id = '00000000-0000-0000-0008-000000000005'
  AND question_id IN (
      '00000000-0000-0000-0002-00000000000a', -- Java: The final Keyword
      '00000000-0000-0000-0002-00000000000e'   -- Java: Checked vs Unchecked Exceptions
  );
