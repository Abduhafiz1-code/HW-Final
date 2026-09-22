<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
    <!-- Fon bezaklari (yumshoq harakatlanuvchi doiralar) -->
    <div class="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-orange-200/40 dark:bg-orange-900/20 blur-3xl animate-float-slow"></div>
    <div class="pointer-events-none absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl animate-float-slow" style="animation-delay: 1.3s"></div>

    <div class="w-full max-w-md relative z-10 animate-fade-in-up">
      <!-- Logo va sarlavha -->
      <div class="text-center mb-7">
        <div
          class="w-20 h-20 rounded-[1.6rem] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto shadow-xl shadow-orange-300/50 dark:shadow-none mb-4 animate-logo-pop">
          <BookOpen :size="36" class="text-white" />
        </div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white">HomeWork Helper</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">Aqlli o'qish platformasi 🎓</p>
      </div>

      <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-3xl shadow-2xl shadow-slate-300/50 dark:shadow-none border border-white/60 dark:border-slate-700 p-7">
        <!-- Tab switcher (slayd indikator bilan) -->
        <div class="relative flex rounded-2xl bg-slate-100 dark:bg-slate-700/60 p-1 mb-6">
          <span class="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white dark:bg-slate-600 shadow transition-transform duration-300 ease-out"
            :class="tab === 'login' ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'"></span>
          <button @click="tab = 'login'"
            class="relative z-10 flex-1 py-2 rounded-xl text-sm font-black transition-colors"
            :class="tab === 'login' ? 'text-slate-900 dark:text-white' : 'text-slate-400'">Kirish</button>
          <button @click="tab = 'signup'"
            class="relative z-10 flex-1 py-2 rounded-xl text-sm font-black transition-colors"
            :class="tab === 'signup' ? 'text-slate-900 dark:text-white' : 'text-slate-400'">Ro'yxat</button>
        </div>

        <!-- LOGIN -->
        <div v-if="tab === 'login'" class="space-y-4">
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Email</label>
            <input v-model="email" type="email" placeholder="email@example.com"
              class="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/40 transition" />
          </div>
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Parol</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                class="w-full px-4 py-3.5 pr-12 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/40 transition"
                @keyup.enter="handleLogin" />
              <button @click="showPassword = !showPassword" type="button"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                :title="showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'">
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
          </div>

          <p v-if="authStore.error"
            class="text-red-500 text-sm font-semibold bg-red-50 dark:bg-red-900/20 rounded-2xl px-4 py-2.5 flex items-center gap-2 animate-pop">
            <XCircle :size="15" class="flex-shrink-0" /> {{ authStore.error }}
          </p>

          <button @click="handleLogin" :disabled="authStore.loading || !email.trim() || !password"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white font-black text-base shadow-lg shadow-orange-300/50 dark:shadow-none transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            <Loader v-if="authStore.loading" :size="17" class="animate-spin" />
            {{ authStore.loading ? 'Kirmoqda...' : 'Kirish →' }}
          </button>
        </div>

        <!-- SIGNUP -->
        <div v-else class="space-y-4">
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Ism Familiya</label>
            <input v-model="fullName" type="text" placeholder="Abduhafiz Nazarov"
              class="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/40 transition" />
          </div>
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Email</label>
            <input v-model="email" type="email" placeholder="email@example.com"
              class="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/40 transition" />
          </div>
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Parol</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Kamida 8 ta belgi, harf + raqam"
                class="w-full px-4 py-3.5 pr-12 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/40 transition" />
              <button @click="showPassword = !showPassword" type="button"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
            <!-- Parol kuchi indikatori -->
            <div v-if="password" class="flex items-center gap-2 mt-2">
              <div class="flex-1 flex gap-1">
                <span v-for="i in 4" :key="i" class="h-1.5 flex-1 rounded-full transition-all duration-300"
                  :class="i <= passwordStrength ? strengthColor : 'bg-slate-200 dark:bg-slate-600'"></span>
              </div>
              <span class="text-[10px] font-black" :class="strengthTextColor">{{ strengthLabel }}</span>
            </div>
          </div>

          <!-- Rol tanlash (kartochka ko'rinishida) -->
          <div>
            <label class="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Rolingizni tanlang</label>
            <div class="grid grid-cols-2 gap-3">
              <button @click="selectedRole = 'student'" type="button"
                :class="selectedRole === 'student'
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 ring-2 ring-orange-100 dark:ring-orange-900 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-orange-200'"
                class="py-3.5 px-4 rounded-2xl border-2 font-black text-sm transition-all text-center flex flex-col items-center gap-1">
                <GraduationCap :size="20" />
                O'quvchi
                <span class="text-[9px] font-bold text-slate-400 leading-tight">Darslar, testlar, o'yinlar</span>
              </button>
              <button @click="selectedRole = 'teacher'" type="button"
                :class="selectedRole === 'teacher'
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-100 dark:ring-indigo-900 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-200'"
                class="py-3.5 px-4 rounded-2xl border-2 font-black text-sm transition-all text-center flex flex-col items-center gap-1">
                <School :size="20" />
                O'qituvchi
                <span class="text-[9px] font-bold text-slate-400 leading-tight">Test tuzish, guruh boshqarish</span>
              </button>
            </div>
            <!-- Kod yo'q: xohlagan odam o'qituvchi bo'ladi -->
            <Transition name="slide-down">
              <p v-if="selectedRole === 'teacher'"
                class="text-[11px] text-indigo-500 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-3 py-2 mt-2 font-bold flex items-center gap-1.5 animate-pop">
                <Sparkles :size="12" /> O'qituvchi sifatida to'liq kirishingiz mumkin — maxsus kod shart emas!
              </p>
            </Transition>
          </div>

          <p v-if="authStore.error"
            class="text-red-500 text-sm font-semibold bg-red-50 dark:bg-red-900/20 rounded-2xl px-4 py-2.5 flex items-center gap-2 animate-pop">
            <XCircle :size="15" class="flex-shrink-0" /> {{ authStore.error }}
          </p>
          <p v-if="signupSuccess"
            class="text-green-600 text-sm font-semibold bg-green-50 dark:bg-green-900/20 rounded-2xl px-4 py-2.5 flex items-center gap-2 animate-pop">
            <CheckCircle2 :size="15" class="flex-shrink-0" /> Muvaffaqiyatli ro'yxatdan o'tdingiz! 🎉
          </p>

          <button @click="handleSignup"
            :disabled="authStore.loading || !email.trim() || !password || fullName.trim().length < 2"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-90 text-white font-black text-base shadow-lg shadow-indigo-300/50 dark:shadow-none transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
            <Loader v-if="authStore.loading" :size="17" class="animate-spin" />
            {{ authStore.loading ? "Ro'yxatdan o'tmoqda..." : "Ro'yxatdan o'tish →" }}
          </button>
        </div>
      </div>

      <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
        Davom etish orqali siz <span class="font-bold text-slate-500 dark:text-slate-400">foydalanish shartlari</span>ga rozilik bildirasiz
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  BookOpen, GraduationCap, School, Eye, EyeOff,
  XCircle, CheckCircle2, Loader, Sparkles,
} from '@lucide/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const authStore = useAuthStore();
const tab = ref<'login' | 'signup'>('login');
const email = ref(''); const password = ref(''); const fullName = ref('');
const selectedRole = ref<'student' | 'teacher'>('student');
const showPassword = ref(false);
const signupSuccess = ref(false);

/* ---- Parol kuchi (0-4) ---- */
const passwordStrength = computed(() => {
  const p = password.value;
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return s;
});
const strengthLabel = computed(() =>
  ['Juda kuchsiz', 'Kuchsiz', "O'rtacha", 'Yaxshi', 'Kuchli'][passwordStrength.value],
);
const strengthColor = computed(() =>
  ['', 'bg-red-400', 'bg-amber-400', 'bg-lime-400', 'bg-green-500'][passwordStrength.value],
);
const strengthTextColor = computed(() =>
  ['', 'text-red-400', 'text-amber-500', 'text-lime-500', 'text-green-500'][passwordStrength.value],
);

const handleLogin = async () => {
  const ok = await authStore.signIn(email.value, password.value);
  if (ok) router.push(authStore.isTeacher ? '/teacher' : '/');
};

const handleSignup = async () => {
  // O'qituvchi kodi BEKOR QILINDI — roli tanlangan bo'lsa shart emas
  const ok = await authStore.signUp(email.value, password.value, fullName.value, selectedRole.value);
  if (ok) {
    signupSuccess.value = true;
    setTimeout(() => {
      router.push(authStore.isTeacher ? '/teacher' : '/');
    }, 1000);
  }
};
</script>

<style scoped>
/* Logo kirib keladi */
@keyframes logoPop {
  0% { transform: scale(0.4) rotate(-12deg); opacity: 0; }
  60% { transform: scale(1.12) rotate(4deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.animate-logo-pop {
  animation: logoPop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Kontent pastdan suzib keladi */
.animate-fade-in-up {
  animation: fadeInUp 0.55s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Fon doiralari sekin suzadi */
@keyframes floatSlow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(24px, -18px) scale(1.06); }
}

.animate-float-slow {
  animation: floatSlow 7s ease-in-out infinite;
}

/* Xabarlar pop */
.animate-pop {
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Teacher info chiqishi */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
