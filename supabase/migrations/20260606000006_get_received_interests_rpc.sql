-- RPC to get incoming interest requests (received interests)
CREATE OR REPLACE FUNCTION public.get_received_interests()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN COALESCE((
    SELECT jsonb_agg(i_data)
    FROM (
      SELECT 
        i.id,
        i.from_user,
        i.created_at,
        i.state,
        u.display_name,
        u.photo_url,
        u.iit,
        u.branch,
        u.house
      FROM interests i
      JOIN users u ON u.id = i.from_user
      WHERE i.to_user = auth.uid() 
        AND i.state = 'pending'
      ORDER BY i.created_at DESC
    ) i_data
  ), '[]'::jsonb);
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.get_received_interests() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_received_interests() TO authenticated;
