-- ============================================================
-- SUPABASE_UPDATE_16_RESET.sql — GLOBAL RESET: hamma erishilgan narsalar 0
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
--
-- ⚠️  DIAGGAR QAYTARILMAS amal — lekin xavfsizlik uchun har bir jadvaldan
--     OLDIN backup jadval yaratiladi (pasted_data yo'qolmasligi uchun).
--     Backup faqat BIRINCHI ishga tushirishda to'ldiriladi — qayta
--     ishga tushirsangiz ham asl ma'lumot saqlanib qoladi.
--
-- Nima 0 ga tushadi:
--   1) coins      → coins, diamonds, progress, claimed_milestones,
--                   today_earned, streak_days = 0
--   2) profiles   → owned_frames = ['none'], avatar_frame = 'none',
--                   profile_bg_url = NULL
--                   (avatar_url — foydalanuvchining O'Z rasmi, tegilmaydi!)
--   3) streaks    → streak_count = 0, history = []
--   4) game_results → butunlay o'chiriladi (Blitz rekordlar)
--   5) event_participants → reward_claimed = false, score_percent = NULL
--                   (eventlar qaytadan o'ynash uchun ochiladi)
--
-- Nima TEGILMAYDI (ataylab):
--   ✅ profiles.avatar_url — shaxsiy profil rasmi
--   ✅ is_premium / premium_until — pullik obuna bekor qilinmaydi
--   ✅ test_results / test_answers — o'quv tarixi (History, o'qituvchi
--      natijalari). Agar leaderboard'ni ham 0 ga tushirish kerak bo'lsa,
--      fayl oxiridagi IXTIYORIY blokni ham ishga tushiring.
--   ✅ notifications — bildirishnomalar tarixi
--   ✅ premium_requests — to'lov arizalari tarixi
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- 0) BACKUP — faqat birinchi marta to'ldiriladi (IF NOT EXISTS)
--    Keyinchalik kerak bo'lsa: SELECT * FROM reset_backup_coins;
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reset_backup_coins AS
  SELECT * FROM coins;

CREATE TABLE IF NOT EXISTS reset_backup_profiles AS
  SELECT id, avatar_frame, owned_frames, profile_bg_url FROM profiles;

CREATE TABLE IF NOT EXISTS reset_backup_streaks AS
  SELECT * FROM streaks;

CREATE TABLE IF NOT EXISTS reset_backup_game_results AS
  SELECT * FROM game_results;

CREATE TABLE IF NOT EXISTS reset_backup_event_participants AS
  SELECT * FROM event_participants;

-- ────────────────────────────────────────────────────────────
-- 1) coins — tanga, olmos, progress, milestone'lar, streak
--    (ustunlardan ba'zilari keyingi UPDATE'larda qo'shilgan bo'lishi
--     mumkin — NOT EXISTS bilan himoyalangan)
-- ────────────────────────────────────────────────────────────
ALTER TABLE coins ADD COLUMN IF NOT EXISTS diamonds INT DEFAULT 0;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 1;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS last_seen TEXT;

UPDATE coins SET
  coins               = 0,
  diamonds            = 0,
  progress            = 0,
  claimed_milestones  = '[]'::jsonb,
  today_earned        = 0,
  streak_days         = 0;

-- ────────────────────────────────────────────────────────────
-- 2) profiles — ramkalar va profil foni
-- ────────────────────────────────────────────────────────────
UPDATE profiles SET
  owned_frames   = ARRAY['none'],
  avatar_frame   = 'none',
  profile_bg_url = NULL;

-- ────────────────────────────────────────────────────────────
-- 3) streaks — kunlik seriya
-- ────────────────────────────────────────────────────────────
UPDATE streaks SET
  streak_count = 0,
  history      = '[]'::jsonb,
  last_date    = NULL;

-- ────────────────────────────────────────────────────────────
-- 4) game_results — Blitz va boshqa o'yin rekordlari
-- ────────────────────────────────────────────────────────────
DELETE FROM game_results;

-- ────────────────────────────────────────────────────────────
-- 5) event_participants — event mukofotlari qayta olinadigan bo'ladi
-- ────────────────────────────────────────────────────────────
UPDATE event_participants SET
  reward_claimed = false,
  score_percent  = NULL;

COMMIT;

-- ────────────────────────────────────────────────────────────
-- 6) TEKSHIRUV — natijalar pastda chiqadi:
--    coins_rows   = nechta foydalanuvchi
--    max_coins    = eng katta tanga (0 bo'lishi KERAK)
--    max_diamonds = eng katta olmos (0 bo'lishi KERAK)
--    max_streak   = eng katta streak (0 bo'lishi KERAK)
--    game_results = 0 bo'lishi KERAK
--    frames_kept  = 'none' bo'lmagan ramka soni (0 bo'lishi KERAK)
-- ────────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM coins)                                   AS coins_rows,
  (SELECT COALESCE(MAX(coins), 0) FROM coins)                    AS max_coins,
  (SELECT COALESCE(MAX(diamonds), 0) FROM coins)                 AS max_diamonds,
  (SELECT COALESCE(MAX(streak_count), 0) FROM streaks)           AS max_streak,
  (SELECT COUNT(*) FROM game_results)                            AS game_results,
  (SELECT COUNT(*) FROM profiles
    WHERE avatar_frame <> 'none'
       OR profile_bg_url IS NOT NULL
       OR owned_frames <> ARRAY['none'])                         AS frames_kept;

-- ============================================================
-- 7) IXTIYORIY — TEST TARIXINI HAM O'CHIRISH (leaderboard 0 bo'ladi!)
-- ⚠️ BU BILAN History sahifasi, profil statistikasi va o'qituvchi
--    ko'radigan barcha test natijalari O'CHILADI. Ishonchingiz
--    komil bo'lsa, -- larni olib tashlab ishga tushiring:
--
-- BEGIN;
-- DELETE FROM test_answers;
-- DELETE FROM test_results;
-- COMMIT;
-- ============================================================
