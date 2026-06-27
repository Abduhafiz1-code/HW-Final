# 🎓 HomeWork Helper - To'liq Versiya

## ✅ Yangi Xususiyatlar

| Xususiyat | Holat |
|-----------|-------|
| 🔐 Login / Signup / Logout | ✅ Supabase Auth |
| 💬 Do'stlar bilan Chat | ✅ Real-time |
| 🎯 Birgalikda Test (Co-op Quiz) | ✅ Supabase Realtime |
| 🌐 Tarjimon (Translate) | ✅ Claude AI |
| 👑 Premium sahifa (to'lov UI) | ✅ To'liq UI |
| 🤖 AI (real Anthropic API) | ✅ claude-sonnet-4-6 |
| 🏆 Leaderboard | ✅ Mavjud |
| 📊 Progress tracker | ✅ Mavjud |

## 🚀 Ishga tushirish

```bash
npm install
npm run dev
```

## ⚙️ Supabase sozlash

1. [supabase.com](https://supabase.com) ga kiring
2. `SUPABASE_SETUP.sql` fayldagi SQL ni Supabase SQL Editor da ishga tushiring
3. `.env.local` faylida URL va KEY allaqachon mavjud

## 📁 Fayl tuzilmasi (yangi)

```
src/
├── views/
│   ├── Login.vue          ← Yangi: Login/Signup
│   ├── Chat.vue           ← Yangi: Do'stlar Chat
│   ├── QuizCoop.vue       ← Yangi: Birgalikda Test
│   ├── Translate.vue      ← Yangi: AI Tarjimon
│   ├── Premium.vue        ← Yangi: Premium obuna
│   ├── AI.vue             ← Real Anthropic API
│   ├── User.vue           ← Logout qo'shildi
│   └── HomeView.vue       ← Premium + Translate tugmalari
├── stores/
│   ├── AuthStore.ts       ← Yangi: Auth management
│   ├── ChatStore.ts       ← Yangi: Chat & Friends
│   └── QuizCoopStore.ts   ← Yangi: Co-op Quiz
```
