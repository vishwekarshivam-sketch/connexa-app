CREATE TABLE IF NOT EXISTS public.house_lore (
  id            uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  house         public.house_enum,
  week_number   int               NOT NULL,
  text          text              NOT NULL,
  attribution   text,
  created_at    timestamptz       NOT NULL DEFAULT NOW(),
  UNIQUE (house, week_number)
);

ALTER TABLE public.house_lore ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read house lore
CREATE POLICY "house_lore_read" ON public.house_lore
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify house lore
CREATE POLICY "house_lore_admin_all" ON public.house_lore
  FOR ALL TO authenticated USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid())
  );
