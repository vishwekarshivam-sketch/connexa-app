CREATE TABLE matches (
  id          uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a      uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b      uuid            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state       match_state_enum NOT NULL DEFAULT 'active',
  closed_at   timestamptz,
  closed_by   uuid            REFERENCES users(id) ON DELETE SET NULL,
  close_reason close_reason_enum,
  created_at  timestamptz     NOT NULL DEFAULT NOW(),
  CONSTRAINT user_a_lt_b CHECK (user_a < user_b)
);

CREATE UNIQUE INDEX matches_pair_idx ON matches (user_a, user_b);
CREATE INDEX matches_user_idx ON matches (user_a) WHERE state = 'active';
CREATE INDEX matches_user_b_idx ON matches (user_b) WHERE state = 'active';

-- Circular FK: interests.match_id → matches
ALTER TABLE interests
  ADD CONSTRAINT fk_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL;

CREATE TABLE dm_threads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid        NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  state       text        NOT NULL DEFAULT 'open',   -- 'open' | 'closed'
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE dm_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid        NOT NULL REFERENCES dm_threads(id) ON DELETE CASCADE,
  sender      uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX dm_messages_thread_idx ON dm_messages (thread_id, created_at);

CREATE TABLE block_hides (
  id          uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user   uuid                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user     uuid                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        blockhide_kind_enum NOT NULL,
  created_at  timestamptz         NOT NULL DEFAULT NOW(),
  UNIQUE (from_user, to_user, kind)
);

CREATE INDEX block_hides_from_idx ON block_hides (from_user, to_user);
CREATE INDEX block_hides_to_idx ON block_hides (to_user, from_user);

CREATE TABLE date_reports (
  id          uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter    uuid                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target      uuid                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    report_category_enum  NOT NULL,
  note        text,
  mod_status  report_status_enum    NOT NULL DEFAULT 'open',
  created_at  timestamptz           NOT NULL DEFAULT NOW()
);

CREATE INDEX date_reports_status_idx ON date_reports (mod_status, created_at);
CREATE INDEX date_reports_category_idx ON date_reports (category) WHERE category = 'underage';

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_hides ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_reports ENABLE ROW LEVEL SECURITY;

-- Matches: both parties read their own matches
CREATE POLICY "matches_read_own" ON matches
  FOR SELECT TO authenticated USING (
    user_a = auth.uid() OR user_b = auth.uid()
  );

-- Threads: both parties
CREATE POLICY "dm_threads_read_own" ON dm_threads
  FOR SELECT TO authenticated USING (
    match_id IN (
      SELECT id FROM matches WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

-- Messages: both parties in the match
CREATE POLICY "dm_messages_read_own" ON dm_messages
  FOR SELECT TO authenticated USING (
    thread_id IN (
      SELECT t.id FROM dm_threads t
      JOIN matches m ON t.match_id = m.id
      WHERE m.user_a = auth.uid() OR m.user_b = auth.uid()
    )
  );

CREATE POLICY "dm_messages_insert_own" ON dm_messages
  FOR INSERT TO authenticated WITH CHECK (sender = auth.uid());

-- Block/hide: read own sent
CREATE POLICY "block_hides_read_own" ON block_hides
  FOR SELECT TO authenticated USING (from_user = auth.uid());

CREATE POLICY "block_hides_write_own" ON block_hides
  FOR INSERT TO authenticated WITH CHECK (from_user = auth.uid());

-- Reports: write only
CREATE POLICY "date_reports_write" ON date_reports
  FOR INSERT TO authenticated WITH CHECK (reporter = auth.uid());

CREATE POLICY "date_reports_admin" ON date_reports
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
