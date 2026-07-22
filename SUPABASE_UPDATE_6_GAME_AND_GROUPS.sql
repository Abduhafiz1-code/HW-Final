-- ============================================================================
-- Game natijalari va o'qituvchi guruhlari
-- Supabase Dashboard -> SQL Editor ichida BIR MARTA to'liq ishga tushiring.
-- Bu fayl avvalgi SUPABASE_NEW_TABLES.sql ishlatilmagan loyiha uchun ham
-- kerakli game/group jadvallarini yaratadi, mavjud jadvalni o'chirmaydi.
-- ============================================================================

-- 1) So'z o'yini natijalari ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pairs INTEGER NOT NULL DEFAULT 0 CHECK (pairs >= 0),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS game_results_user_created_idx
  ON public.game_results (user_id, created_at DESC);

ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_results_policy" ON public.game_results;
DROP POLICY IF EXISTS "game_results_select_own" ON public.game_results;
DROP POLICY IF EXISTS "game_results_insert_own" ON public.game_results;
DROP POLICY IF EXISTS "game_results_update_own" ON public.game_results;
DROP POLICY IF EXISTS "game_results_delete_own" ON public.game_results;

CREATE POLICY "game_results_select_own" ON public.game_results
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
CREATE POLICY "game_results_insert_own" ON public.game_results
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "game_results_update_own" ON public.game_results
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "game_results_delete_own" ON public.game_results
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- 2) O'qituvchi guruhlari -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  code TEXT NOT NULL UNIQUE CHECK (code = upper(code) AND char_length(code) BETWEEN 4 AND 12),
  telegram_status TEXT NOT NULL DEFAULT 'unlinked',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_members_user_group_idx
  ON public.group_members (user_id, group_id);
CREATE INDEX IF NOT EXISTS group_members_group_user_idx
  ON public.group_members (group_id, user_id);

CREATE TABLE IF NOT EXISTS public.test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (test_id, group_id)
);

CREATE INDEX IF NOT EXISTS test_assignments_group_idx
  ON public.test_assignments (group_id, assigned_at DESC);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;

-- A group is visible only to its teacher and its own members.  Joining by
-- code is handled by the controlled RPC below, so random group UUIDs cannot
-- be used to join a group directly from the browser console.
DROP POLICY IF EXISTS "groups_teacher_or_member_read" ON public.groups;
DROP POLICY IF EXISTS "groups_teacher_insert" ON public.groups;
DROP POLICY IF EXISTS "groups_teacher_update" ON public.groups;
DROP POLICY IF EXISTS "groups_teacher_delete" ON public.groups;
CREATE POLICY "groups_teacher_or_member_read" ON public.groups
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = teacher_id
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = (select auth.uid())
    )
  );
CREATE POLICY "groups_teacher_insert" ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = teacher_id);
CREATE POLICY "groups_teacher_update" ON public.groups
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = teacher_id)
  WITH CHECK ((select auth.uid()) = teacher_id);
CREATE POLICY "groups_teacher_delete" ON public.groups
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = teacher_id);

-- A student may see/leave only their own membership; the teacher can view it.
DROP POLICY IF EXISTS "group_members_own_or_teacher_read" ON public.group_members;
DROP POLICY IF EXISTS "group_members_student_leave" ON public.group_members;
CREATE POLICY "group_members_own_or_teacher_read" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id AND g.teacher_id = (select auth.uid())
    )
  );
CREATE POLICY "group_members_student_leave" ON public.group_members
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Assignments are visible to the owning teacher and students in that group.
DROP POLICY IF EXISTS "test_assignments_teacher_or_member_read" ON public.test_assignments;
DROP POLICY IF EXISTS "test_assignments_teacher_manage" ON public.test_assignments;
CREATE POLICY "test_assignments_teacher_or_member_read" ON public.test_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = test_assignments.group_id
        AND (
          g.teacher_id = (select auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = g.id AND gm.user_id = (select auth.uid())
          )
        )
    )
  );
CREATE POLICY "test_assignments_teacher_manage" ON public.test_assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = test_assignments.group_id AND g.teacher_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = test_assignments.group_id AND g.teacher_id = (select auth.uid())
    )
  );

-- The client calls this function after the student enters a group code.
-- It never accepts a user_id from the browser: the authenticated user is
-- always used, and duplicate membership is harmless.
CREATE OR REPLACE FUNCTION public.join_group_by_code(join_code TEXT)
RETURNS TABLE(id UUID, name TEXT, code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_group public.groups%ROWTYPE;
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO target_group
  FROM public.groups
  WHERE groups.code = upper(trim(join_code));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'GROUP_NOT_FOUND';
  END IF;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES (target_group.id, (select auth.uid()))
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN QUERY SELECT target_group.id, target_group.name, target_group.code;
END;
$$;

REVOKE ALL ON FUNCTION public.join_group_by_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(TEXT) TO authenticated;

-- NOTE ABOUT TEAM BATTLE VOTES ----------------------------------------------
-- Game.vue's online Team Battle uses Supabase Realtime Broadcast, not a DB
-- table. Therefore no "battle_votes" table is required for its current code.
-- Each player can vote once; the host resolves after all active-team members
-- vote or after 30 seconds. Enable Realtime in Dashboard -> Database ->
-- Replication / Realtime if your project has disabled it.
