-- ============================================================
-- SUPABASE_UPDATE_9.sql — Profil yangi imkoniyatlari
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
--
-- Nima qiladi:
--   1) profiles.profile_bg_url — profil orqa fon rasmi (user yuklaydi)
--   2) adaptiv AI quiz darajasi: practice_results birga counter
--      (avvalgi AI savol qiyinligini saqlab, har safar kuchaytiradi)
--
-- RLS: profiles jadvalida allaqachon "faqat egasi yozadi" siyosatlari
-- bor — profile_bg_url shu siyosatlardan foydalanadi, alohida policy
-- kerak emas.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_bg_url TEXT;
