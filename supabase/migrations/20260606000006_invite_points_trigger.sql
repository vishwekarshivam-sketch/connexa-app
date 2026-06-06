-- Trigger to award points when an invite is used.
CREATE OR REPLACE FUNCTION public.handle_invite_conversion_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_inviter_house house_enum;
BEGIN
  -- Only fire when used_by is set (invite converted)
  IF (OLD.used_by IS NULL AND NEW.used_by IS NOT NULL) THEN
    SELECT house INTO v_inviter_house FROM users WHERE id = NEW.inviter_id;
    
    IF v_inviter_house IS NOT NULL THEN
      PERFORM award_points(
        NEW.inviter_id,
        v_inviter_house,
        20,
        'invite_conversion',
        'invite_conv:' || NEW.used_by
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_invite_used ON public.invites;
CREATE TRIGGER on_invite_used
  AFTER UPDATE ON public.invites
  FOR EACH ROW EXECUTE FUNCTION public.handle_invite_conversion_points();
