-- Fix GROUP question max_score to equal the sum of member question max_scores.
-- The original seed set every group to max_score = 1 regardless of members.
UPDATE questions
SET max_score = (
    SELECT SUM(mq.max_score)
    FROM group_question_members gqm
    JOIN questions mq ON gqm.question_id = mq.id
    WHERE gqm.group_question_id = questions.id
)
WHERE id IN (SELECT id FROM group_questions);
