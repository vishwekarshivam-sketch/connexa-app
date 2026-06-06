CREATE TABLE chat_reports (
  id          uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter    uuid                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id  uuid                  NOT NULL REFERENCES house_messages(id) ON DELETE CASCADE,
  category    report_category_enum  NOT NULL,
  note        text,
  mod_status  report_status_enum    NOT NULL DEFAULT 'open',
  created_at  timestamptz           NOT NULL DEFAULT NOW()
);

CREATE TABLE intro_reports (
  id          uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter    uuid                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intro_id    uuid                  NOT NULL REFERENCES introductions(id) ON DELETE CASCADE,
  category    report_category_enum  NOT NULL,
  note        text,
  mod_status  report_status_enum    NOT NULL DEFAULT 'open',
  created_at  timestamptz           NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_reports_write" ON chat_reports
  FOR INSERT TO authenticated WITH CHECK (reporter = auth.uid());

CREATE POLICY "chat_reports_admin" ON chat_reports
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

CREATE POLICY "intro_reports_write" ON intro_reports
  FOR INSERT TO authenticated WITH CHECK (reporter = auth.uid());

CREATE POLICY "intro_reports_admin" ON intro_reports
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
