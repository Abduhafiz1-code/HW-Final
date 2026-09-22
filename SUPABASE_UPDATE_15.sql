-- ============================================================
-- SUPABASE_UPDATE_15.sql — Hisob Blitz (global musobaqa o'yini)
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
-- Safe to re-run.
--
-- Nima qiladi:
--   1) blitz_scores  → har user'ning eng yaxshi natijasi (UPsert modeli)
--   2) blitz_scores_top → global TOP-20 view (profil ism/avatar/ramka bilan)
-- ============================================================

-- 1) Jadval ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blitz_scores (
  user_id    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blitz_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blitz_scores_select_all"  ON public.blitz_scores;
DROP POLICY IF EXISTS "blitz_scores_insert_own"  ON public.blitz_scores;
DROP POLICY IF EXISTS "blitz_scores_update_own"  ON public.blitz_scores;
DROP POLICY IF EXISTS "blitz_scores_delete_own"  ON public.blitz_scores;

-- Reyting ochiq: tizimga kirgan hamma TOP-20'ni ko'radi
CREATE POLICY "blitz_scores_select_all" ON public.blitz_scores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "blitz_scores_insert_own" ON public.blitz_scores
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "blitz_scores_update_own" ON public.blitz_scores
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "blitz_scores_delete_own" ON public.blitz_scores
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- 2) Global TOP view ------------------------------------------
CREATE OR REPLACE VIEW public.blitz_scores_top AS
SELECT
  b.user_id,
  b.score,
  b.updated_at,
  p.full_name   AS name,
  p.avatar_url  AS avatar_url,
  p.avatar_frame AS avatar_frame
FROM public.blitz_scores b
JOIN public.profiles p ON p.id = b.user_id
ORDER BY b.score DESC, b.updated_at ASC;

-- View ochiq o'qiladigan bo'lsin (authenticated uchun)
GRANT SELECT ON public.blitz_scores_top TO authenticated;
