-- Trigger to award points when a date profile is completed.
CREATE OR REPLACE FUNCTION public.handle_date_profile_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_house house_enum;
BEGIN
  -- Only fire when status moves to 'active'
  IF ((TG_OP = 'INSERT' AND NEW.status = 'active') OR (TG_OP = 'UPDATE' AND OLD.status <> 'active' AND NEW.status = 'active')) THEN
    SELECT house INTO v_house FROM users WHERE id = NEW.user_id;
    
    IF v_house IS NOT NULL THEN
      PERFORM award_points(
        NEW.user_id,
        v_house,
        15,
        'date_profile_complete',
        'date_profile:' || NEW.user_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_date_profile_active ON public.date_profiles;
CREATE TRIGGER on_date_profile_active
  AFTER INSERT OR UPDATE ON public.date_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_date_profile_points();
