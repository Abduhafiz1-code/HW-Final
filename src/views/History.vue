<template>
  <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          ←</RouterLink>
        <div>
          <h1 class=" flex gap-2 items-center text-xl font-black text-slate-900"><svg xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 16 16">
              <path d="M0 0h16v16H0z" fill="none" />
              <path fill="#ff9700" fill-rule="evenodd"
                d="M4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3m-3 1.5a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3zm8.499 6.251a.75.75 0 0 0 1.5 0V8.749a.75.75 0 0 0-1.5 0zm-1.998.75a.75.75 0 0 1-.75-.75V5.249a.75.75 0 1 1 1.5 0v5.502a.75.75 0 0 1-.75.75m-3.498-.75a.75.75 0 0 0 1.5 0V7.249a.75.75 0 1 0-1.5 0z"
                clip-rule="evenodd" />
            </svg>
            Tarix</h1>
          <p class="text-xs text-slate-500">O'tilgan testlar va tarjimalar</p>
        </div>
      </div>

      <div class="flex rounded-2xl bg-white border border-slate-200 p-1 mb-5 shadow-sm">
        <button v-for="t in tabs" :key="t.id" @click="activeTab = t.id; loadTab(t.id)"
          :class="activeTab === t.id ? 'bg-orange-500 text-white shadow' : 'text-slate-600'"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1">{{ t.label }}</button>
      </div>

      <div v-if="loading" class="text-center py-16">
        <div class="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-3">
        </div>
        <p class="text-slate-400 text-sm">Yuklanmoqda...</p>
      </div>

      <!-- Quiz history -->
      <div v-else-if="activeTab === 'quiz'" class="space-y-3">
        <div v-if="quizHistory.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div class="text-5xl mb-3 text-center w-full flex justify-center  "><svg xmlns="http://www.w3.org/2000/svg"
              width="80" height="80" viewBox="0 0 80 80">
              <path d="M0 0h80v80H0z" fill="none" />
              <path fill="#ff9700" fill-rule="evenodd"
                d="M29.5 11.5a1.5 1.5 0 0 0-3 0v2H22a4 4 0 0 0-4 4v48a4 4 0 0 0 4 4h36a4 4 0 0 0 4-4v-48a4 4 0 0 0-4-4h-4.5v-2a1.5 1.5 0 0 0-3 0v2h-5v-2a1.5 1.5 0 0 0-3 0v2h-5v-2a1.5 1.5 0 0 0-3 0v2h-5zM28 23a2.5 2.5 0 0 0 0 5h24a2.5 2.5 0 0 0 0-5zm-2.5 18.5A2.5 2.5 0 0 1 28 39h24a2.5 2.5 0 0 1 0 5H28a2.5 2.5 0 0 1-2.5-2.5M28 55a2.5 2.5 0 0 0 0 5h24a2.5 2.5 0 0 0 0-5zm-2.5-21.5A2.5 2.5 0 0 1 28 31h16a2.5 2.5 0 0 1 0 5H28a2.5 2.5 0 0 1-2.5-2.5M28 47a2.5 2.5 0 0 0 0 5h16a2.5 2.5 0 0 0 0-5z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-slate-500">Hali test yechmadingiz</p>
          <RouterLink to="/student-quiz"
            class="mt-4 inline-block px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">Test yechish →
          </RouterLink>
        </div>
        <div v-for="item in quizHistory" :key="item.id"
          class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-sm font-black text-slate-900">{{ item.tests?.title || 'Test' }}</span>
              <p class="text-xs text-slate-400">{{ item.tests?.subject }}</p>
            </div>
            <span :class="item.percent >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'"
              class="text-sm font-black px-3 py-1 rounded-xl">{{ item.percent }}%</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500">
            <span class="flex items-center gap-1"><CheckCircle :size="14" /> {{ item.score }}/{{ item.total }} to'g'ri</span>
            <span class="flex items-center gap-1"><Calendar :size="14" /> {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div :class="item.percent >= 70 ? 'bg-green-500' : 'bg-red-400'" class="h-2 rounded-full"
              :style="{ width: `${item.percent}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Practice history -->
      <div v-else-if="activeTab === 'practice'" class="space-y-3">
        <div v-if="practiceHistory.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div class="mb-3 flex justify-center"><FileText :size="48" class="text-slate-300" /></div>
          <p class="text-slate-500">Hali mashq qilmadingiz</p>
          <RouterLink to="/practice"
            class="mt-4 inline-block px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">Mashq boshlash
            →</RouterLink>
        </div>
        <div v-for="item in practiceHistory" :key="item.id"
          class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-sm font-black text-slate-900">{{ item.topic }}</span>
              <p class="text-xs text-slate-400">{{ item.question_count }} savol</p>
            </div>
            <span :class="item.percent >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'"
              class="text-sm font-black px-3 py-1 rounded-xl">{{ item.percent }}%</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500">
            <span class="flex items-center gap-1"><CheckCircle :size="14" /> {{ item.correct }}/{{ item.question_count }} to'g'ri</span>
            <span class="flex items-center gap-1"><Calendar :size="14" /> {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div :class="item.percent >= 70 ? 'bg-green-500' : 'bg-orange-400'" class="h-2 rounded-full"
              :style="{ width: `${item.percent}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Game history -->
      <div v-else class="space-y-3">
        <div v-if="gameHistory.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div class="mb-3 flex justify-center"><Dices :size="48" class="text-slate-300" /></div>
          <p class="text-slate-500">Hali o'yin o'ynamadingiz</p>
          <RouterLink to="/game"
            class="mt-4 inline-block px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">O'yin boshlash
            →</RouterLink>
        </div>
        <div v-for="item in gameHistory" :key="item.id"
          class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-black text-slate-900">So'z o'yini</span>
              <p class="text-xs text-slate-400">{{ item.pairs }} juft so'z</p>
            </div>
            <span
              class="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">{{ item.time_seconds }}s</span>
          </div>
          <div class="flex gap-4 text-xs text-slate-500 mt-1">
            <span class="flex items-center gap-1"><Target :size="14" /> {{ item.attempts }} urinish</span>
            <span class="flex items-center gap-1"><Calendar :size="14" /> {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
        </div>
      </div>
    </div>
    <OnboardingTooltip pageId="History" title="Tarix" description="O'tgan testlar, mashqlar va o'yinlar natijalari" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FileText, Dices, Calendar, CheckCircle, Target } from '@lucide/vue';
import supabase from '../supabase';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';

const activeTab = ref('quiz');
const loading = ref(false);
const tabs = [
  { id: 'quiz', label: 'Testlar' },
  { id: 'practice', label: 'Mashqlar' },
  { id: 'game', label: 'O\'yinlar' }
];
const quizHistory = ref<any[]>([]);
const practiceHistory = ref<any[]>([]);
const gameHistory = ref<any[]>([]);

onMounted(() => loadTab('quiz'));

const loadTab = async (tab: string) => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { loading.value = false; return; }

  if (tab === 'quiz') {
    const { data } = await supabase.from('test_results')
      .select('*, tests(title, subject)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    quizHistory.value = data || [];
  } else if (tab === 'practice') {
    const { data } = await supabase.from('practice_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    practiceHistory.value = data || [];
  } else {
    const { data } = await supabase.from('game_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    gameHistory.value = data || [];
  }
  loading.value = false;
};
</script>