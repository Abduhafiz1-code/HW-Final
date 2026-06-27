# HomeWork Helper — Project Roadmap

## 1. App flow

Foydalanuvchi tizimga kirgach, asosiy sahifalar quyidagicha:

- **Home** → **Map** → **AI** → **Profile**

Bu loyihaning asosiy maqsadi: oson navigatsiya, shaxsiy ma’lumotlar, xarita hamda AI yordamchisi.

---

## 2. Home page

Home sahifada quyidagi asosiy bloklar bo‘ladi:

- **Header**: logo + foydalanuvchi ma’lumotlari
- **TabBar**: pastki navigatsiya
- **Cards**: tezkor ko‘rinishdagi kartalar va sahifa elementlari

### Home sahifadagi kartalar

- **User level**: foydalanuvchi darajasi
- **Strike**: faoliyat statistikasi
- **AI quick access**: tezkor AI bo‘limiga kirish
- **Map preview**: xarita ko‘rinishi va foydalanuvchilar joylashuvi

---

## 3. Tabbar (bottom navigation)

Pastki navigatsiyada to‘rt asosiy bo‘lim bo‘ladi:

- Home
- Map
- AI
- Profile

Har biri o‘z routeni oladi:

- `/home`
- `/map`
- `/ai`
- `/profile`

---

## 4. Map page

Map sahifa foydalanuvchilar joylashuvi va atrofdagi ma’lumotlar uchun.

### Asosiy elementlar

- Foydalanuvchi joylashuvi (fake data yoki haqiqiy API orqali)
- Boshqa foydalanuvchilar ro‘yxati / markerlar

### Har bir foydalanuvchi uchun ko‘rsatiladi

- Name
- Age
- Level
- Strike
- Location

### User click → User Detail Page

User detail sahifaida quyidagilar ko‘rsatiladi:

- Name
- Age
- Level
- Strike
- Information

---

## 5. AI page

AI bo‘limida quyidagi funksiyalar bo‘ladi:

- **Chat**: AI bilan yozishish
- **Image Generator**: tasvir yaratish
- **Ro'bot Assistant**: yordamchi funksiyalar
- **Teach Notes**: o‘qituvchi yoki eslatmalar

### Qo‘shimcha imkoniyatlar

- chat history
- saved answers
- favorite messages

---

## 6. Profile page

Profile sahifasi foydalanuvchi shaxsiy ma’lumotlari va sozlamalar uchun.

### Ko‘rinish

- Avatar
- Name
- Account info

### Bo‘limlar

1. **Settings**
   - Change name
   - Change password

2. **Activity**
   - Active level
   - Online days
   - Strike statistics

3. **History**
   - AI chats
   - Images
   - Questions

4. **Logout**
   - Sign out from account

---

## 7. Main idea

**User → Home → Map → AI → Profile**

Bu loyiha dashboard, ijtimoiy elementlar va AI yordamchisini birlashtiradi. Loyihaning asosiy asoslari:

- Foydalanuvchi faoliyati
- Tezkor navigator
- Shaxsiy ma’lumotlar
- AI yordamchisi
- Vizual va yengil interfeys
