<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white px-4 pt-6 pb-16">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-8">
        <RouterLink to="/"
          class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
          ←</RouterLink>
        <h1 class="text-lg font-black">Premium Obuna</h1>
      </div>

      <!-- Already premium -->
      <div v-if="authStore.isPremium" class="bg-green-500/20 border border-green-400/30 rounded-3xl p-8 text-center">
        <div class="text-5xl mb-3">✅</div>
        <h3 class="text-xl font-black text-green-300">Premium faol!</h3>
        <p class="text-white/60 text-sm mt-2">Barcha imkoniyatlardan foydalanasiz</p>
        <RouterLink to="/"
          class="mt-5 inline-block px-6 py-3 bg-white/10 rounded-2xl text-sm font-bold hover:bg-white/20 transition">←
          Bosh sahifa</RouterLink>
      </div>

      <div v-else>
        <!-- Hero -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-3">👑</div>
          <h2 class="text-3xl font-black mb-2">Premium ga o'ting</h2>
          <p class="text-white/60 text-sm">Cheksiz AI, ko'proq testlar va imkoniyatlar</p>
        </div>

        <!-- Plans -->
        <div class="space-y-3 mb-6">
          <div @click="selectedPlan = 'monthly'"
            :class="selectedPlan === 'monthly' ? 'border-orange-400 bg-white/10' : 'border-white/10 bg-white/5'"
            class="rounded-3xl border-2 p-5 cursor-pointer transition-all hover:bg-white/10">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-black">Oylik</span>
                <p class="text-white/60 text-sm mt-1">Har oy yangilanadi</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-black text-orange-400">29 900</p>
                <p class="text-xs text-white/50">so'm / oy</p>
              </div>
            </div>
          </div>
          <div @click="selectedPlan = 'yearly'"
            :class="selectedPlan === 'yearly' ? 'border-indigo-400 bg-indigo-600/20' : 'border-white/10 bg-white/5'"
            class="rounded-3xl border-2 p-5 cursor-pointer transition-all relative hover:bg-white/10">
            <div class="absolute -top-3 left-5 px-3 py-1 bg-indigo-500 rounded-full text-xs font-black">🔥 Mashhur</div>
            <div class="flex items-center justify-between">
              <div>
                <span class="font-black">Yillik</span>
                <p class="text-white/60 text-sm mt-1">2 oy bepul!</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-black text-indigo-300">249 000</p>
                <p class="text-xs text-white/50">so'm / yil</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="bg-white/5 rounded-3xl p-5 mb-6 border border-white/10">
          <div v-for="f in features" :key="f" class="flex items-center gap-3 py-1.5">
            <div class="w-5 h-5 rounded-full bg-orange-500/30 flex items-center justify-center flex-shrink-0">
              <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
            <span class="text-sm text-white/80">{{ f }}</span>
          </div>
        </div>

        <!-- Form -->
        <div v-if="!submitted" class="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-3">
          <h3 class="font-black text-lg mb-2">📋 Ma'lumotlarni kiriting</h3>
          <div>
            <label class="text-xs text-white/50 block mb-1">Ism Familiya</label>
            <input v-model="form.name" placeholder="Abduhafiz Nazarov"
              class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label class="text-xs text-white/50 block mb-1">Email</label>
            <input v-model="form.email" type="email" placeholder="email@example.com"
              class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label class="text-xs text-white/50 block mb-1">Telefon raqam</label>
            <input v-model="form.phone" placeholder="+998 90 123 45 67"
              class="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div class="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p class="text-xs text-white/60 mb-1">Tanlangan reja:</p>
            <p class="font-black text-orange-400">
              {{ selectedPlan === 'monthly' ? 'Oylik — 29 900 so\'m' : 'Yillik — 249 000 so\'m' }}</p>
          </div>
          <p v-if="formError" class="text-red-400 text-xs bg-red-400/10 rounded-xl px-3 py-2">{{ formError }}</p>
          <button @click="submitRequest" :disabled="sending"
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-base hover:opacity-90 transition disabled:opacity-60 active:scale-95">
            {{ sending ? '⏳ Yuborilmoqda...' : '📨 So\'rov yuborish' }}
          </button>
          <p class="text-center text-white/30 text-xs">So'rov yuborilgach, 24 soat ichida bog'lanamiz</p>
        </div>

        <!-- Success -->
        <div v-else class="bg-green-500/20 border border-green-400/30 rounded-3xl p-8 text-center">
          <div class="text-5xl mb-4">🎉</div>
          <h2 class="text-xl font-black text-green-300">So'rov yuborildi!</h2>
          <p class="text-white/60 text-sm mt-2">24 soat ichida telefon yoki email orqali bog'lanamiz va to'lov
            ma'lumotlarini yuboramiz.</p>
          <RouterLink to="/"
            class="mt-5 inline-block px-6 py-3 bg-white/10 rounded-2xl text-sm font-bold hover:bg-white/20 transition">←
            Bosh sahifaga</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/AuthStore';
import supabase from '../supabase';

const authStore = useAuthStore();
const selectedPlan = ref('yearly');
const sending = ref(false);
const submitted = ref(false);
const formError = ref('');

const form = ref({ name: authStore.displayName, email: authStore.user?.email || '', phone: '' });

const features = [
  'Cheksiz AI savollari',
  'Co-op testlar (10 tagacha)',
  'Barcha tarjima tillari',
  'Leaderboard ustunliklari',
  'Reklama yo\'q',
  'Prioritet qo\'llab-quvvatlash',
];

const submitRequest = async () => {
  if (!form.value.name.trim()) { formError.value = 'Ism kiriting!'; return; }
  if (!form.value.email.trim()) { formError.value = 'Email kiriting!'; return; }
  if (!form.value.phone.trim()) { formError.value = 'Telefon raqam kiriting!'; return; }

  sending.value = true; formError.value = '';
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.functions.invoke('send-telegram', {
      body: {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        plan: selectedPlan.value === 'monthly' ? 'Oylik — 29 900 so\'m' : 'Yillik — 249 000 so\'m',
        userId: user?.id || ''
      }
    });
    if (error) throw error;
    submitted.value = true;
  } catch {
    formError.value = 'Xatolik yuz berdi. Qayta urinib ko\'ring.';
  }
  sending.value = false;
};
</script>