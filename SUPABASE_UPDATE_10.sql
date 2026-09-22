-- ============================================================
-- SUPABASE_UPDATE_10.sql — Leaderboard davrlari (haftalik/oylik/umumiy)
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
--
-- Nima qiladi:
--   1) get_leaderboard_period(period, limit) RPC:
--        'week'  → oxirgi 7 kun ichida testlaridan to'plangan ballar
--        'month' → oxirgi 30 kun
--        'all'   → umumiy tanga reytingi (eski get_leaderboard bilan bir xil)
--   2) test_results.created_at uchun index (davr filtri tez ishlashi uchun)
--
-- Haftalik reyting yangi foydalanuvchilarga ham topga chiqish imkonini
-- beradi — abadiy reytingda ular hech qachon yetib ololmasdi.
-- Safe to re-run.
-- ============================================================

CREATE INDEX IF NOT EXISTS test_results_created_at_idx
  ON public.test_results (created_at DESC);

CREATE OR REPLACE FUNCTION public.get_leaderboard_period(
  period TEXT DEFAULT 'all',
  limit_count INT DEFAULT 50
)
RETURNS TABLE(
  user_id UUID, full_name TEXT, avatar_url TEXT, avatar_frame TEXT,
  coins INT, diamonds INT, period_points BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    c.user_id,
    p.full_name,
    p.avatar_url,
    COALESCE(p.avatar_frame, 'none'),
    c.coins,
    COALESCE(c.diamonds, 0),
    COALESCE(pts.points, 0) AS period_points
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
