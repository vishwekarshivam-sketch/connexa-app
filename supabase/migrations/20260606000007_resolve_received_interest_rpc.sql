-- RPC to accept or pass a received interest
CREATE OR REPLACE FUNCTION public.resolve_received_interest(
  p_interest_id uuid,
  p_action text -- 'accept' | 'pass'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_interest interests%ROWTYPE;
BEGIN
  -- 1. Load interest
  SELECT * INTO v_interest FROM interests WHERE id = p_interest_id AND to_user = auth.uid();
  IF v_interest.id IS NULL THEN RAISE EXCEPTION 'Interest not found'; END IF;
  IF v_interest.state <> 'pending' THEN RAISE EXCEPTION 'Interest is already resolved'; END IF;

  IF p_action = 'accept' THEN
    -- Calling express_interest on the sender will trigger the mutual match logic
    RETURN express_interest(v_interest.from_user);
  ELSIF p_action = 'pass' THEN
    UPDATE interests 
    SET state = 'withdrawn', -- Or a new 'passed' state if we want to be specific
        resolved_at = NOW() 
    WHERE id = p_interest_id;
    RETURN jsonb_build_object('success', true, 'state', 'passed');
  ELSE
    RAISE EXCEPTION 'Invalid action';
  END IF;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.resolve_received_interest(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_received_interest(uuid, text) TO authenticated;
