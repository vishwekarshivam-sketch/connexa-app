-- House home batch load
CREATE OR REPLACE FUNCTION get_house_home_data(p_house_id house_enum)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today date := CURRENT_DATE;
BEGIN
  RETURN jsonb_build_object(
    'today_prompt', (
      SELECT to_jsonb(p)
      FROM house_prompts p
      WHERE p.house = p_house_id AND p.scheduled_for <= v_today
      ORDER BY p.scheduled_for DESC
      LIMIT 1
    ),
    'threads', COALESCE((
      SELECT jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC)
      FROM house_threads t
      WHERE t.house = p_house_id AND t.archived_at IS NULL
      LIMIT 10
    ), '[]'::jsonb),
    'members_count', (
      SELECT COUNT(*) FROM users u WHERE u.house = p_house_id AND u.status IN ('onboarding', 'active')
    )
  );
END;
$$;

-- Leaderboard top-50 + user rank
CREATE OR REPLACE FUNCTION get_leaderboard_data(p_house_id house_enum)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN jsonb_build_object(
    'houses', COALESCE((SELECT jsonb_agg(to_jsonb(h) ORDER BY h.total_points DESC) FROM house_scores h), '[]'::jsonb),
    'users', COALESCE((
      SELECT jsonb_agg(to_jsonb(s) ORDER BY s.total_points DESC)
      FROM user_scores s
      WHERE s.house = p_house_id
      LIMIT 50
    ), '[]'::jsonb)
  );
END;
$$;

-- Date browse feed (filtered by RLS-sensitive rules inside SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_date_browse_feed(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pref_gender gender_enum[];
  v_pref_iits iit_enum[];
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot browse for another user';
  END IF;

  -- Load user preferences
  SELECT pref_gender, pref_iits INTO v_pref_gender, v_pref_iits
  FROM date_prefs
  WHERE user_id = p_user_id;

  RETURN COALESCE((
    SELECT jsonb_agg(
      feed_item.profile_data
    )
    FROM (
      SELECT 
        to_jsonb(dp)
        || jsonb_build_object(
          'photos', COALESCE((SELECT jsonb_agg(to_jsonb(ph) ORDER BY ph.position) FROM date_photos ph WHERE ph.user_id = dp.user_id), '[]'::jsonb),
          'prompts', COALESCE((SELECT jsonb_agg(to_jsonb(pa) ORDER BY pa.position) FROM date_prompt_answers pa WHERE pa.user_id = dp.user_id), '[]'::jsonb),
          'compatibility_score', calculate_date_score(p_user_id, dp.user_id)
        ) as profile_data
      FROM date_profiles dp
      WHERE dp.status = 'active'
        AND dp.user_id <> p_user_id
        -- Completeness gate: ≥1 photo AND ≥2 prompts
        AND EXISTS (SELECT 1 FROM date_photos WHERE user_id = dp.user_id LIMIT 1)
        AND (SELECT COUNT(*) FROM date_prompt_answers WHERE user_id = dp.user_id) >= 2
        -- Preference filtering
        AND (v_pref_gender IS NULL OR dp.gender = ANY(v_pref_gender))
        AND (v_pref_iits IS NULL OR dp.iit = ANY(v_pref_iits))
        -- Block/Hide filtering: mutual removal
        AND NOT EXISTS (
          SELECT 1 FROM block_hides bh
          WHERE (bh.from_user = p_user_id AND bh.to_user = dp.user_id)
             OR (bh.to_user = p_user_id AND bh.from_user = dp.user_id)
        )
        -- Don't show if already matched or pending interest exists
        AND NOT EXISTS (
          SELECT 1 FROM interests i
          WHERE i.from_user = p_user_id AND i.to_user = dp.user_id AND i.state IN ('pending', 'mutual')
        )
      ORDER BY 2 DESC -- Order by compatibility_score
      LIMIT 20
    ) feed_item
  ), '[]'::jsonb);
END;
$$;

-- Submit prompt response (writes response + awards points atomically)
CREATE OR REPLACE FUNCTION submit_prompt_response(p_prompt_id uuid, p_body text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_response prompt_responses%ROWTYPE;
  v_house house_enum;
BEGIN
  SELECT house INTO v_house FROM users WHERE id = auth.uid();
  IF v_house IS NULL THEN
    RAISE EXCEPTION 'User is not assigned to a house';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM house_prompts WHERE id = p_prompt_id AND house = v_house) THEN
    RAISE EXCEPTION 'Prompt is not available to this user';
  END IF;

  INSERT INTO prompt_responses (prompt_id, user_id, body)
  VALUES (p_prompt_id, auth.uid(), left(trim(p_body), 500))
  ON CONFLICT (prompt_id, user_id) DO UPDATE
  SET body = EXCLUDED.body, updated_at = NOW()
  RETURNING * INTO v_response;

  PERFORM award_points(auth.uid(), v_house, 10, 'prompt_response', 'prompt_response:' || p_prompt_id || ':' || auth.uid());
  RETURN to_jsonb(v_response);
END;
$$;

-- Express interest (slot cap enforced, mutual detection, match creation)
CREATE OR REPLACE FUNCTION express_interest(p_target_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_interest interests%ROWTYPE;
  v_reverse interests%ROWTYPE;
  v_match_id uuid;
  v_user_a uuid;
  v_user_b uuid;
  v_pending_count int;
BEGIN
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot express interest in yourself';
  END IF;

  -- Enforce 3-slot cap for pending interests
  SELECT COUNT(*) INTO v_pending_count
  FROM interests
  WHERE from_user = auth.uid() AND state = 'pending';

  IF v_pending_count >= 3 THEN
    -- Check if we already have a pending interest in this specific target (update allowed)
    IF NOT EXISTS (
      SELECT 1 FROM interests 
      WHERE from_user = auth.uid() AND to_user = p_target_user_id AND state = 'pending'
    ) THEN
      RAISE EXCEPTION 'You have reached the limit of 3 pending interests. Withdraw one to express interest in someone else.';
    END IF;
  END IF;

  SELECT * INTO v_reverse
  FROM interests
  WHERE from_user = p_target_user_id
    AND to_user = auth.uid()
    AND state = 'pending'
  LIMIT 1;

  INSERT INTO interests (from_user, to_user, state, expires_at)
  VALUES (auth.uid(), p_target_user_id, CASE WHEN v_reverse.id IS NULL THEN 'pending' ELSE 'mutual' END, NOW() + INTERVAL '14 days')
  ON CONFLICT (from_user, to_user) WHERE state IN ('pending', 'mutual')
  DO UPDATE SET state = EXCLUDED.state, expires_at = EXCLUDED.expires_at
  RETURNING * INTO v_interest;

  IF v_reverse.id IS NOT NULL THEN
    v_user_a := LEAST(auth.uid(), p_target_user_id);
    v_user_b := GREATEST(auth.uid(), p_target_user_id);

    INSERT INTO matches (user_a, user_b)
    VALUES (v_user_a, v_user_b)
    ON CONFLICT (user_a, user_b) DO UPDATE SET state = 'active'
    RETURNING id INTO v_match_id;

    INSERT INTO dm_threads (match_id) VALUES (v_match_id)
    ON CONFLICT (match_id) DO NOTHING;

    UPDATE interests
    SET state = 'mutual', match_id = v_match_id, resolved_at = NOW()
    WHERE id IN (v_interest.id, v_reverse.id);

    -- Award points for mutual match
    PERFORM award_points(auth.uid(), (SELECT house FROM users WHERE id = auth.uid()), 50, 'mutual_match', 'match:' || v_match_id || ':' || auth.uid());
    PERFORM award_points(p_target_user_id, (SELECT house FROM users WHERE id = p_target_user_id), 50, 'mutual_match', 'match:' || v_match_id || ':' || p_target_user_id);

    v_interest.state := 'mutual';
    v_interest.match_id := v_match_id;
  END IF;

  RETURN to_jsonb(v_interest);
END;
$$;

-- Withdraw interest
CREATE OR REPLACE FUNCTION withdraw_interest(p_interest_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE interests
  SET state = 'withdrawn', resolved_at = NOW()
  WHERE id = p_interest_id AND from_user = auth.uid() AND state = 'pending';
END;
$$;

-- Refresh materialized views (called by cron job)
CREATE OR REPLACE FUNCTION refresh_leaderboard_views()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY house_scores;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_scores;
  PERFORM pg_notify('leaderboard_refresh', '{}');
END;
$$;

-- Get house threads with unread status and last message preview
CREATE OR REPLACE FUNCTION get_house_threads(p_house house_enum)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN COALESCE((
    SELECT jsonb_agg(t_data)
    FROM (
      SELECT 
        ht.*,
        COALESCE(
          (SELECT jsonb_build_object(
            'body', hm.body,
            'created_at', hm.created_at
          )
          FROM house_messages hm
          WHERE hm.thread_id = ht.id
          ORDER BY hm.created_at DESC
          LIMIT 1),
          NULL
        ) as last_message,
        (SELECT COUNT(*) FROM house_messages WHERE thread_id = ht.id) as response_count,
        EXISTS (
          SELECT 1 
          FROM house_messages hm
          LEFT JOIN thread_read_state trs ON trs.thread_id = ht.id AND trs.user_id = auth.uid()
          WHERE hm.thread_id = ht.id 
            AND (trs.last_read_at IS NULL OR hm.created_at > trs.last_read_at)
            AND hm.user_id <> auth.uid()
        ) as is_unread
      FROM house_threads ht
      WHERE ht.house = p_house AND ht.archived_at IS NULL
      ORDER BY ht.created_at DESC
    ) t_data
  ), '[]'::jsonb);
END;
$$;

-- Complete email verification (Post-OTP)
CREATE OR REPLACE FUNCTION complete_email_verification(
  requested_user_type text,
  requested_iit iit_enum
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_type user_type_enum;
  v_profile users%ROWTYPE;
BEGIN
  IF requested_user_type = 'fresher' THEN
    v_user_type := 'fresher';
  ELSE
    v_user_type := 'non_fresher';
  END IF;

  INSERT INTO public.users (id, email, user_type, iit, status)
  VALUES (
    auth.uid(),
    COALESCE(auth.jwt()->>'email', auth.uid()::text || '@anonymous.connexa.local'),
    v_user_type,
    requested_iit,
    'onboarding'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    user_type = EXCLUDED.user_type,
    iit = EXCLUDED.iit,
    status = 'onboarding',
    updated_at = NOW()
  RETURNING * INTO v_profile;

  RETURN to_jsonb(v_profile);
END;
$$;

-- Create manual verification submission for document-based onboarding.
CREATE OR REPLACE FUNCTION create_verification_submission(
  contact_email text,
  roll_number text,
  full_name text,
  iit iit_enum,
  document_path text,
  document_mime_type text DEFAULT NULL,
  document_size bigint DEFAULT NULL,
  document_extension text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile users%ROWTYPE;
BEGIN
  INSERT INTO users (id, email, user_type, iit, status, display_name)
  VALUES (auth.uid(), lower(trim(contact_email)), 'fresher', iit, 'pending', nullif(trim(full_name), ''))
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      iit = EXCLUDED.iit,
      display_name = EXCLUDED.display_name,
      updated_at = NOW()
  RETURNING * INTO v_profile;

  INSERT INTO verification_submissions (user_id, method, iit, roll_number, doc_url, status)
  VALUES (auth.uid(), 'roll_doc', iit, roll_number, document_path, 'pending')
  ON CONFLICT DO NOTHING;

  RETURN to_jsonb(v_profile);
END;
$$;
