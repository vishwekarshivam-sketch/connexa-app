CREATE TABLE introductions (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid              NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  status          intro_status_enum NOT NULL DEFAULT 'draft',
  photo_url       text              NOT NULL,
  display_name    text              NOT NULL,
  iit             iit_enum          NOT NULL,
  branch          text              NOT NULL,
  hometown        text              NOT NULL,
  one_liner       text              NOT NULL,    -- max 120 chars
  interests       text[],                        -- max 3 tags
  question        text,                          -- max 100 chars
  ig_queued_at    timestamptz,
  ig_posted_at    timestamptz,
  created_at      timestamptz       NOT NULL DEFAULT NOW(),
  updated_at      timestamptz       NOT NULL DEFAULT NOW()
);

SELECT apply_updated_at('introductions');

CREATE INDEX intro_iit_idx ON introductions (iit) WHERE status = 'posted';
CREATE INDEX intro_created_idx ON introductions (created_at DESC) WHERE status = 'posted';

CREATE TABLE intro_reactions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  intro_id    uuid        NOT NULL REFERENCES introductions(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (intro_id, user_id)
);

CREATE TABLE intro_comments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  intro_id    uuid        NOT NULL REFERENCES introductions(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        text        NOT NULL,   -- max 280 chars
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX intro_comments_intro_idx ON intro_comments (intro_id, created_at);

ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_comments ENABLE ROW LEVEL SECURITY;

-- All verified users can read posted intros
CREATE POLICY "intro_read_posted" ON introductions
  FOR SELECT TO authenticated USING (status IN ('posted', 'ig_locked'));

-- Freshers read own draft
CREATE POLICY "intro_read_own_draft" ON introductions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Freshers insert/update own
CREATE POLICY "intro_write_own" ON introductions
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Reactions: all verified users
CREATE POLICY "intro_reactions_read" ON intro_reactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "intro_reactions_write_own" ON intro_reactions
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comments: freshers only write, all read non-deleted
CREATE POLICY "intro_comments_read" ON intro_comments
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "intro_comments_write" ON intro_comments
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND
    (SELECT user_type FROM users WHERE id = auth.uid()) = 'fresher'
  );
