-- ============================================================
-- SUPABASE_UPDATE_7.sql — Yangi eventlar + ustun qo'shimchalari
-- ISHGA TUSHIRISH: Supabase SQL Editor'da bir marta ishga tushiring.
--
-- Nima qiladi:
--   1) Eski eventlarni (vocab_b1, subject_b2, eski 'quiz'/'game'/'practice'
--      namunalarini) o'chiradi / faolsizlantiradi
--   2) 3 ta YANGI event qo'shadi:
--        - math_sprint  → Tezkor Matematika Sprinti (90 soniya)
--        - idiom_quiz   → Ingliz Idiomalar Boyligi
--        - marathon     → Fanlar Marafoni (3 bosqich)
--   3) event_participants jadvaliga score_percent ustunini qo'shadi
--      (ilova buni allaqachon kutadi — mavjud bo'lmasa xato beradi)
-- ============================================================

-- 1) Eski eventlarni faolsizlantirish (ma'lumot yo'qolmaydi, faqat is_active=false)
UPDATE events SET is_active = FALSE WHERE type IN ('vocab_b1', 'subject_b2', 'quiz', 'game', 'practice');

-- 2) score_percent ustuni (SUPABASE_UPDATE_2 da yo'q edi)
ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS score_percent INT;

-- 3) Yangi eventlar (ends_at = 30 kun, keyin o'zingiz yangilaysiz)
INSERT INTO events (title, description, type, diamond_reward, starts_at, ends_at, is_active)
SELECT * FROM (VALUES
  ('Tezkor Matematika Sprinti', '90 soniyada imkon qadar ko''p matematik savolga to''g''ri javob bering! Tezlik va aniqlik sinovi.', 'math_sprint', 20, NOW(), NOW() + INTERVAL '30 days', TRUE),
  ('Ingliz Idiomalar Boyligi', '15 ta inglizcha idiomani o''rganing va ma''nosini toping. Natijangiz 40%+ bo''lsa mukofot olasiz.', 'idiom_quiz', 20, NOW(), NOW() + INTERVAL '30 days', TRUE),
  ('Fanlar Marafoni', '24 savol, 3 bosqich: oson, o''rta va qiyin. Fanlar aralash — matematika, tarix, biologiya va boshqalar.', 'marathon', 20, NOW(), NOW() + INTERVAL '30 days', TRUE)
) AS v(title, description, type, diamond_reward, starts_at, ends_at, is_active)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE type IN ('math_sprint', 'idiom_quiz', 'marathon') AND is_active = TRUE);
