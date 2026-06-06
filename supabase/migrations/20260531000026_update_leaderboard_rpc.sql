-- Update the leaderboard_data RPC to use temporal views and filter by current week
CREATE OR REPLACE FUNCTION get_leaderboard_data(p_house_id house_enum)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_week_start date := date_trunc('week', CURRENT_DATE)::date;
BEGIN
  RETURN jsonb_build_object(
    'houses', COALESCE((
      SELECT jsonb_agg(to_jsonb(h) ORDER BY h.score DESC) 
      FROM house_scores h 
      WHERE h.week_start = v_week_start
    ), '[]'::jsonb),
    'users', COALESCE((
      SELECT jsonb_agg(to_jsonb(s) ORDER BY s.total_points DESC)
      FROM user_scores s
      WHERE s.house = p_house_id AND s.week_start = v_week_start
      LIMIT 50
    ), '[]'::jsonb)
  );
END;
$$;
