<template>
  <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/" class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">←</RouterLink>
        <div><h1 class="text-xl font-black text-slate-900">📊 Tarix</h1><p class="text-xs text-slate-500">O'tilgan testlar va tarjimalar</p></div>
      </div>

      <div class="flex rounded-2xl bg-white border border-slate-200 p-1 mb-5 shadow-sm">
        <button v-for="t in tabs" :key="t.id" @click="activeTab=t.id; loadTab(t.id)"
          :class="activeTab===t.id?'bg-orange-500 text-white shadow':'text-slate-600'"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition">{{ t.label }}</button>
      </div>

      <div v-if="loading" class="text-center py-16">
        <div class="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-3"></div>
        <p class="text-slate-400 text-sm">Yuklanmoqda...</p>
      </div>

      <!-- Quiz history -->
      <div v-else-if="activeTab==='quiz'" class="space-y-3">
        <div v-if="quizHistory.length===0" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div class="text-5xl mb-3">📋</div>
          <p class="text-slate-500">Hali test yechmadingiz</p>
          <RouterLink to="/student-quiz" class="mt-4 inline-block px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">Test yechish →</RouterLink>
        </div>
        <div v-for="item in quizHistory" :key="item.id" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-sm font-black text-slate-900">{{ item.tests?.title || 'Test' }}</span>
              <p class="text-xs text-slate-400">{{ item.tests?.subject }}</p>
            </div>
            <span :class="item.percent>=70?'bg-green-100 text-green-700':'bg-red-50 text-red-600'" class="text-sm font-black px-3 py-1 rounded-xl">{{ item.percent }}%</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500">
            <span>✅ {{ item.score }}/{{ item.total }} to'g'ri</span>
            <span>📅 {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div :class="item.percent>=70?'bg-green-500':'bg-red-400'" class="h-2 rounded-full" :style="{width:`${item.percent}%`}"></div>
          </div>
        </div>
      </div>

      <!-- Practice history -->
      <div v-else-if="activeTab==='practice'" class="space-y-3">
        <div v-if="practiceHistory.length===0" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div class="text-5xl mb-3">📝</div>
          <p class="text-slate-500">Hali mashq qilmadingiz</p>
          <RouterLink to="/practice" class="mt-4 inline-block px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">Mashq boshlash →</RouterLink>
        </div>
        <div v-for="item in practiceHistory" :key="item.id" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div>
              <span class="text-sm font-black text-slate-900">{{ item.topic }}</span>
              <p class="text-xs text-slate-400">{{ item.question_count }} savol</p>
            </div>
            <span :class="item.percent>=70?'bg-green-100 text-green-700':'bg-red-50 text-red-600'" class="text-sm font-black px-3 py-1 rounded-xl">{{ item.percent }}%</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500">
            <span>✅ {{ item.correct }}/{{ item.question_count }} to'g'ri</span>
            <span>📅 {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div :class="item.percent>=70?'bg-green-500':'bg-orange-400'" class="h-2 rounded-full" :style="{width:`${item.percent}%`}"></div>
          </div>
        </div>
      </div>

      <!-- Game history -->
      <div v-else class="space-y-3">
        <div v-if="gameHistory.length===0" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div class="text-5xl mb-3">🃏</div>
          <p class="text-slate-500">Hali o'yin o'ynamadingiz</p>
          <RouterLink to="/game" class="mt-4 inline-block px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">O'yin boshlash →</RouterLink>
        </div>
        <div v-for="item in gameHistory" :key="item.id" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-black text-slate-900">So'z o'yini</span>
              <p class="text-xs text-slate-400">{{ item.pairs }} juft so'z</p>
            </div>
            <span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">{{ item.time_seconds }}s</span>
          </div>
          <div class="flex gap-4 text-xs text-slate-500 mt-1">
            <span>🎯 {{ item.attempts }} urinish</span>
            <span>📅 {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import supabase from '../supabase';

const activeTab = ref('quiz');
const loading = ref(false);
const tabs = [{id:'quiz',label:'📝 Testlar'},{id:'practice',label:'🧠 Mashqlar'},{id:'game',label:'🃏 O\'yinlar'}];
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
