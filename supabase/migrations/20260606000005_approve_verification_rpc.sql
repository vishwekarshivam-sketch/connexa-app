-- RPC to approve verification and award referral points
CREATE OR REPLACE FUNCTION public.approve_verification(p_submission_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sub verification_submissions%ROWTYPE;
  v_invite invites%ROWTYPE;
  v_inviter_house house_enum;
BEGIN
  -- 1. Check if caller is admin
  IF NOT (SELECT is_admin FROM users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can approve verifications';
  END IF;

  -- 2. Load submission
  SELECT * INTO v_sub FROM verification_submissions WHERE id = p_submission_id;
  IF v_sub.id IS NULL THEN RAISE EXCEPTION 'Submission not found'; END IF;
  IF v_sub.status <> 'pending' THEN RAISE EXCEPTION 'Submission is already processed'; END IF;

  -- 3. Update submission status
  UPDATE verification_submissions
  SET status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
  WHERE id = p_submission_id;

  -- 4. Update user status
  UPDATE users
  SET status = 'onboarding', -- Move to onboarding (sorting/profile setup next)
      updated_at = NOW()
  WHERE id = v_sub.user_id;

  -- 5. Handle Referrals
  -- Check if this user was invited
  SELECT * INTO v_invite FROM invites WHERE used_by = v_sub.user_id LIMIT 1;
  
  IF v_invite.id IS NOT NULL AND v_invite.bonus_earned = false THEN
    -- Get inviter's house
    SELECT house INTO v_inviter_house FROM users WHERE id = v_invite.inviter_id;
    
    IF v_inviter_house IS NOT NULL THEN
      -- Award 50 points to the inviter
      PERFORM award_points(
        v_invite.inviter_id,
        v_inviter_house,
        50,
        'invite_converted',
        'invite:' || v_invite.id
      );

      -- Notify inviter
      PERFORM create_notification(
        v_invite.inviter_id,
        'invite_converted',
        'Invite Converted',
        COALESCE(v_sub.full_name, 'Someone') || ' joined Connexa. Your invite came through.',
        '/house/invites'
      );
      
      -- Mark invite bonus as earned
      UPDATE invites SET bonus_earned = true, bonus_earned_at = NOW() WHERE id = v_invite.id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'user_id', v_sub.user_id);
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.approve_verification(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_verification(uuid) TO authenticated;
