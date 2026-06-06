CREATE TABLE invites (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code     text        NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  used_by         uuid        REFERENCES users(id) ON DELETE SET NULL,
  used_at         timestamptz,
  bonus_earned    boolean     NOT NULL DEFAULT false,
  bonus_earned_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX invites_inviter_idx ON invites (inviter_id);
CREATE INDEX invites_code_idx ON invites (invite_code);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_read_own" ON invites
  FOR SELECT TO authenticated USING (inviter_id = auth.uid());

CREATE POLICY "invites_admin_read" ON invites
  FOR SELECT TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
