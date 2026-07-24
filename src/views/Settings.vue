<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button @click="router.back()"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 transition">
          <ArrowLeft :size="18" />
        </button>
        <h1 class="text-xl font-black text-slate-900 dark:text-white">Sozlamalar</h1>
      </div>

      <!-- Hisob -->
      <p class="text-xs font-black uppercase tracking-wide text-slate-400 mb-2 px-1">Hisob</p>
      <div class="space-y-2 mb-6">
        <RouterLink to="/profile/edit" class="settings-item">
          <span class="settings-label"><User :size="18" class="text-slate-400" /> Profilni tahrirlash</span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>

        <button @click="showPasswordForm = !showPasswordForm" class="settings-item w-full">
          <span class="settings-label"><KeyRound :size="18" class="text-slate-400" /> Parolni almashtirish</span>
          <ChevronDown :size="18" class="text-slate-300 dark:text-white/30 transition" :class="showPasswordForm && 'rotate-180'" />
        </button>
        <div v-if="showPasswordForm" class="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex flex-col gap-3 animate-fade-in-up">
          <input v-model="newPassword" type="password" placeholder="Yangi parol (kamida 8 belgi)"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-orange-400" />
          <input v-model="confirmPassword" type="password" placeholder="Yangi parolni takrorlang"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-orange-400" />
          <p v-if="passwordMsg" class="text-xs" :class="passwordOk ? 'text-green-500' : 'text-red-500'">{{ passwordMsg }}</p>
          <button @click="changePassword" :disabled="changingPassword"
            class="w-full py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white font-bold text-sm rounded-xl disabled:opacity-50">
            {{ changingPassword ? 'Saqlanmoqda...' : 'Parolni saqlash' }}
          </button>
        </div>
      </div>

      <!-- Ilova -->
      <p class="text-xs font-black uppercase tracking-wide text-slate-400 mb-2 px-1">Ilova</p>
      <div class="space-y-2 mb-6">
        <button @click="toggleDarkMode" class="settings-item w-full">
          <span class="settings-label">
            <Moon v-if="!isDark" :size="18" class="text-slate-400" />
            <Sun v-else :size="18" class="text-amber-400" />
            {{ isDark ? "Yorug' rejim" : 'Tungi rejim' }}
          </span>
          <div class="w-10 h-6 rounded-full transition flex items-center px-0.5" :class="isDark ? 'bg-orange-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'">
            <div class="w-5 h-5 rounded-full bg-white shadow"></div>
          </div>
        </button>

        <button @click="toggleNotifications" class="settings-item w-full">
          <span class="settings-label"><Bell :size="18" class="text-slate-400" /> Bildirishnomalar</span>
          <div class="w-10 h-6 rounded-full transition flex items-center px-0.5" :class="authStore.notificationsEnabled ? 'bg-orange-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'">
            <div class="w-5 h-5 rounded-full bg-white shadow"></div>
          </div>
        </button>
      </div>

      <!-- Ma'lumotlar -->
      <p class="text-xs font-black uppercase tracking-wide text-slate-400 mb-2 px-1">Ma'lumotlar</p>
      <div class="space-y-2 mb-6">
        <button @click="exportData" :disabled="exporting" class="settings-item w-full">
          <span class="settings-label"><Download :size="18" class="text-slate-400" /> Ma'lumotlarimni yuklab olish</span>
          <Loader v-if="exporting" :size="16" class="animate-spin text-slate-300" />
          <ChevronRight v-else :size="18" class="text-slate-300 dark:text-white/30" />
        </button>
        <button @click="showClearHistoryConfirm = true" class="settings-item w-full">
          <span class="settings-label text-red-500"><Trash2 :size="18" /> Tarixni tozalash</span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </button>
      </div>

      <!-- Qo'llab-quvvatlash -->
      <p class="text-xs font-black uppercase tracking-wide text-slate-400 mb-2 px-1">Qo'llab-quvvatlash</p>
      <div class="space-y-2 mb-6">
        <RouterLink to="/feedback" class="settings-item">
          <span class="settings-label"><MessageSquareHeart :size="18" class="text-slate-400" /> Fikr bildirish</span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>
        <button @click="showAboutModal = true" class="settings-item w-full">
          <span class="settings-label"><Info :size="18" class="text-slate-400" /> Ilova haqida</span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </button>
      </div>

      <!-- Xavfli zona -->
      <p class="text-xs font-black uppercase tracking-wide text-red-400 mb-2 px-1">Xavfli zona</p>
      <button @click="showDeleteConfirm = true"
        class="w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition">
        <UserX :size="18" /> Accountni o'chirish
      </button>
    </div>

    <!-- Tarixni tozalash tasdiqlash -->
    <ConfirmModal v-if="showClearHistoryConfirm" title="Tarixni tozalash"
      description="Barcha test, mashq va o'yin tarixingiz butunlay o'chadi. Bu amalni qaytarib bo'lmaydi."
      confirmLabel="Ha, tozalash" :loading="clearingHistory"
      @cancel="showClearHistoryConfirm = false" @confirm="handleClearHistory" />

    <!-- Accountni o'chirish tasdiqlash -->
    <ConfirmModal v-if="showDeleteConfirm" title="Accountni o'chirish"
      description="Profilingiz, barcha tanga/olmos, tarix va boshqa ma'lumotlaringiz BUTUNLAY o'chadi. Bu amalni ORQAGA QAYTARIB BO'LMAYDI."
      confirmLabel="Ha, o'chirish" danger :loading="deletingAccount"
      @cancel="showDeleteConfirm = false" @confirm="handleDeleteAccount" />

    <!-- Ilova haqida -->
    <Transition name="modal-pop">
      <div v-if="showAboutModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" @click.self="showAboutModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-slate-200 dark:border-white/10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Info :size="22" class="text-orange-500" /> Ilova haqida
            </h2>
            <button @click="showAboutModal = false"
              class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
              <X :size="16" />
            </button>
          </div>
          <div class="space-y-4 text-sm">
            <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
              <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Ilova nomi</p>
              <p class="font-black text-slate-900 dark:text-white text-lg mt-0.5">Socrati</p>
            </div>
            <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
              <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Versiya</p>
              <p class="font-black text-slate-900 dark:text-white text-lg mt-0.5">2.0.0</p>
            </div>
            <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
              <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Tavsif</p>
              <p class="text-slate-700 dark:text-white/80 mt-1 leading-relaxed">This app helps students with homework, quizzes, and games</p>
            </div>
            <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
              <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Dasturchi</p>
              <p class="font-bold text-slate-900 dark:text-white mt-0.5">Abduhafiz Qodirov</p>
              <p class="text-xs text-slate-500 dark:text-white/60 mt-0.5">Qo'qon, O'zbekiston</p>
              <p class="text-xs text-slate-500 dark:text-white/60">Full-stack dasturchi & AI muhandisi</p>
            </div>
            <a href="mailto:abduhafiznazarov@gmail.com"
              class="block w-full py-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl text-orange-600 dark:text-orange-400 font-bold text-sm text-center hover:bg-orange-100 dark:hover:bg-orange-500/20 transition flex items-center justify-center gap-2">
              <Mail :size="16" /> qodirovabduhafiz1@gmail.com
            </a>
          </div>
          <button @click="showAboutModal = false"
            class="w-full mt-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">
            Yopish
          </button>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="modal-pop">
      <div v-if="toast" class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl z-50">
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowLeft, User, KeyRound, ChevronRight, ChevronDown, Moon, Sun, Bell,
  Download, Trash2, MessageSquareHeart, Info, UserX, X, Mail, Loader,
} from '@lucide/vue';
import { useAuthStore } from '../stores/AuthStore';
import supabase from '../supabase';
import ConfirmModal from '../components/ConfirmModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const isDark = ref(document.documentElement.classList.contains('dark'));
const showAboutModal = ref(false);
const toast = ref('');
const flashToast = (msg: string) => {
  toast.value = msg;
  setTimeout(() => (toast.value = ''), 2500);
};

const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
  isDark.value = document.documentElement.classList.contains('dark');
  localStorage.setItem('darkMode', isDark.value ? 'true' : 'false');
};

const toggleNotifications = async () => {
  await authStore.setNotificationsEnabled(!authStore.notificationsEnabled);
};

// Parol almashtirish
const showPasswordForm = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);
const passwordMsg = ref('');
const passwordOk = ref(false);

const changePassword = async () => {
  passwordMsg.value = '';
  if (newPassword.value.length < 8 || !/[A-Za-z]/.test(newPassword.value) || !/\d/.test(newPassword.value)) {
    passwordMsg.value = "Parol kamida 8 belgi, harf va raqamdan iborat bo'lishi kerak.";
    passwordOk.value = false;
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordMsg.value = 'Parollar mos kelmadi.';
    passwordOk.value = false;
    return;
  }
  changingPassword.value = true;
  const { error } = await supabase.auth.updateUser({ password: newPassword.value });
  changingPassword.value = false;
  if (error) {
    passwordMsg.value = error.message;
    passwordOk.value = false;
  } else {
    passwordMsg.value = 'Parol muvaffaqiyatli yangilandi!';
    passwordOk.value = true;
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => (showPasswordForm.value = false), 1200);
  }
};

// Ma'lumotlarni yuklab olish
const exporting = ref(false);
const exportData = async () => {
  exporting.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [profile, coins, tests, practice, games] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('coins').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('test_results').select('*').eq('user_id', user.id),
      supabase.from('practice_results').select('*').eq('user_id', user.id),
      supabase.from('game_results').select('*').eq('user_id', user.id),
    ]);
    const payload = {
      exported_at: new Date().toISOString(),
      profile: profile.data,
      coins: coins.data,
      test_results: tests.data,
      practice_results: practice.data,
      game_results: games.data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'socrati-malumotlarim.json';
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    exporting.value = false;
  }
};

// Tarixni tozalash
const showClearHistoryConfirm = ref(false);
const clearingHistory = ref(false);
const handleClearHistory = async () => {
  clearingHistory.value = true;
  const ok = await authStore.clearHistory();
  clearingHistory.value = false;
  showClearHistoryConfirm.value = false;
  flashToast(ok ? "Tarix muvaffaqiyatli tozalandi" : 'Xatolik yuz berdi, qayta urinib ko\'ring');
};

// Accountni o'chirish
const showDeleteConfirm = ref(false);
const deletingAccount = ref(false);
const handleDeleteAccount = async () => {
  deletingAccount.value = true;
  const res = await authStore.deleteAccount();
  deletingAccount.value = false;
  if (res.ok) {
    router.push('/login');
  } else {
    showDeleteConfirm.value = false;
    flashToast(res.error ? `Xatolik: ${res.error}` : 'Accountni o\'chirishda xatolik yuz berdi');
  }
};
</script>

<style scoped>
@reference "../style.css";

.settings-item {
  @apply flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left;
}
.settings-label {
  @apply font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm;
}
.modal-pop-enter-active, .modal-pop-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; transform: translateY(6px); }
</style>
