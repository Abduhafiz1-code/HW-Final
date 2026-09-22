-- ============================================================
-- SUPABASE_UPDATE_8_SECURITY.sql — Xavfsizlik: yetishmayotgan RLS siyosatlari
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
--
-- Nima qiladi:
--   1) test_answers    → faqat test egasi (o'qituvchi) va o'quvchining o'zi ko'radi
--   2) test_blocks     → o'quvchi faqat o'z bloklarini ko'radi/yozadi;
--                        o'qituvchi o'z testi uchun bloklarni ko'radi/bekor qiladi
--   3) notifications   → foydalanuvchi faqat o'z bildirishnomalarini boshqaradi
--   4) diamonds        → faqat o'z olmos balansini boshqaradi (agar mavjud bo'lsa)
--   5) streaks         → mavjud siyosatni qayta tasdiqlaydi
--   6) quiz_sessions   → real-time uchun qo'shimcha WITH CHECK mustahkamligi
--
-- Eslatma: ushbu skript idempotent — bir necha marta ishga tushirilsa ham xato bermaydi.
-- ============================================================

-- ------------------------------------------------------------
-- 1) TEST_ANSWERS (o'quvchi javoblari — maxfiy ma'lumot!)
--    test_results bilan bog'liq: result egasi = o'quvchi,
--    test egasi = o'qituvchi.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='test_answers') THEN
    RAISE NOTICE 'test_answers jadvali mavjud emas — avval ilovani bir marta ishga tushirib, jadval yaratiling (yoki UPDATE_4 dagi struktura asosida qo''lda yarating).';
  ELSE
    ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "test_answers_owner_or_teacher" ON test_answers;
    CREATE POLICY "test_answers_owner_or_teacher" ON test_answers FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM test_results r
        JOIN tests t ON t.id = r.test_id
        WHERE r.id = test_answers.result_id
          AND (auth.uid() = r.user_id OR auth.uid() = t.teacher_id)
      )
    );

    -- O'quvchi faqat o'z natijasiga javob yozadi
    DROP POLICY IF EXISTS "test_answers_insert_own" ON test_answers;
    CREATE POLICY "test_answers_insert_own" ON test_answers FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM test_results r
        WHERE r.id = test_answers.result_id AND auth.uid() = r.user_id
      )
    );

    -- O'qituvchi javoblarni o'chirishi mumkin (testni tozalashda)
    DROP POLICY IF EXISTS "test_answers_teacher_delete" ON test_answers;
    CREATE POLICY "test_answers_teacher_delete" ON test_answers FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM test_results r
        JOIN tests t ON t.id = r.test_id
        WHERE r.id = test_answers.result_id AND auth.uid() = t.teacher_id
      )
    );
    RAISE NOTICE 'test_answers: RLS yoqildi';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2) TEST_BLOCKS (anti-cheat bloklar)
--    Strukturasi: user_id, test_id, reason, unblocked
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='test_blocks') THEN
    RAISE NOTICE 'test_blocks jadvali mavjud emas — avval ilovani ishga tushiring.';
  ELSE
    ALTER TABLE test_blocks ENABLE ROW LEVEL SECURITY;

    -- O'quvchi o'z bloklarini ko'radi
    DROP POLICY IF EXISTS "test_blocks_select_own" ON test_blocks;
    CREATE POLICY "test_blocks_select_own" ON test_blocks FOR SELECT USING (
      auth.uid() = user_id
      OR EXISTS (SELECT 1 FROM tests t WHERE t.id = test_blocks.test_id AND auth.uid() = t.teacher_id)
    );

    -- O'quvchi faqat o'ziga blok yozadi
    DROP POLICY IF EXISTS "test_blocks_insert_own" ON test_blocks;
    CREATE POLICY "test_blocks_insert_own" ON test_blocks FOR INSERT WITH CHECK (
      auth.uid() = user_id
    );

    -- O'qituvchi blokni bekor qiladi (unblocked = true)
    DROP POLICY IF EXISTS "test_blocks_teacher_update" ON test_blocks;
    CREATE POLICY "test_blocks_teacher_update" ON test_blocks FOR UPDATE USING (
      EXISTS (SELECT 1 FROM tests t WHERE t.id = test_blocks.test_id AND auth.uid() = t.teacher_id)
    );
    RAISE NOTICE 'test_blocks: RLS yoqildi';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3) NOTIFICATIONS
--    Strukturasi: user_id, title, description, icon, badge, colors...
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    RAISE NOTICE 'notifications jadvali mavjud emas.';
  ELSE
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
    CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (
      auth.uid() = user_id
    );

    -- saveNotification o'z foydalanuvchisiga yozadi (tizim xabarlari uchun ham shu yetadi)
    DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
    CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT WITH CHECK (
      auth.uid() = user_id
    );

    DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
    CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (
      auth.uid() = user_id
    );

    DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
    CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (
      auth.uid() = user_id
    );
    RAISE NOTICE 'notifications: RLS yoqildi';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 4) DIAMONDS (agar mavjud bo'lsa)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diamonds') THEN
    ALTER TABLE diamonds ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "diamonds_own" ON diamonds;
    CREATE POLICY "diamonds_own" ON diamonds FOR ALL USING (auth.uid() = user_id);
    RAISE NOTICE 'diamonds: RLS yoqildi';
  ELSE
    RAISE NOTICE 'diamonds jadvali mavjud emas — o''tkazib yuborildi';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 5) STREAKS — mavjud siyosatni mustahkamlash (idempotent)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='streaks') THEN
    ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "streaks_policy" ON streaks;
    CREATE POLICY "streaks_policy" ON streaks FOR ALL USING (auth.uid() = user_id);
    RAISE NOTICE 'streaks: RLS tasdiqlandi';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 6) QUIZ_SESSIONS — UPDATE ham faqat ishtirokchilarga (real-time xavfsizligi)
--    Eski "FOR ALL" siyosatini ikkiga ajratamiz: SELECT + INSERT/UPDATE.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quiz_sessions') THEN
    DROP POLICY IF EXISTS "Quiz participants" ON quiz_sessions;

    DROP POLICY IF EXISTS "quiz_select_participant" ON quiz_sessions;
    CREATE POLICY "quiz_select_participant" ON quiz_sessions FOR SELECT USING (
      auth.uid() = host_id OR auth.uid() = guest_id
    );

    DROP POLICY IF EXISTS "quiz_insert_host" ON quiz_sessions;
    CREATE POLICY "quiz_insert_host" ON quiz_sessions FOR INSERT WITH CHECK (
      auth.uid() = host_id
    );

    DROP POLICY IF EXISTS "quiz_update_participant" ON quiz_sessions;
    CREATE POLICY "quiz_update_participant" ON quiz_sessions FOR UPDATE USING (
      auth.uid() = host_id OR auth.uid() = guest_id
    );

    DROP POLICY IF EXISTS "quiz_delete_participant" ON quiz_sessions;
    CREATE POLICY "quiz_delete_participant" ON quiz_sessions FOR DELETE USING (
      auth.uid() = host_id OR auth.uid() = guest_id
    );
    RAISE NOTICE 'quiz_sessions: RLS mustahkamlandi';
  END IF;
END $$;

-- ============================================================
-- Tekshiruv: qaysi jadvallarda RLS yoqilmagan?
-- ============================================================
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' ORDER BY tablename;
