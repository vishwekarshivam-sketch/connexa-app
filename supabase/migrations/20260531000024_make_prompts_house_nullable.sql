-- Allow universal prompts by making house column nullable
ALTER TABLE public.house_prompts ALTER COLUMN house DROP NOT NULL;

-- Update the house_home_data RPC to include universal prompts
CREATE OR REPLACE FUNCTION get_house_home_data(p_house_id house_enum)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today date := CURRENT_DATE;
BEGIN
  RETURN jsonb_build_object(
    'today_prompt', (
      SELECT to_jsonb(p)
      FROM house_prompts p
      WHERE (p.house = p_house_id OR p.house IS NULL) AND p.scheduled_for <= v_today
      ORDER BY p.scheduled_for DESC, p.house NULLS LAST
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
