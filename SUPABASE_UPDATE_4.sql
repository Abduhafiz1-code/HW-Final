-- ============================================================
-- SUPABASE_UPDATE_4.sql — Production xavfsizlik tuzatishlari
-- Run this once in the Supabase SQL Editor before going live.
-- Safe to re-run.
--
-- Ikkita jiddiy muommoni tuzatadi:
--
-- 1) "tests" jadvali RLS'i "FOR SELECT USING (true)" edi — bu shuni
--    anglatardiki, kod kiritish ekranidan o'tmasdan, browser konsolidan
--    to'g'ridan-to'g'ri `supabase.from('tests').select('*')` chaqirilsa,
--    BARCHA o'qituvchilarning BARCHA testlari — javob kalitlari (answer)
--    bilan birga — hech qanday to'siqsiz olib ketilishi mumkin edi.
--    Endi jadvalni faqat egasi (o'qituvchi) to'g'ridan-to'g'ri o'qiy oladi;
--    o'quvchilar esa faqat aniq kodga mos BITTA testni qaytaradigan
--    get_test_by_code() RPC orqali kiradi.
--
-- 2) "messages" jadvali RLS'i "FOR ALL USING (true)" edi — bu shuni
--    anglatardiki, tizimga kirgan istalgan foydalanuvchi boshqa
--    ikki kishining suhbatidagi room_id'ni bilsa (yoki taxmin qilsa),
--    o'sha xabarlarni o'qiy/yoza/o'chira olardi. room_id har doim
--    "{user1_id}_{user2_id}" (ChatStore.getRoomId) ko'rinishida
--    yaratilgani uchun, endi faqat shu ikki ID'dan biriga tegishli
--    bo'lgan foydalanuvchi kira oladi.
-- ============================================================

-- 1. Tests: faqat egasi to'g'ridan-to'g'ri o'qiy oladi -----------------
DROP POLICY IF EXISTS "tests_readable" ON tests;
DROP POLICY IF EXISTS "tests_owner_read" ON tests;
CREATE POLICY "tests_owner_read" ON tests FOR SELECT USING (auth.uid() = teacher_id);
-- "tests_teacher_manage" (INSERT/UPDATE/DELETE, egasi) SUPABASE_NEW_TABLES.sql'da bor, o'zgarishsiz qoladi.

CREATE OR REPLACE FUNCTION public.get_test_by_code(test_code TEXT)
RETURNS TABLE(id UUID, teacher_id UUID, title TEXT, subject TEXT, questions JSONB, code TEXT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT t.id, t.teacher_id, t.title, t.subject, t.questions, t.code
  FROM tests t
  WHERE t.code = test_code
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_test_by_code(TEXT) TO authenticated;

-- 2. Messages: faqat suhbat ishtirokchilari ----------------------------
DROP POLICY IF EXISTS "Room messages" ON messages;
DROP POLICY IF EXISTS "messages_participant_only" ON messages;
CREATE POLICY "messages_participant_only" ON messages FOR ALL USING (
  auth.uid()::text = split_part(room_id, '_', 1)
  OR auth.uid()::text = split_part(room_id, '_', 2)
);

-- ============================================================
-- ESLATMA: "groups" (va unga bog'liq guruh a'zolari/topshiriqlar)
-- jadvallari SUPABASE_SETUP.sql / SUPABASE_NEW_TABLES.sql fayllarida
-- yo'q — demak ular to'g'ridan-to'g'ri Supabase Table Editor'da alohida
-- yaratilgan. Iltimos Supabase Dashboard -> Authentication -> Policies
-- bo'limiga kirib, "groups" va unga o'xshash jadvallarda RLS yoqilganini
-- va faqat tegishli foydalanuvchilar (o'qituvchi/guruh a'zolari) o'qiy-
-- yoza olishini qo'lda tekshirib chiqing.
-- ============================================================
