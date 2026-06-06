CREATE TABLE verification_submissions (
  id              uuid                        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid                        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method          verification_method_enum    NOT NULL,
  iit             iit_enum                    NOT NULL,
  roll_number     text,
  doc_url         text,                       -- Supabase Storage path
  status          verification_status_enum    NOT NULL DEFAULT 'pending',
  admin_note      text,
  reviewed_by     uuid                        REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  created_at      timestamptz                 NOT NULL DEFAULT NOW()
);

CREATE INDEX verification_status_idx ON verification_submissions (status, created_at);

ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_read_own" ON verification_submissions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "verification_insert_own" ON verification_submissions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "verification_admin_all" ON verification_submissions
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
