-- ============================================================
-- SUPABASE_UPDATE_11.sql —yangi funksiyalar: ramka privacy, tanga,
-- bildirishnomalar, olmos buyurtmalari
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
-- Safe to re-run.
-- ============================================================

-- 1. Ramka to'plamini boshqalarga ko'rsatish/korsatmaslik (privace) ------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_frames BOOLEAN DEFAULT true;

-- 2. Olmos do'koni: foydalanuvchi olmosni pulga sotib oladi (buyurtma) ---
CREATE TABLE IF NOT EXISTS public.diamond_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  diamonds INT NOT NULL CHECK (diamonds > 0),
  price_uzs INT NOT NULL CHECK (price_uzs > 0),
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'payme',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diamond_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diamond_orders_own" ON public.diamond_orders;
CREATE POLICY "diamond_orders_own" ON public.diamond_orders
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- 3. Leaderboard umumiy RPC — ommaviy ballar bilan
-- Eski versiya boshqacha qaytish turiga ega edi — avval o'chirib, keyin yaratamiz
DROP FUNCTION IF EXISTS public.get_leaderboard_period(TEXT, INT);
CREATE OR REPLACE FUNCTION public.get_leaderboard_period(
  period TEXT DEFAULT 'all',
  limit_count INT DEFAULT 50
)
RETURNS TABLE(
  user_id UUID, full_name TEXT, avatar_url TEXT, avatar_frame TEXT,
  coins INT, diamonds INT, period_points BIGINT, show_frames BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    c.user_id,
    p.full_name,
    p.avatar_url,
    COALESCE(p.avatar_frame, 'none'),
    c.coins,
    COALESCE(c.diamonds, 0),
    COALESCE(pts.points, 0) AS period_points,
    COALESCE(p.show_frames, true) AS show_frames
  FROM coins c
  JOIN profiles p ON p.id = c.user_id
  LEFT JOIN (
    SELECT tr.user_id, SUM(tr.score) AS points
    FROM test_results tr
    WHERE tr.created_at >= now() - (
      CASE period
        WHEN 'week' THEN INTERVAL '7 days'
        WHEN 'month' THEN INTERVAL '30 days'
        ELSE INTERVAL '100 years'
      END
    )
    GROUP BY tr.user_id
  ) pts ON pts.user_id = c.user_id
  ORDER BY
    COALESCE(pts.points, 0) DESC,
    c.coins DESC
  LIMIT limit_count;
$$;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_period(TEXT, INT) TO authenticated;

-- 4. Public profile stats — ramka to'plami ham (agar ruxsat berilgan bo'lsa)
DROP FUNCTION IF EXISTS public.get_public_profile_stats(UUID);
CREATE OR REPLACE FUNCTION public.get_public_profile_stats(target_user_id UUID)
RETURNS TABLE(
  full_name TEXT, avatar_url TEXT, avatar_frame TEXT,
  coins INT, diamonds INT, progress INT,
  total_tests BIGINT, best_percent INT, avg_percent INT,
  frames TEXT[]
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.full_name, p.avatar_url, COALESCE(p.avatar_frame, 'none'),
    COALESCE(c.coins, 0), COALESCE(c.diamonds, 0), COALESCE(c.progress, 0),
    COUNT(tr.id),
    COALESCE(MAX(tr.percent), 0),
    COALESCE(ROUND(AVG(tr.percent)), 0)::INT,
    CASE WHEN COALESCE(p.show_frames, true)
      THEN p.owned_frames
      ELSE ARRAY[]::TEXT[]
    END
  FROM profiles p
  LEFT JOIN coins c ON c.user_id = p.id
  LEFT JOIN test_results tr ON tr.user_id = p.id
  WHERE p.id = target_user_id
  GROUP BY p.full_name, p.avatar_url, p.avatar_frame, c.coins, c.diamonds, c.progress, p.show_frames, p.owned_frames;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_profile_stats(UUID) TO authenticated;

-- 5. Ism bilan user qidirish (chat'da do'st topish) -----------------------
DROP FUNCTION IF EXISTS public.search_users_by_name(TEXT, INT);
CREATE OR REPLACE FUNCTION public.search_users_by_name(
  search_query TEXT,
  limit_count INT DEFAULT 10
)
RETURNS TABLE(
  id UUID, full_name TEXT, email TEXT, avatar_url TEXT, avatar_frame TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id,
    p.full_name,
    -- email faqat aniq mos bo'lsa ko'rsatamiz (privacy)
    CASE WHEN LOWER(p.email) = LOWER(search_query) THEN p.email ELSE NULL END AS email,
    p.avatar_url,
    COALESCE(p.avatar_frame, 'none')
  FROM profiles p
  WHERE
    -- o'zini o'zi topmasin (client tomonda ham tekshiramiz)
    p.id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      p.full_name ILIKE '%' || search_query || '%'
      OR LOWER(p.email) = LOWER(search_query)
    )
  ORDER BY
    CASE WHEN LOWER(p.full_name) = LOWER(search_query) THEN 0 ELSE 1 END,
    p.full_name
  LIMIT limit_count;
$$;
GRANT EXECUTE ON FUNCTION public.search_users_by_name(TEXT, INT) TO authenticated;
