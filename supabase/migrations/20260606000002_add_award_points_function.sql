-- Award points (internal, called by other RPCs)
-- Takes a dedupe_key to prevent double-awarding for the same action.
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id uuid, 
  p_house house_enum, 
  p_points int,
  p_reason text, 
  p_dedupe_key text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO points_ledger (user_id, house, points, reason, dedupe_key)
  VALUES (p_user_id, p_house, p_points, p_reason, p_dedupe_key)
  ON CONFLICT (dedupe_key) DO NOTHING;
END;
$$;

-- Ensure execute permissions are locked down ( hardening will be re-applied by existing scripts if run, but good to have here )
REVOKE ALL ON FUNCTION public.award_points(uuid, house_enum, integer, text, text) FROM PUBLIC, anon, authenticated;
