-- Debug RPC to check if the profile exists from within the database context
-- bypassing client-side RLS, but running as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.debug_get_profile(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile jsonb;
  v_auth_uid uuid;
  v_role text;
BEGIN
  -- Check what the database thinks the current auth user is
  v_auth_uid := auth.uid();
  v_role := auth.role();

  SELECT to_jsonb(dp.*)
  INTO v_profile
  FROM public.date_profiles dp
  WHERE dp.user_id = p_user_id;

  RETURN jsonb_build_object(
    'p_user_id', p_user_id,
    'db_auth_uid', v_auth_uid,
    'db_auth_role', v_role,
    'profile_found', v_profile IS NOT NULL,
    'profile', v_profile
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.debug_get_profile(uuid) TO authenticated;
