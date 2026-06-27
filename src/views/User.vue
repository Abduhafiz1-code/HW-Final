<template>
  <div class="min-h-screen bg-[#F7F9FC] px-5 pb-24 pt-6">
    <div class="max-w-5xl mx-auto flex flex-col gap-6">
      <section class="bg-white rounded-3xl shadow-lg p-6">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-4">
            <div class="h-24 w-24 flex items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 text-4xl font-bold text-white shadow-lg">{{ authStore.displayInitial }}</div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-3xl font-bold text-slate-900">{{ authStore.displayName }}</h1>
                <span v-if="authStore.isPremium" class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-black rounded-lg">👑 Premium</span>
                <span v-if="authStore.isTeacher" class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-lg">👨‍🏫 Teacher</span>
              </div>
              <p class="mt-1 text-sm text-slate-600">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink v-if="authStore.isTeacher" to="/teacher" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition">👨‍🏫 Teacher Panel</RouterLink>
            <RouterLink v-if="!authStore.isPremium" to="/premium" class="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm shadow hover:opacity-90 transition">👑 Premium</RouterLink>
            <button @click="handleLogout" class="px-4 py-2 rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition">Chiqish ↪</button>
          </div>
        </div>
      </section>

      <button @click="openEdit" class="self-start px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition">Edit profile</button>

      <!-- Usage stats -->
      <section class="grid gap-4 md:grid-cols-3">
        <div class="bg-white rounded-3xl shadow p-5">
          <span class="text-sm text-slate-500">AI So'rovlar</span>
          <div class="mt-4 text-3xl font-bold" :class="authStore.isPremium?'text-green-600':'text-orange-500'">{{ authStore.isPremium ? '∞' : `${authStore.aiUsageCount}/3` }}</div>
          <p class="mt-2 text-xs text-slate-500">{{ authStore.isPremium ? 'Cheksiz' : `${3-authStore.aiUsageCount} ta qoldi` }}</p>
        </div>
        <div class="bg-white rounded-3xl shadow p-5">
          <span class="text-sm text-slate-500">Co-op testlar</span>
          <div class="mt-4 text-3xl font-bold" :class="authStore.isPremium?'text-green-600':'text-indigo-500'">{{ authStore.isPremium ? '10' : `${authStore.coopUsageCount}/2` }}</div>
          <p class="mt-2 text-xs text-slate-500">{{ authStore.isPremium ? 'Premium' : `${2-authStore.coopUsageCount} ta qoldi` }}</p>
        </div>
        <div class="bg-white rounded-3xl shadow p-5">
          <span class="text-sm text-slate-500">Obuna</span>
          <div class="mt-4 text-3xl font-bold" :class="authStore.isPremium?'text-amber-500':'text-slate-400'">{{ authStore.isPremium ? '👑' : '🔓' }}</div>
          <p class="mt-2 text-xs text-slate-500">{{ authStore.isPremium ? 'Premium faol' : 'Standart' }}</p>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2">
        <RouterLink to="/chat" class="bg-white rounded-3xl shadow p-5 flex items-center gap-4 hover:shadow-md transition group">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">💬</div>
          <div><p class="font-bold text-slate-900 group-hover:text-indigo-600 transition">Do'stlar Chat</p><p class="text-xs text-slate-500">Do'stlar bilan muloqot</p></div>
        </RouterLink>
        <RouterLink to="/translate" class="bg-white rounded-3xl shadow p-5 flex items-center gap-4 hover:shadow-md transition group">
          <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">🌐</div>
          <div><p class="font-bold text-slate-900 group-hover:text-green-600 transition">Tarjimon</p><p class="text-xs text-slate-500">AI tarjima xizmati</p></div>
        </RouterLink>
        <RouterLink to="/history" class="bg-white rounded-3xl shadow p-5 flex items-center gap-4 hover:shadow-md transition group">
          <div class="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl">📊</div>
          <div><p class="font-bold text-slate-900 group-hover:text-orange-600 transition">Tarix</p><p class="text-xs text-slate-500">Testlar va tarjimalar</p></div>
        </RouterLink>
        <RouterLink to="/game" class="bg-white rounded-3xl shadow p-5 flex items-center gap-4 hover:shadow-md transition group">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">🃏</div>
          <div><p class="font-bold text-slate-900 group-hover:text-purple-600 transition">O'yin</p><p class="text-xs text-slate-500">Karta o'yini</p></div>
        </RouterLink>
      </section>
    </div>

    <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-black text-slate-900">Profilni tahrirlash</h2>
          <button @click="editing=false" class="h-9 w-9 rounded-xl bg-slate-100 text-slate-600">x</button>
        </div>
        <div class="mt-5 space-y-4">
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700">Ism familiya</label>
            <input v-model="editName" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-slate-700">Avatar URL</label>
            <input v-model="editAvatar" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-orange-400" />
          </div>
          <p v-if="authStore.error" class="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-500">{{ authStore.error }}</p>
          <button @click="saveEdit" :disabled="authStore.loading" class="w-full rounded-2xl bg-orange-500 py-3 font-black text-white disabled:opacity-60">
            {{ authStore.loading ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';
const router = useRouter();
const authStore = useAuthStore();
const editing = ref(false);
const editName = ref('');
const editAvatar = ref('');
const openEdit = () => {
  editName.value = authStore.displayName;
  editAvatar.value = authStore.user?.user_metadata?.avatar_url || '';
  editing.value = true;
};
const saveEdit = async () => {
  const ok = await authStore.updateProfile(editName.value, editAvatar.value);
  if (ok) editing.value = false;
};
const handleLogout = async () => { await authStore.signOut(); router.push('/login'); };
</script>
