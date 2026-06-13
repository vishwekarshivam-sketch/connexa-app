-- RPC to claim an invite code
CREATE OR REPLACE FUNCTION public.claim_invite(p_invite_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_invite invites%ROWTYPE;
BEGIN
  -- 1. Check if the code exists and is not used
  SELECT * INTO v_invite 
  FROM invites 
  WHERE invite_code = p_invite_code 
    AND used_by IS NULL
  LIMIT 1;

  IF v_invite.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite code is invalid or already used');
  END IF;

  -- 2. Check if the user is already invited by someone else
  IF EXISTS (SELECT 1 FROM invites WHERE used_by = auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User has already claimed an invite');
  END IF;

  -- 3. Update the invite
  UPDATE invites
  SET used_by = auth.uid(),
      used_at = NOW()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object('success', true, 'invite_id', v_invite.id);
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.claim_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_invite(text) TO authenticated;
