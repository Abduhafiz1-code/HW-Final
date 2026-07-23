# 🎓 HomeWork Helper - To'liq Versiya

## ✅ Yangi Xususiyatlar

| Xususiyat                       | Holat                |
| ------------------------------- | -------------------- |
| 🔐 Login / Signup / Logout      | ✅ Supabase Auth     |
| 💬 Do'stlar bilan Chat          | ✅ Real-time         |
| 🎯 Birgalikda Test (Co-op Quiz) | ✅ Supabase Realtime |
| 🌐 Tarjimon (Translate)         | ✅ Claude AI         |
| 👑 Premium sahifa (to'lov UI)   | ✅ To'liq UI         |
| 🤖 AI (real Anthropic API)      | ✅ claude-sonnet-4-6 |
| 🏆 Leaderboard                  | ✅ Mavjud            |
| 📊 Progress tracker             | ✅ Mavjud            |

## 🚀 Ishga tushirish

```bash
npm install
npm run dev
```

## ⚙️ Supabase sozlash

1. [supabase.com](https://supabase.com) ga kiring
2. Quyidagi SQL fayllarni **shu tartibda** Supabase SQL Editor'da ishga tushiring:
   `SUPABASE_SETUP.sql` → `SUPABASE_NEW_TABLES.sql` → `SUPABASE_UPDATE_2.sql` → `SUPABASE_UPDATE_3.sql` → `SUPABASE_UPDATE_4.sql`
3. `.env.local` faylida `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` allaqachon mavjud

## 🌐 Ommaga chiqarish (deploy)

Loyiha ilova ko'rinishida ham (PWA — telefonga "bosh ekranga qo'shish" orqali o'rnatiladi), oddiy veb-sayt sifatida ham ishlaydi. Hostingga qo'yish uchun:

### Vercel (tavsiya etiladi)

1. Loyihani GitHub'ga yuklang (`.env.local` **yuklanmaydi** — u `.gitignore`'da).
2. [vercel.com](https://vercel.com) → "New Project" → GitHub repo'ni tanlang.
3. **Environment Variables** bo'limiga qo'shing:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
     (qiymatlarni `.env.local` faylidan ko'chiring)
4. Build command: `npm run build`, Output directory: `dist` (Vercel buni avtomatik aniqlaydi). `vercel.json` fayli SPA yo'naltirishlarini o'zi sozlab qo'yadi.
5. **Deploy** tugmasini bosing. Bir necha daqiqada `https://loyiha-nomi.vercel.app` manzili tayyor bo'ladi.
6. O'z domeningiz bo'lsa: Vercel loyihasida **Settings → Domains** dan domeningizni qo'shing va ko'rsatilgan DNS yozuvini (odatda `CNAME`) domen provayderingizda (masalan, Namecheap, GoDaddy) sozlang.

### Netlify (muqobil variant)

1. [netlify.com](https://netlify.com) → "Add new site" → GitHub repo'ni ulang.
2. Build command: `npm run build`, Publish directory: `dist` (`netlify.toml` allaqachon shu sozlamalar bilan tayyor).
3. **Site settings → Environment variables** bo'limiga yuqoridagi ikkita o'zgaruvchini qo'shing.
4. Deploy qiling, so'ng **Domain settings** dan o'z domeningizni ulang.

### Telefonga ilova sifatida o'rnatish (PWA)

Sayt deploy qilingandan so'ng, foydalanuvchilar hech qanday App Store/Play Market'siz o'rnatishlari mumkin:

- **Android (Chrome)**: sayt ochilganda pastda "Ilovani o'rnatish" taklifi chiqadi, yoki ⋮ menyu → "Bosh ekranga qo'shish".
- **iPhone (Safari)**: pastdagi ulashish tugmasi → "Bosh ekranga qo'shish".

Ilova offlineda ham ochiladi (interfeys keshlanadi), lekin internet talab qiladigan amallar (login, testlar, chat) internet bo'lishini talab qiladi — aloqa uzilsa, ekran tepasida ogohlantirish chiqadi.

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
│   └── Events.vue       ← Vaqtinchalik musobaqalar + Test yechish orqali olmoslar olish
├── stores/
│   ├── AuthStore.ts       ← Yangi: Auth management
│   ├── ChatStore.ts       ← Yangi: Chat & Friends
│   └── QuizCoopStore.ts   ← Yangi: Co-op Quiz
```
