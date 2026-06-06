CREATE TABLE house_threads (
  id          uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  house       house_enum        NOT NULL,
  type        thread_type_enum  NOT NULL,
  prompt_id   uuid              REFERENCES house_prompts(id) ON DELETE SET NULL,
  title       text,
  pinned_msg_id uuid,
  read_only   boolean           NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at  timestamptz       NOT NULL DEFAULT NOW()
);

CREATE INDEX threads_house_idx ON house_threads (house, created_at DESC);

CREATE TABLE house_messages (
  id          uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid              NOT NULL REFERENCES house_threads(id) ON DELETE CASCADE,
  user_id     uuid              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        text              NOT NULL,
  status      message_status_enum NOT NULL DEFAULT 'active',
  deleted_by  uuid              REFERENCES users(id) ON DELETE SET NULL,
  deleted_at  timestamptz,
  created_at  timestamptz       NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_thread_idx ON house_messages (thread_id, created_at DESC);

-- Circular FK: house_threads.pinned_msg_id → house_messages
ALTER TABLE house_threads
  ADD CONSTRAINT fk_pinned_msg
  FOREIGN KEY (pinned_msg_id) REFERENCES house_messages(id) ON DELETE SET NULL;

-- Enforce one pin per thread via unique partial index
CREATE UNIQUE INDEX one_pin_per_thread ON house_threads (id)
  WHERE pinned_msg_id IS NOT NULL;

CREATE TABLE message_reactions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      uuid        NOT NULL REFERENCES house_messages(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type   text        NOT NULL,   -- 'house' | emoji char
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, user_id, reaction_type)
);

CREATE TABLE thread_read_state (
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id   uuid        NOT NULL REFERENCES house_threads(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, thread_id)
);

ALTER TABLE house_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_read_state ENABLE ROW LEVEL SECURITY;

-- All chat policies: house members only
CREATE POLICY "chat_house_members" ON house_threads
  FOR SELECT TO authenticated USING (
    house = (SELECT house FROM users WHERE id = auth.uid())
  );

CREATE POLICY "messages_house_members_read" ON house_messages
  FOR SELECT TO authenticated USING (
    thread_id IN (
      SELECT id FROM house_threads
      WHERE house = (SELECT house FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_own" ON house_messages
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() AND
    -- Thread must not be read_only
    NOT (SELECT read_only FROM house_threads WHERE id = thread_id)
  );

CREATE POLICY "messages_delete_own_or_leader" ON house_messages
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR
    (SELECT is_house_leader FROM users WHERE id = auth.uid())
  );

CREATE POLICY "reactions_house_members" ON message_reactions
  FOR ALL TO authenticated USING (true) WITH CHECK (user_id = auth.uid());

CREATE POLICY "read_state_own" ON thread_read_state
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
