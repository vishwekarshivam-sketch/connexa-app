CREATE TABLE interests (
  id          uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user   uuid                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user     uuid                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state       interest_state_enum NOT NULL DEFAULT 'pending',
  expires_at  timestamptz         NOT NULL,   -- created_at + 14 days
  resolved_at timestamptz,
  match_id    uuid,
  created_at  timestamptz         NOT NULL DEFAULT NOW()
);

-- Dedupe: max one active interest per ordered pair
CREATE UNIQUE INDEX interests_active_pair ON interests (from_user, to_user)
  WHERE state IN ('pending', 'mutual');

CREATE INDEX interests_from_state_idx ON interests (from_user, state);
CREATE INDEX interests_expiry_idx ON interests (expires_at) WHERE state = 'pending';

CREATE TABLE date_behavior_events (
  id          bigserial   PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        text        NOT NULL,   -- 'view' | 'dwell' | 'express' | 'skip' | 'hide' | 'block' | 'report'
  dwell_ms    int,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX behavior_user_idx ON date_behavior_events (user_id, created_at);

ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_behavior_events ENABLE ROW LEVEL SECURITY;

-- Interests: users read only their sent interests (never see received pending)
CREATE POLICY "interests_read_sent" ON interests
  FOR SELECT TO authenticated USING (from_user = auth.uid());

-- Interests: write via RPC only (slot cap enforced atomically)
-- Direct INSERT blocked:
CREATE POLICY "interests_no_direct_write" ON interests
  FOR INSERT TO authenticated WITH CHECK (false);

-- Behavior events: write own, never read
CREATE POLICY "behavior_insert_own" ON date_behavior_events
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
