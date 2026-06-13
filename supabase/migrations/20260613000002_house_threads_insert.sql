-- Add INSERT policy for house_threads so users can create new threads

CREATE POLICY "threads_insert_house_members" ON public.house_threads
  FOR INSERT TO authenticated WITH CHECK (
    house = (SELECT house FROM public.users WHERE id = auth.uid())
  );
