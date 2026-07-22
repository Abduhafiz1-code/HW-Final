-- ============================================================
-- SUPABASE_UPDATE_2.sql
-- Run this whole file once in the Supabase SQL Editor.
-- Adds: diamonds currency, profile avatar frames, a fixed public
-- leaderboard + public profile-stats RPC (the old "coins" RLS only
-- ever let a user see their OWN row, so the leaderboard could never
-- really show anyone else), an avatars storage bucket, and a simple
-- Events system that awards diamonds.
-- Safe to re-run: everything uses IF NOT EXISTS / OR REPLACE.
-- ============================================================

-- 1. New columns -------------------------------------------------
ALTER TABLE coins ADD COLUMN IF NOT EXISTS diamonds INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_frame TEXT DEFAULT 'none';

-- 2. Fix coins RLS -------------------------------------------------
-- Before: a single "FOR ALL USING (auth.uid() = user_id)" policy meant
-- NOBODY could ever read another user's coin total — so the leaderboard
-- (which orders by coins across every user) silently only ever returned
-- rows the current viewer happened to already own. Split read (public,
-- needed for the leaderboard) from write (still owner-only).
DROP POLICY IF EXISTS "coins_policy" ON coins;
CREATE POLICY "coins_select_public" ON coins FOR SELECT USING (true);
CREATE POLICY "coins_insert_own" ON coins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coins_update_own" ON coins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "coins_delete_own" ON coins FOR DELETE USING (auth.uid() = user_id);

-- 3. Leaderboard RPC ------------------------------------------------
-- One joined, server-side query instead of the old client-side
-- 1-request-per-user N+1 loop.
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INT DEFAULT 20)
RETURNS TABLE(user_id UUID, full_name TEXT, avatar_url TEXT, avatar_frame TEXT, coins INT, diamonds INT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT c.user_id, p.full_name, p.avatar_url, COALESCE(p.avatar_frame, 'none'), c.coins, COALESCE(c.diamonds, 0)
  FROM coins c
  JOIN profiles p ON p.id = c.user_id
  ORDER BY c.coins DESC
  LIMIT limit_count;
$$;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT) TO authenticated;

-- 4. Public profile stats RPC -----------------------------------------
-- Only aggregate numbers (no test titles/dates/answers) are exposed
-- when one user taps another user's row on the leaderboard.
CREATE OR REPLACE FUNCTION public.get_public_profile_stats(target_user_id UUID)
RETURNS TABLE(
  full_name TEXT, avatar_url TEXT, avatar_frame TEXT,
  coins INT, diamonds INT, progress INT,
  total_tests BIGINT, best_percent INT, avg_percent INT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.full_name, p.avatar_url, COALESCE(p.avatar_frame, 'none'),
    COALESCE(c.coins, 0), COALESCE(c.diamonds, 0), COALESCE(c.progress, 0),
    COUNT(tr.id),
    COALESCE(MAX(tr.percent), 0),
    COALESCE(ROUND(AVG(tr.percent)), 0)::INT
  FROM profiles p
  LEFT JOIN coins c ON c.user_id = p.id
  LEFT JOIN test_results tr ON tr.user_id = p.id
  WHERE p.id = target_user_id
  GROUP BY p.full_name, p.avatar_url, p.avatar_frame, c.coins, c.diamonds, c.progress;
$$;
GRANT EXECUTE ON FUNCTION public.get_public_profile_stats(UUID) TO authenticated;

-- 5. Avatars storage bucket -------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_owner_write" ON storage.objects;
CREATE POLICY "avatars_owner_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Upload path convention used by the app: `avatars/{user_id}/avatar.<ext>`

-- 6. Events system (diamonds come from here, not everyday play) -------
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'quiz', -- 'quiz' | 'game' | 'practice' | 'custom'
  diamond_reward INT DEFAULT 20,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_readable" ON events;
CREATE POLICY "events_readable" ON events FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_participants_own" ON event_participants;
CREATE POLICY "event_participants_own" ON event_participants FOR ALL USING (auth.uid() = user_id);

-- Sample events so the new "Events" page isn't empty on first run.
-- Feel free to edit/delete these from the Supabase table editor.
INSERT INTO events (title, description, type, diamond_reward, ends_at)
SELECT * FROM (VALUES
  ('Haftalik Quiz marafoni', 'Shu hafta ichida kamida 3 ta Yolg''iz Quiz''ni 70%+ natija bilan yakunlang', 'quiz', 20, NOW() + INTERVAL '7 days'),
  ('So''z o''yini chempioni', 'So''z o''yinini 60 soniyadan tez vaqtda yakunlang', 'game', 20, NOW() + INTERVAL '7 days'),
  ('Kunlik mashq seriyasi', 'Bugun kamida 1 ta Mashq blokini yakunlang', 'practice', 20, NOW() + INTERVAL '1 day')
) AS v(title, description, type, diamond_reward, ends_at)
WHERE NOT EXISTS (SELECT 1 FROM events);
