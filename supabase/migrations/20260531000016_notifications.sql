CREATE TABLE push_subscriptions (
  id          uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint    text              NOT NULL,
  p256dh      text              NOT NULL,
  auth        text              NOT NULL,
  platform    push_platform_enum NOT NULL DEFAULT 'web',
  status      push_status_enum  NOT NULL DEFAULT 'active',
  created_at  timestamptz       NOT NULL DEFAULT NOW(),
  last_used_at timestamptz
);

CREATE INDEX push_subs_user_idx ON push_subscriptions (user_id, status);
CREATE UNIQUE INDEX push_subs_user_endpoint_key ON push_subscriptions (user_id, endpoint);

CREATE TABLE notifications (
  id          uuid                      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid                      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    notification_category_enum NOT NULL,
  title       text,
  body        text                      NOT NULL,
  deep_link   text                      NOT NULL,
  read        boolean                   NOT NULL DEFAULT false,
  push_sent   boolean                   NOT NULL DEFAULT false,
  push_sent_at timestamptz,
  created_at  timestamptz               NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_idx ON notifications (user_id, read, created_at DESC);

CREATE TABLE notification_batch_state (
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    text        NOT NULL,
  batch_data  jsonb       NOT NULL DEFAULT '{}',
  window_start timestamptz NOT NULL DEFAULT NOW(),
  fire_at     timestamptz NOT NULL,
  fired       boolean     NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, category)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_batch_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subs_own" ON push_subscriptions
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_read_own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Batch state: internal, no client read
CREATE POLICY "batch_state_admin_only" ON notification_batch_state
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
