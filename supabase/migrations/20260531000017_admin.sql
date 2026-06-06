CREATE TABLE admin_audit_log (
  id          bigserial   PRIMARY KEY,
  admin_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      text        NOT NULL,
  target_type text,       -- 'user' | 'message' | 'intro' | 'prompt' | 'season' etc.
  target_id   text,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_admin_idx ON admin_audit_log (admin_id, created_at DESC);

CREATE TABLE admin_notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text        NOT NULL,
  body        text        NOT NULL,
  read        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE iit_unlock_dates (
  iit         iit_enum    PRIMARY KEY,
  unlock_at   timestamptz NOT NULL
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE iit_unlock_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_only" ON admin_audit_log
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

CREATE POLICY "admin_notifs_admin_only" ON admin_notifications
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

CREATE POLICY "iit_unlock_read_all" ON iit_unlock_dates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "iit_unlock_admin_write" ON iit_unlock_dates
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
