CREATE TABLE sorting_quiz_responses (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  responses       jsonb       NOT NULL,   -- {q1: {option_id, render_order[]}, ...}
  score_breakdown jsonb       NOT NULL,   -- {tinkerers: N, wanderers: N, ...}
  assigned_house  house_enum  NOT NULL,
  completed_at    timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE sorting_quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sorting_read_own" ON sorting_quiz_responses
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "sorting_insert_own" ON sorting_quiz_responses
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND
    NOT EXISTS (SELECT 1 FROM sorting_quiz_responses WHERE user_id = auth.uid())
  );

CREATE POLICY "sorting_admin_read" ON sorting_quiz_responses
  FOR SELECT TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
