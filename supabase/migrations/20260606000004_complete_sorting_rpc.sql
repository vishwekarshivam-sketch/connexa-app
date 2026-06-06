-- RPC to complete sorting quiz, assign house and award points
CREATE OR REPLACE FUNCTION public.complete_sorting(
  p_house house_enum,
  p_responses jsonb,
  p_score_breakdown jsonb
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_member_number int;
  v_user users%ROWTYPE;
BEGIN
  -- 1. Check if already sorted
  IF EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND house IS NOT NULL) THEN
    RAISE EXCEPTION 'User is already sorted';
  END IF;

  -- 2. Assign next member number for this house
  SELECT COALESCE(MAX(house_member_number), 0) + 1 INTO v_member_number
  FROM users
  WHERE house = p_house;

  -- 3. Update user
  UPDATE users
  SET house = p_house,
      house_member_number = v_member_number,
      status = 'active', -- Move from onboarding to active after sorting
      updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING * INTO v_user;

  -- 4. Save quiz responses
  INSERT INTO sorting_quiz_responses (user_id, responses, score_breakdown, assigned_house)
  VALUES (auth.uid(), p_responses, p_score_breakdown, p_house);

  -- 5. Award points (100 pts for sorting)
  PERFORM award_points(
    auth.uid(), 
    p_house, 
    100, 
    'sorting_complete', 
    'sorting:' || auth.uid()
  );

  RETURN to_jsonb(v_user);
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.complete_sorting(house_enum, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_sorting(house_enum, jsonb, jsonb) TO authenticated;
