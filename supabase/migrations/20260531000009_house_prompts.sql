CREATE TABLE house_prompts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  house       house_enum  NOT NULL,
  prompt_text text        NOT NULL,
  scheduled_for date      NOT NULL,
  created_by  uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (house, scheduled_for)
);

CREATE TABLE prompt_responses (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id       uuid        NOT NULL REFERENCES house_prompts(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            text        NOT NULL,   -- max 500 chars
  reaction_count  int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (prompt_id, user_id)
);

SELECT apply_updated_at('prompt_responses');

CREATE INDEX prompt_responses_prompt_idx ON prompt_responses (prompt_id, created_at);
CREATE INDEX prompt_responses_user_idx ON prompt_responses (user_id, created_at DESC);

CREATE TABLE prompt_response_reactions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id     uuid        NOT NULL REFERENCES prompt_responses(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type   text        NOT NULL DEFAULT 'house',  -- 'house' | emoji char
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (response_id, user_id, reaction_type)
);

ALTER TABLE house_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_response_reactions ENABLE ROW LEVEL SECURITY;

-- House members read their house's prompts
CREATE POLICY "prompts_read_own_house" ON house_prompts
  FOR SELECT TO authenticated USING (
    house = (SELECT house FROM users WHERE id = auth.uid())
  );

CREATE POLICY "prompts_admin_all" ON house_prompts
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- Responses: house members read, own user writes
CREATE POLICY "responses_read_own_house" ON prompt_responses
  FOR SELECT TO authenticated USING (
    prompt_id IN (
      SELECT id FROM house_prompts
      WHERE house = (SELECT house FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "responses_write_own" ON prompt_responses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "responses_update_own" ON prompt_responses
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Reactions: house members read + write
CREATE POLICY "response_reactions_house" ON prompt_response_reactions
  FOR ALL TO authenticated USING (
    (SELECT house FROM users WHERE id = auth.uid()) IS NOT NULL
  ) WITH CHECK (user_id = auth.uid());
