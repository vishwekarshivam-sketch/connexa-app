CREATE TABLE user_notification_settings (
  user_id             uuid              PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  daily_prompt        boolean           NOT NULL DEFAULT true,
  reaction            boolean           NOT NULL DEFAULT true,
  invite_converted    boolean           NOT NULL DEFAULT true,
  retention_bonus     boolean           NOT NULL DEFAULT true,
  mutual_match        boolean           NOT NULL DEFAULT true,
  streak_milestone    boolean           NOT NULL DEFAULT true,
  house_rank_change   boolean           NOT NULL DEFAULT false,
  monthly_reveal      boolean           NOT NULL DEFAULT true,
  updated_at          timestamptz       NOT NULL DEFAULT NOW()
);

ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notif_settings_own" ON user_notification_settings
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger to create settings row on user creation
CREATE OR REPLACE FUNCTION handle_new_user_notif_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notification_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_notif_settings
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_notif_settings();
