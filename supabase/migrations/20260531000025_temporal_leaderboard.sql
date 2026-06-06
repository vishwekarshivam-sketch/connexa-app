-- Drop existing all-time views
DROP MATERIALIZED VIEW IF EXISTS public.house_scores;
DROP MATERIALIZED VIEW IF EXISTS public.user_scores;

-- Create temporal house scores view
CREATE MATERIALIZED VIEW public.house_scores AS
  SELECT 
    house, 
    date_trunc('week', created_at)::date as week_start,
    SUM(points) AS score
  FROM public.points_ledger
  WHERE voided = false
  GROUP BY house, week_start;

CREATE UNIQUE INDEX house_scores_idx ON public.house_scores (house, week_start);

-- Create temporal user scores view
CREATE MATERIALIZED VIEW public.user_scores AS
  SELECT 
    user_id, 
    house, 
    date_trunc('week', created_at)::date as week_start,
    SUM(points) AS total_points
  FROM public.points_ledger
  WHERE voided = false
  GROUP BY user_id, house, week_start;

CREATE UNIQUE INDEX user_scores_idx ON public.user_scores (user_id, house, week_start);

-- Update refresh function to handle temporal views
CREATE OR REPLACE FUNCTION refresh_leaderboard_views()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY house_scores;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_scores;
  PERFORM pg_notify('leaderboard_refresh', '{}');
END;
$$;
