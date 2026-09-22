-- ============================================================
-- SUPABASE_UPDATE_13.sql — AI test + ustoz testi YAGONA statistika
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
-- Safe to re-run.
--
-- Muammo: AI bergan test (SoloQuiz) practice_results'ga YOZILAR,
-- lekin profil/tarix/leaderboard faqat test_results'ni sanaydi —
-- shuning uchun user "0 test, 0%" ko'rdi.
--
-- Nima qiladi:
--   1) practice_results.mode maydoni: 'solo' (AI test), 'practice' (mashq)
--   2) get_user_stats(target_user_id): BARCHA testlar (AI + ustoz) statistikasi
--      + modellar (aylana ramkada ko'rsatiladigan do'kondagi ramkalar)
--      + fanlar bo'yicha breakdown + oxirgi 10 natija
--   3) get_leaderboard_period yangilandi: period_points endi
--      test_results.score + practice_results.correct yig'indisi,
--      qatorida total_tests va avg_percent ham qaytadi
-- ============================================================

-- 1. practice_results ga mode maydoni --------------------------------------
ALTER TABLE public.practice_results
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'practice';

-- 2. Yagona foydalanuvchi statistikasi (AI test + ustoz testi) --------------
DROP FUNCTION IF EXISTS public.get_user_stats(UUID);
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id UUID)
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH quiz AS (
    -- Ustoz bergan testlar
    SELECT
      tr.id,
      tr.user_id,
      tr.percent,
      tr.score,
      tr.total,
      tr.created_at,
      'teacher' AS mode,
      COALESCE(t.subject, 'Test') AS subject,
      COALESCE(t.title, 'Test') AS title,
      NULL::TEXT AS level
    FROM test_results tr
    LEFT JOIN tests t ON t.id = tr.test_id
    WHERE tr.user_id = target_user_id

    UNION ALL

    -- AI bergan testlar (solo quiz) — faqat mode='solo' yozuvlar
    SELECT
      pr.id,
      pr.user_id,
      pr.percent,
      pr.correct AS score,
      pr.question_count AS total,
      pr.created_at,
      'solo' AS mode,
      SPLIT_PART(pr.topic, ' — ', 1) AS subject,
      pr.topic AS title,
      NULLIF(SPLIT_PART(pr.topic, ' — ', 2), '') AS level
    FROM practice_results pr
    WHERE pr.user_id = target_user_id
      AND pr.mode = 'solo'
  )
  SELECT json_build_object(
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'avatar_frame', COALESCE(p.avatar_frame, 'none'),
    'owned_frames', CASE WHEN COALESCE(p.show_frames, true)
      THEN to_jsonb(COALESCE(p.owned_frames, ARRAY[]::TEXT[]))
      ELSE '[]'::jsonb END,
    'coins', COALESCE(c.coins, 0),
    'diamonds', COALESCE(c.diamonds, 0),
    'progress', COALESCE(c.progress, 0),
    'total_tests', (SELECT COUNT(*) FROM quiz),
    'best_percent', COALESCE((SELECT MAX(percent) FROM quiz), 0),
    'avg_percent', COALESCE((SELECT ROUND(AVG(percent)) FROM quiz), 0),
    'by_mode', (SELECT json_object_agg(m, cnt) FROM (
        SELECT mode AS m, COUNT(*) AS cnt FROM quiz GROUP BY mode
      ) mm),
    'subjects', COALESCE((SELECT json_agg(s) FROM (
        SELECT subject,
               COUNT(*) AS count,
               ROUND(AVG(percent))::INT AS avg_percent,
               MAX(percent) AS best_percent
        FROM quiz GROUP BY subject ORDER BY COUNT(*) DESC LIMIT 6
      ) s), '[]'::json),
    'recent', COALESCE((SELECT json_agg(r) FROM (
        SELECT mode, subject, title, level, percent, score, total, created_at
        FROM quiz ORDER BY created_at DESC LIMIT 10
      ) r), '[]'::json)
  )
  FROM profiles p
  LEFT JOIN coins c ON c.user_id = p.id
  WHERE p.id = target_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO authenticated;

-- 3. Leaderboard — AI test + ustoz testi ballari JAMI, test soni, o'rtacha %
DROP FUNCTION IF EXISTS public.get_leaderboard_period(TEXT, INT);
CREATE OR REPLACE FUNCTION public.get_leaderboard_period(
  period TEXT DEFAULT 'all',
  limit_count INT DEFAULT 50
)
RETURNS TABLE(
  user_id UUID, full_name TEXT, avatar_url TEXT, avatar_frame TEXT,
  coins INT, diamonds INT, period_points BIGINT,
  total_tests BIGINT, avg_percent INT, show_frames BOOLEAN
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
    COALESCE(st.total, 0) AS total_tests,
    COALESCE(st.avg, 0) AS avg_percent,
    COALESCE(p.show_frames, true) AS show_frames
  FROM coins c
  JOIN profiles p ON p.id = c.user_id
  LEFT JOIN (
    SELECT q.user_id, SUM(q.score) AS points, COUNT(*) AS total, ROUND(AVG(q.percent))::INT AS avg
    FROM (
      SELECT tr.user_id, tr.score, tr.percent, tr.created_at
      FROM test_results tr
      UNION ALL
      SELECT pr.user_id, pr.correct AS score, pr.percent, pr.created_at
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
  ORDER BY
    COALESCE(pts.points, 0) DESC,
    c.coins DESC
  LIMIT limit_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard_period(TEXT, INT) TO authenticated;
