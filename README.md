# 🎓 HomeWork Helper (Socrati)

O'zbekiston o'quvchilari uchun AI yordamchisi: uy vazifasi skaner, testlar, o'yinlar, do'stlar bilan real-time chat va musobaqalar.

[![CI](https://github.com/YOUR_USERNAME/HW-Final/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/HW-Final/actions/workflows/ci.yml)

## ✨ Asosiy xususiyatlar

| Xususiyat | Holat |
| --- | --- |
| 📸 **Uy vazifasi skaner** — suratga ol, AI bosqichma-bosqich yechib beradi | ✅ Vision AI |
| 🔐 Login / Signup / Logout (Supabase Auth) | ✅ |
| 💬 Do'stlar bilan real-time chat (onlayn status, typing, o'qilmaganlar) | ✅ Presence |
| 🎯 Birgalikda Test (co-op quiz, real-time, g'alaba animatsiyasi) | ✅ |
| 🤖 AI tarjimon, testlar va mashqlar (Edge Function orqali — kalit himoyalangan) | ✅ |
| 🎮 So'z o'yinlari + jamoa jangi (online/offline) | ✅ |
| 🏆 Leaderboard, streak 🔥, tanga/olmos iqtisodiyoti | ✅ |
| 🎉 Har test/o'yin yakunida animatsiyali tabrik ekrani + ijtimoiy tarmoqqa ulashish | ✅ |
| 📱 PWA — telefonga "bosh ekranga qo'shish" bilan o'rnatiladi, offline qisman ishlaydi | ✅ |
| 🌙 Dark mode | ✅ |

## 🚀 Ishga tushirish

```bash
# 1. Paketlarni o'rnatish
npm install

# 2. Muhit o'zgaruvchilari
cp .env.example .env.local
# .env.local ichiga Supabase URL va anon key'ni yozing

# 3. Ishga tushirish
npm run dev
```

## ⚙️ Supabase sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating
2. Quyidagi SQL fayllarni **shu tartibda** Supabase SQL Editor'da ishga tushiring:
   `SUPABASE_SETUP.sql` → `SUPABASE_NEW_TABLES.sql` → `SUPABASE_UPDATE_2.sql` → `SUPABASE_UPDATE_3.sql` → `SUPABASE_UPDATE_4.sql` → `SUPABASE_UPDATE_5.sql` → `SUPABASE_UPDATE_6.sql` → `SUPABASE_UPDATE_6_GAME_AND_GROUPS.sql` → `SUPABASE_UPDATE_7.sql` → **`SUPABASE_UPDATE_8_SECURITY.sql`** (⚠️ xavfsizlik uchun majburiy!)
3. `.env.local` fayliga `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` yozing (namuna: `.env.example`)

### 🤖 AI Edge Function'larni deploy qilish

AI kalitlari **faqat server tomonda** saqlanadi — brauzerga hech qachon tushmaydi:

```bash
# Supabase CLI bilan (bir marta)
supabase login
supabase link --project-ref <loyiha-ref>

# AI provayder kalitini secrets'ga qo'ying (bittasi yetarli)
supabase secrets set GROQ_API_KEY=gsk_...
# yoki
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Function'larni deploy qiling
supabase functions deploy GroqAI
supabase functions deploy homework-ocr
```

## 🔒 Xavfsizlik (muxlisan o'qing!)

- **Kalitlar**: `.env.local` faqat sizning kompyuteringizda — `.gitignore`'da `*.local` bor, git'ga tushmaydi. CI har push'da buni avtomatik tekshiradi.
- **RLS (Row Level Security)**: `SUPABASE_UPDATE_8_SECURITY.sql` barcha jadvallarga foydalanuvchi faqat **o'z ma'lumotini** ko'rish siyosatini qo'yadi:
  - `test_answers` — faqat o'quvchining o'zi va test egasi o'qituvchi ko'radi
  - `notifications`, `streaks`, `diamonds` — faqat egasi
  - `quiz_sessions` — faqat o'sha o'yin ishtirokchilari
  - `messages` — faqat xona ishtirokchilari (UPDATE_4 da)
- **AI kalitlari** Edge Function secrets'da — frontend'da yo'q.
- ⚠️ **RLS tekshirish**: Supabase Dashboard → Authentication → Policies'da barcha jadvallarda RLS yoniq ekanini vaqti-vaqti bilan tekshiring:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
  -- rowsecurity=false qolgan jadval bo'lsa — xavfsizlik teshigi!
  ```

## 🚢 Deploy (bepul)

### Vercel (tavsiya etiladi)

1. Repo'ni GitHub'ga push qiling (`.env.local` yuklanmaydi)
2. [vercel.com](https://vercel.com) → New Project → repo'ni tanlang
3. **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` qo'shing
4. Deploy — tayyor! SPA yo'naltirishlari `vercel.json` bilan avtomatik.

### Netlify (muqobil)

Build: `npm run build`, Publish: `dist` (`netlify.toml` tayyor). Env o'zgaruvchilarni Site settings → Environment variables'da qo'ying.

### 📱 Telefonga o'rnatish (PWA)

Sayt deploy qilingach hech qanday App Store'siz:
- **Android (Chrome)**: "Ilovani o'rnatish" taklifi yoki ⋮ → "Bosh ekranga qo'shish"
- **iPhone (Safari)**: Ulashish → "Bosh ekranga qo'shish"

Interfeys offlineda ochiladi; internet talab qiladigan amallar (chat, test) uchun aloqa kerak.

## 🗂 Fayl tuzilmasi

```
src/
├── components/
│   ├── CelebrationOverlay.vue   ← animatsiyali tabrik ekrani (konfeti + count-up + share)
│   ├── HomeworkCamera.vue       ← uy vazifasi suratga olish
│   ├── quiz/                    ← umumiy quiz UI (header, option, progress, result)
│   └── ...
├── views/
│   ├── Homework.vue             ← 📸 rasm → AI yechim
│   ├── Login.vue, Chat.vue, QuizCoop.vue, SoloQuiz.vue, StudentQuiz.vue
│   ├── Game.vue (so'z o'yinlari + jamoa jangi), Events.vue, Teacher.vue
│   └── ...
├── stores/                      ← Pinia (Auth, Chat, QuizCoop, Coin...)
└── lib/ai.ts                    ← Edge Function orqali AI chaqiruv + limitlar
supabase/functions/
├── GroqAI/                      ← matn AI (tarjimon, test generator)
└── homework-ocr/                ← 📸 rasm AI (vision yechim)
```

## 🛡 CI

Har push va PR'da GitHub Actions avtomatik ishlaydi:
1. `vue-tsc` tip tekshiruvi
2. Production build
3. Env fayllar git'ga tushmaganini tekshirish

Badge'ga o'z GitHub username'ingizni yozib qo'ying (`YOUR_USERNAME` o'rniga).

## 🗺 Yo'l xaritasi

- [ ] Flashcard / spaced repetition
- [ ] Ovozli savol berish (speech-to-text)
- [ ] Payme/Click to'lov integratsiyasi (Stripe o'rniga mahalliy)
- [ ] Ota-ona/o'qituvchi kengaytirilgan dashboardi
- [ ] Push eslatmalar (streak uzilishidan oldin)
- [ ] Ko'p tilli interfeys (uz/ru/en)
