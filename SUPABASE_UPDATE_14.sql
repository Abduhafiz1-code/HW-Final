-- ============================================================
-- SUPABASE_UPDATE_14.sql — Leaderboard: foydalanuvchining O'Z o'rni
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
-- Safe to re-run.
--
-- Nima qiladi:
--   get_user_rank(period) RPC — joriy foydalanuvchining reytingdagi
--   o'rnini qaytaradi (top-50 dan tashqarida bo'lsa ham!):
--     { rank, total_users, coins, diamonds, period_points,
--       total_tests, avg_percent, full_name, avatar_url, ... }
--   RANK() — bir xil ball bo'lsa bir xil o'rin beradi.
--   get_leaderboard_period bilan bir xil ball formula (UPDATE_13).
-- ============================================================

DROP FUNCTION IF EXISTS public.get_user_rank(TEXT);

CREATE OR REPLACE FUNCTION public.get_user_rank(
  period TEXT DEFAULT 'all'
)
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH all_rows AS (
    SELECT
      c.user_id,
      p.full_name,
      p.avatar_url,
      COALESCE(p.avatar_frame, 'none') AS avatar_frame,
      c.coins,
      COALESCE(c.diamonds, 0) AS diamonds,
      COALESCE(pts.points, 0) AS period_points,
      COALESCE(st.total, 0) AS total_tests,
      COALESCE(st.avg, 0) AS avg_percent,
      COALESCE(p.show_frames, true) AS show_frames,
      COUNT(*) OVER () AS total_users,
      RANK() OVER (
        ORDER BY COALESCE(pts.points, 0) DESC, c.coins DESC
      ) AS rank
    FROM coins c
    JOIN profiles p ON p.id = c.user_id
    LEFT JOIN (
      SELECT q.user_id, SUM(q.score) AS points
      FROM (
        SELECT tr.user_id, tr.score, tr.created_at
        FROM test_results tr
        UNION ALL
        SELECT pr.user_id, pr.correct AS score, pr.created_at
        FROM practice_results pr
        WHERE pr.mode = 'solo'
      ) q
      WHERE q.created_at >= now() - (
        CASE period
          WHEN 'week' THEN INTERVAL '7 days'
          WHEN 'month' THEN INTERVAL '30 days'
          ELSE INTERVAL '100 years'
        END
      )
      GROUP BY q.user_id
    ) pts ON pts.user_id = c.user_id
    LEFT JOIN (
      SELECT q2.user_id, COUNT(*) AS total, ROUND(AVG(q2.percent))::INT AS avg
      FROM (
        SELECT user_id, percent FROM test_results
        UNION ALL
        SELECT user_id, percent FROM practice_results WHERE mode = 'solo'
      ) q2
      GROUP BY q2.user_id
    ) st ON st.user_id = c.user_id
  )
  SELECT to_jsonb(r)
  FROM all_rows r
  WHERE r.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_user_rank(TEXT) TO authenticated;
