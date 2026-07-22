-- ============================================================
-- SUPABASE_UPDATE_5.sql
-- Run this once in the Supabase SQL Editor (after SUPABASE_UPDATE_4.sql).
-- Removes the 3 generic placeholder events from SUPABASE_UPDATE_2.sql and
-- replaces them with two real, playable events:
--   1) "So'z yodlash — B1"  — 30 ta so'z tarjimasini topish (/events/vocab)
--   2) "Fanlar testi — B2"  — Matematika/Ingliz tili/Dasturlash/Tarix
--      testlaridan birini yechish (/events/subjects)
-- Ikkalasi ham bir xil mukofot jadvalidan foydalanadi (natija foiziga
-- qarab): 40-59% -> 5 olmos + 20 tanga, 60-79% -> 10 olmos + 30 tanga,
-- 80-100% -> 20 olmos + 50 tanga (src/lib/eventTiers.ts).
-- Safe to re-run.
-- ============================================================

-- 1. Eski namunaviy (placeholder) event'larni o'chirish -----------------
DELETE FROM events WHERE title IN (
  'Haftalik Quiz marafoni',
  'So''z o''yini chempioni',
  'Kunlik mashq seriyasi'
);

-- 2. Natija foizini saqlash uchun ustun ----------------------------------
ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS score_percent INT;

-- 3. Event tugagach fikr bildirish (masalan "Fanlar testi" uchun) -------
CREATE TABLE IF NOT EXISTS event_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_feedback_insert_own" ON event_feedback;
DROP POLICY IF EXISTS "event_feedback_update_own" ON event_feedback;
DROP POLICY IF EXISTS "event_feedback_select_own" ON event_feedback;
CREATE POLICY "event_feedback_insert_own" ON event_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_feedback_update_own" ON event_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "event_feedback_select_own" ON event_feedback FOR SELECT USING (auth.uid() = user_id);

-- 4. Ikkita yangi event ---------------------------------------------------
INSERT INTO events (title, description, type, diamond_reward, starts_at, ends_at, is_active)
SELECT * FROM (VALUES
  (
    'So''z yodlash — B1',
    'B1 darajadagi 30 ta inglizcha so''zning tarjimasini toping va xotirangizni sinab ko''ring.',
    'vocab_b1',
    20,
    NOW(),
    NULL::timestamptz,
    TRUE
  ),
  (
    'Fanlar testi — B2',
    'Matematika, Ingliz tili, Dasturlash yoki Tarix bo''yicha B2 darajadagi testlardan birini tanlab yeching.',
    'subject_b2',
    20,
    NOW(),
    NULL::timestamptz,
    TRUE
  )
) AS v(title, description, type, diamond_reward, starts_at, ends_at, is_active)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE events.type IN ('vocab_b1', 'subject_b2'));
