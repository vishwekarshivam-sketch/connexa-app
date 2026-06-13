-- Fix RLS policy for intro_comments to allow non-freshers (admins/mentors) to comment.
-- The original policy was restricted to 'fresher' user_type only.

-- Using public schema explicitly and wrapping auth.uid() for performance/reliability
DROP POLICY IF EXISTS "intro_comments_write" ON public.intro_comments;

CREATE POLICY "intro_comments_write" ON public.intro_comments
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = (SELECT auth.uid()) 
      AND (users.user_type = 'fresher' OR users.is_admin = true)
    )
  );

-- Also allow deletion by the owner or an admin
DROP POLICY IF EXISTS "intro_comments_delete_own_or_admin" ON public.intro_comments;
CREATE POLICY "intro_comments_delete_own_or_admin" ON public.intro_comments
  FOR DELETE TO authenticated USING (
    user_id = (SELECT auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = (SELECT auth.uid()) AND users.is_admin = true
    )
  );

-- Ensure authenticated users can read all non-deleted comments
DROP POLICY IF EXISTS "intro_comments_read" ON public.intro_comments;
CREATE POLICY "intro_comments_read" ON public.intro_comments
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
