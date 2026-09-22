-- ============================================================
-- SUPABASE_UPDATE_12.sql — Premium: karta o'tkazma + chek modeli
-- ISHGA TUSHIRISH: Supabase SQL Editor'da BIR MARTA ishga tushiring.
-- Safe to re-run.
--
-- Model (FindTheWay_Biznes'dan):
--   1) Foydalanuvchi ko'rsatilgan kartaga pul o'tkazadi
--   2) Chek skrinshotini yuklaydi → receipts bucket (private)
--   3) premium_requests jadvaliga status='pending' yozuv tushadi
--   4) Admin Supabase Dashboard'da status='active' qiladi
--   5) Trigger profiles.is_premium=true va premium_until=+1 oy qo'yadi
-- ============================================================

-- 1. premium_requests jadvali ------------------------------------------
CREATE TABLE IF NOT EXISTS public.premium_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'active' | 'rejected'
  plan TEXT NOT NULL DEFAULT 'Premium (29,000 so''m/oy)',
  receipt_url TEXT,
  payer_name TEXT,
  payer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ
);

ALTER TABLE public.premium_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "premium_requests_own" ON public.premium_requests;
CREATE POLICY "premium_requests_own" ON public.premium_requests
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS idx_premium_requests_user
  ON public.premium_requests (user_id, created_at DESC);

-- 1b. Olmos buyurtmalariga ham chek linki ------------------------------
ALTER TABLE public.diamond_orders ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- 2. receipts storage bucket (private) ---------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Faqat o'z faylini yuklaydi/o'qiydi
DROP POLICY IF EXISTS "receipts_upload_own" ON storage.objects;
CREATE POLICY "receipts_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "receipts_read_own" ON storage.objects;
CREATE POLICY "receipts_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Tasdiqlash trigger'i: status='active' bo'lsa premium yoqiladi -----
CREATE OR REPLACE FUNCTION public.activate_premium_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT (to'g'ridan-to'g'ri active qator) yoki UPDATE (pending -> active)
  IF NEW.status = 'active'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    UPDATE public.profiles
    SET is_premium = TRUE,
        premium_until = now() + INTERVAL '1 month'
    WHERE id = NEW.user_id;
    NEW.approved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_activate_premium ON public.premium_requests;
CREATE TRIGGER trg_activate_premium
  AFTER INSERT OR UPDATE OF status ON public.premium_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_premium_on_approval();
-- Eslatma: INSERT bilan to'g'ridan-to'g'ri status='active' qator qo'shilsa ham
-- premium avtomatik faollashadi (qo'lda tez test qilish uchun qulay).

-- 4. Rad etilsa premium o'chirilmaydi (premium_until tugashiga qoldiriladi)
-- Xohlasangiz rejected bo'lsa darhol o'chirish uchun quyidagini ham ishga tushiring:
-- CREATE OR REPLACE FUNCTION public.deactivate_premium_on_reject()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
--     UPDATE public.profiles SET is_premium = FALSE WHERE id = NEW.user_id;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Olmos buyurtmasi tasdiqlanganda olmoslarni avtomatik qo'shish -------
CREATE OR REPLACE FUNCTION public.activate_diamond_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    -- coins qatori bo'lmasa yaratamiz (olmos yo'qolmasligi uchun)
    INSERT INTO public.coins (user_id, diamonds)
    VALUES (NEW.user_id, NEW.diamonds)
    ON CONFLICT (user_id) DO NOTHING;

    UPDATE public.coins
    SET diamonds = COALESCE(diamonds, 0) + NEW.diamonds
    WHERE user_id = NEW.user_id;
    INSERT INTO public.notifications (user_id, title, text, icon, badge, icon_bg, icon_color, badge_class)
    VALUES (
      NEW.user_id,
      'Olmoslaringiz keldi!',
      NEW.diamonds || ' olmos hisobingizga qo''shildi',
      'Coins',
      '+' || NEW.diamonds || ' olmos',
      'bg-cyan-50',
      'text-cyan-500',
      'bg-cyan-50 text-cyan-600'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_activate_diamonds ON public.diamond_orders;
CREATE TRIGGER trg_activate_diamonds
  AFTER INSERT OR UPDATE OF status ON public.diamond_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_diamond_order();
