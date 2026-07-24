-- ============================================================
-- SUPABASE_UPDATE_6.sql
-- Run this once in the Supabase SQL Editor (after SUPABASE_UPDATE_5.sql).
-- Adds: phone number field, a notification on/off preference, and a
-- secure self-service "delete my account" RPC.
-- Safe to re-run.
-- ============================================================

-- 1. Telefon raqam ---------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Bildirishnomalar yoqilgan/o'chirilganligi ------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- 3. Accountni butunlay o'chirish (foydalanuvchi FAQAT o'zinikini) ----
-- SECURITY DEFINER bo'lgani uchun auth.users jadvaliga yozish huquqiga
-- ega, lekin auth.uid() orqali faqat CHAQIRUVCHINING o'z hisobini
-- o'chira oladi. profiles/coins/test_results va h.k. barchasi
-- profiles(id) ga ON DELETE CASCADE bilan bog'langani uchun avtomatik
-- o'chadi.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
