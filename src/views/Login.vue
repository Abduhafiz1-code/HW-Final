<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl mx-auto shadow-xl mb-4">📚</div>
        <h1 class="text-3xl font-black text-slate-900">HomeWork Helper</h1>
        <p class="text-slate-500 mt-1 text-sm">Aqlli o'qish platformasi</p>
      </div>
      <div class="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div class="flex rounded-2xl bg-slate-100 p-1 mb-6">
          <button @click="tab='login'" :class="tab==='login'?'bg-white shadow text-slate-900':'text-slate-500'" class="flex-1 py-2 rounded-xl text-sm font-bold transition-all">Kirish</button>
          <button @click="tab='signup'" :class="tab==='signup'?'bg-white shadow text-slate-900':'text-slate-500'" class="flex-1 py-2 rounded-xl text-sm font-bold transition-all">Ro'yxat</button>
        </div>

        <!-- LOGIN -->
        <div v-if="tab==='login'" class="space-y-4">
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Email</label>
            <input v-model="email" type="email" placeholder="email@example.com" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-400 transition" />
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Parol</label>
            <input v-model="password" type="password" placeholder="••••••••" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-400 transition" @keyup.enter="handleLogin"/>
          </div>
          <p v-if="authStore.error" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ authStore.error }}</p>
          <button @click="handleLogin" :disabled="authStore.loading" class="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-lg transition active:scale-95 disabled:opacity-60">
            {{ authStore.loading ? 'Kirmoqda...' : 'Kirish →' }}
          </button>
        </div>

        <!-- SIGNUP -->
        <div v-else class="space-y-4">
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Ism Familiya</label>
            <input v-model="fullName" type="text" placeholder="Abduhafiz Nazarov" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-400 transition" />
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Email</label>
            <input v-model="email" type="email" placeholder="email@example.com" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-400 transition" />
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Parol</label>
            <input v-model="password" type="password" placeholder="Kamida 6 ta belgi" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-400 transition" />
          </div>
          <!-- Role selector -->
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-2">Rolingizni tanlang</label>
            <div class="grid grid-cols-2 gap-3">
              <button @click="selectedRole='student'" :class="selectedRole==='student'?'border-orange-400 bg-orange-50 text-orange-700':'border-slate-200 text-slate-600'" class="py-3 px-4 rounded-2xl border-2 font-bold text-sm transition text-center">
                🎓 O'quvchi
              </button>
              <button @click="selectedRole='teacher'" :class="selectedRole==='teacher'?'border-indigo-400 bg-indigo-50 text-indigo-700':'border-slate-200 text-slate-600'" class="py-3 px-4 rounded-2xl border-2 font-bold text-sm transition text-center">
                👨‍🏫 O'qituvchi
              </button>
            </div>
          </div>
          <!-- Teacher code -->
          <div v-if="selectedRole==='teacher'">
            <label class="text-sm font-semibold text-slate-700 block mb-1">O'qituvchi kodi</label>
            <input v-model="teacherCode" type="password" placeholder="Maxsus kod kiriting" class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-400 transition" />
            <p class="text-xs text-slate-400 mt-1">* Kod maktab ma'muriyatidan olinadi</p>
          </div>
          <p v-if="authStore.error" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{{ authStore.error }}</p>
          <p v-if="signupSuccess" class="text-green-600 text-sm bg-green-50 rounded-xl px-4 py-2">✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!</p>
          <button @click="handleSignup" :disabled="authStore.loading" class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg transition active:scale-95 disabled:opacity-60">
            {{ authStore.loading ? "Ro'yxat..." : "Ro'yxatdan o'tish →" }}
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
const tab = ref<'login'|'signup'>('login');
const email = ref(''); const password = ref(''); const fullName = ref('');
const selectedRole = ref<'student'|'teacher'>('student');
const teacherCode = ref(''); const signupSuccess = ref(false);
const handleLogin = async () => { const ok = await authStore.signIn(email.value, password.value); if (ok) router.push(authStore.isTeacher ? '/teacher' : '/'); };
const handleSignup = async () => {
  const ok = await authStore.signUp(email.value, password.value, fullName.value, selectedRole.value, teacherCode.value);
  if (ok) { signupSuccess.value = true; setTimeout(() => { tab.value = 'login'; signupSuccess.value = false; }, 2000); }
};
</script>
