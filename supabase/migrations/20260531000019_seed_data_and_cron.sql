-- [Section 21: Seed data]
-- Houses
INSERT INTO houses (id, display_name, hindi_name, slogan, primary_color, default_dark)
VALUES
  ('tinkerers',   'Tinkerers',   'Jugaadi',       'Build what does not exist.',         '#2C3D52', false),
  ('wanderers',   'Wanderers',   'Aawaaragard',   'Every path is worth walking.',        '#4A5A3E', false),
  ('strategists', 'Strategists', 'Shaatir',       'Think first, move once.',             '#A8421F', false),
  ('mavericks',   'Mavericks',   'Sherkhan',      'Rules are for those who need them.',  '#15161C', true);

-- Season config (singleton)
INSERT INTO season_config (id, season_start, season_end)
VALUES (1, '2026-07-01', '2027-05-31');

-- [Section 22: Cron jobs (Supabase pg_cron)]
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Refresh leaderboard every 60 seconds
SELECT cron.schedule('refresh-leaderboard', '* * * * *', 'SELECT refresh_leaderboard_views()');

-- Interest expiry sweep every hour
SELECT cron.schedule('expire-interests', '0 * * * *', $$
  UPDATE interests
  SET state = 'expired', resolved_at = NOW()
  WHERE state = 'pending' AND expires_at < NOW();
$$);

-- Notification batch fire (every minute)
SELECT cron.schedule('fire-notification-batches', '* * * * *', $$
  -- First, turn pending batches into real notification rows
  SELECT process_notification_batches();
  -- Then, trigger the Edge Function to send them via Push
  SELECT net.http_post(url := current_setting('app.notification_edge_fn_url'));
$$);

-- PrefVector decay (weekly, Sunday 2am)
SELECT cron.schedule('decay-pref-vectors', '0 2 * * 0', $$
  UPDATE date_pref_vectors SET vector = array(
    SELECT v * 0.98 FROM unnest(vector) v
  ), updated_at = NOW();
$$);

-- Prune old notifications (daily 3am)
SELECT cron.schedule('prune-notifications', '0 3 * * *', $$
  DELETE FROM notifications n
  WHERE n.id NOT IN (
    SELECT keep.id
    FROM notifications keep
    WHERE keep.user_id = n.user_id
    ORDER BY keep.created_at DESC
    LIMIT 30
  );
$$);
