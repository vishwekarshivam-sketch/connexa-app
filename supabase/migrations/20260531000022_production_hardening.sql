-- Production-readiness hardening pass (DB/schema/backend).
-- Applied live to project moznxzyjvqmepageblns. Mirrors the MCP-applied changes
-- so the repo source matches the deployed database.

-- ── C1: Lock down SECURITY DEFINER RPC execute grants ──────────────────────────
-- Trigger-only / internal functions: revoke from everyone.
REVOKE ALL ON FUNCTION public.handle_new_user_notif_settings() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_user_self_update()       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at()                 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_updated_at(text)           FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable()                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.award_points(uuid, house_enum, integer, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_leaderboard_views()      FROM PUBLIC, anon, authenticated;

-- Client-facing RPCs: authenticated-only (no anon).
REVOKE ALL ON FUNCTION public.complete_email_verification(text, iit_enum) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_email_verification(text, iit_enum) TO authenticated;
REVOKE ALL ON FUNCTION public.create_verification_submission(text, text, text, iit_enum, text, text, bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_verification_submission(text, text, text, iit_enum, text, text, bigint, text) TO authenticated;
REVOKE ALL ON FUNCTION public.express_interest(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.express_interest(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.withdraw_interest(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.withdraw_interest(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_prompt_response(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_prompt_response(uuid, text) TO authenticated;
REVOKE ALL ON FUNCTION public.get_date_browse_feed(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_date_browse_feed(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_house_home_data(house_enum) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_house_home_data(house_enum) TO authenticated;
REVOKE ALL ON FUNCTION public.get_leaderboard_data(house_enum) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_data(house_enum) TO authenticated;

-- ── C3: Fix mutable search_path on SECURITY DEFINER / trigger functions ─────────
-- search_path='' requires fully-qualified table names inside the body.
CREATE OR REPLACE FUNCTION public.handle_new_user_notif_settings()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.user_notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.set_updated_at()       SET search_path = '';
ALTER FUNCTION public.apply_updated_at(text)  SET search_path = public;

-- ── C2: Add read policies to RLS-enabled tables that had zero policies ──────────
DROP POLICY IF EXISTS season_config_read ON public.season_config;
CREATE POLICY season_config_read ON public.season_config
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS season_final_houses_read ON public.season_final_houses;
CREATE POLICY season_final_houses_read ON public.season_final_houses
  FOR SELECT TO authenticated USING (true);

-- ── C5: Seed launch-gating + content tables ────────────────────────────────────
INSERT INTO public.iit_unlock_dates (iit, unlock_at) VALUES
  ('iitb', now()), ('iitk', now()), ('iitd', now()), ('iitm', now()),
  ('iitr', now()), ('iitg', now()), ('iith', now()), ('iitkgp', now())
ON CONFLICT (iit) DO UPDATE SET unlock_at = EXCLUDED.unlock_at;

INSERT INTO public.house_prompts (house, prompt_text, scheduled_for)
SELECT h.house, p.prompt_text, (DATE '2026-05-31' + p.day_offset)
FROM (VALUES
  ('tinkerers'::house_enum), ('wanderers'::house_enum),
  ('strategists'::house_enum), ('mavericks'::house_enum)
) AS h(house)
CROSS JOIN (VALUES
  (0, 'What''s a small thing that made you smile this week?'),
  (1, 'If your housemates wrote a movie about you, what''s the title?'),
  (2, 'What''s one skill you''d teach the whole house in 5 minutes?'),
  (3, 'Hot take: best food spot on campus and why everyone''s wrong about it.'),
  (4, 'What''s a goal you''re chasing this semester?'),
  (5, 'Describe your ideal weekend in three emojis.'),
  (6, 'Who in the house should you team up with, and for what?')
) AS p(day_offset, prompt_text)
ON CONFLICT DO NOTHING;

-- ── C4: Wire notification-batch cron to the deployed edge function ──────────────
-- The original cron used current_setting('app.notification_edge_fn_url') which was
-- never set (failed every minute). Edge function `send-notifications` is deployed;
-- point the cron at it with the anon key for the functions gateway.
-- NOTE: replace the anon JWT below if the project anon key rotates.
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'fire-notification-batches'),
  command := $cmd$
    SELECT net.http_post(
      url := 'https://moznxzyjvqmepageblns.functions.supabase.co/send-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
      ),
      body := '{}'::jsonb
    );
  $cmd$,
  active := true
);
-- The live job hardcodes the anon key directly (GUC set at DB level is not settable
-- via the SQL API). See cron.job for the exact deployed command.

-- ── Perf: wrap auth.* in (select ...) so RLS evaluates once per query ───────────
DO $$
DECLARE
  r RECORD; v_qual text; v_check text; v_sql text;
BEGIN
  FOR r IN
    SELECT n.nspname AS sch, c.relname AS tbl, pol.polname AS pol,
           pg_get_expr(pol.polqual, pol.polrelid)      AS qual,
           pg_get_expr(pol.polwithcheck, pol.polrelid) AS wcheck
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
  LOOP
    v_qual := r.qual; v_check := r.wcheck;
    IF v_qual IS NOT NULL AND v_qual NOT LIKE '%select auth.%' THEN
      v_qual := replace(v_qual, 'auth.uid()',  '(select auth.uid())');
      v_qual := replace(v_qual, 'auth.jwt()',  '(select auth.jwt())');
      v_qual := replace(v_qual, 'auth.role()', '(select auth.role())');
    END IF;
    IF v_check IS NOT NULL AND v_check NOT LIKE '%select auth.%' THEN
      v_check := replace(v_check, 'auth.uid()',  '(select auth.uid())');
      v_check := replace(v_check, 'auth.jwt()',  '(select auth.jwt())');
      v_check := replace(v_check, 'auth.role()', '(select auth.role())');
    END IF;
    IF v_qual IS NOT DISTINCT FROM r.qual AND v_check IS NOT DISTINCT FROM r.wcheck THEN CONTINUE; END IF;
    v_sql := format('ALTER POLICY %I ON %I.%I', r.pol, r.sch, r.tbl);
    IF v_qual  IS NOT NULL THEN v_sql := v_sql || format(' USING (%s)', v_qual); END IF;
    IF v_check IS NOT NULL THEN v_sql := v_sql || format(' WITH CHECK (%s)', v_check); END IF;
    EXECUTE v_sql;
  END LOOP;
END $$;

-- ── Perf: covering indexes for all unindexed foreign keys ──────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_reports_message_id ON public.chat_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_reports_reporter ON public.chat_reports(reporter);
CREATE INDEX IF NOT EXISTS idx_date_behavior_events_target_user ON public.date_behavior_events(target_user);
CREATE INDEX IF NOT EXISTS idx_date_prompt_answers_user_id ON public.date_prompt_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_date_reports_reporter ON public.date_reports(reporter);
CREATE INDEX IF NOT EXISTS idx_date_reports_target ON public.date_reports(target);
CREATE INDEX IF NOT EXISTS idx_dm_messages_sender ON public.dm_messages(sender);
CREATE INDEX IF NOT EXISTS idx_house_messages_deleted_by ON public.house_messages(deleted_by);
CREATE INDEX IF NOT EXISTS idx_house_messages_user_id ON public.house_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_house_prompts_created_by ON public.house_prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_house_threads_pinned_msg_id ON public.house_threads(pinned_msg_id);
CREATE INDEX IF NOT EXISTS idx_house_threads_prompt_id ON public.house_threads(prompt_id);
CREATE INDEX IF NOT EXISTS idx_interests_match_id ON public.interests(match_id);
CREATE INDEX IF NOT EXISTS idx_interests_to_user ON public.interests(to_user);
CREATE INDEX IF NOT EXISTS idx_intro_comments_user_id ON public.intro_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_intro_reactions_user_id ON public.intro_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_intro_reports_intro_id ON public.intro_reports(intro_id);
CREATE INDEX IF NOT EXISTS idx_intro_reports_reporter ON public.intro_reports(reporter);
CREATE INDEX IF NOT EXISTS idx_invites_used_by ON public.invites(used_by);
CREATE INDEX IF NOT EXISTS idx_matches_closed_by ON public.matches(closed_by);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_voided_by ON public.points_ledger(voided_by);
CREATE INDEX IF NOT EXISTS idx_prompt_response_reactions_user_id ON public.prompt_response_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_season_config_crowned_user_id ON public.season_config(crowned_user_id);
CREATE INDEX IF NOT EXISTS idx_thread_read_state_thread_id ON public.thread_read_state(thread_id);
CREATE INDEX IF NOT EXISTS idx_verification_submissions_reviewed_by ON public.verification_submissions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_verification_submissions_user_id ON public.verification_submissions(user_id);

-- ── HIGH: scope message_reactions (was qual=true → any user read/del any row) ───
DROP POLICY IF EXISTS reactions_house_members ON public.message_reactions;
DROP POLICY IF EXISTS reactions_read_house ON public.message_reactions;
CREATE POLICY reactions_read_house ON public.message_reactions
  FOR SELECT TO authenticated
  USING (
    message_id IN (
      SELECT m.id FROM public.house_messages m
      JOIN public.house_threads t ON t.id = m.thread_id
      WHERE t.house = (SELECT u.house FROM public.users u WHERE u.id = (select auth.uid()))
    )
  );
DROP POLICY IF EXISTS reactions_insert_own ON public.message_reactions;
CREATE POLICY reactions_insert_own ON public.message_reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
DROP POLICY IF EXISTS reactions_delete_own ON public.message_reactions;
CREATE POLICY reactions_delete_own ON public.message_reactions
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- ── HIGH: leaderboard matviews not anon-readable; authenticated keeps direct read ─
REVOKE ALL ON public.house_scores FROM anon;
REVOKE ALL ON public.user_scores  FROM anon;
GRANT SELECT ON public.house_scores TO authenticated;
GRANT SELECT ON public.user_scores  TO authenticated;
