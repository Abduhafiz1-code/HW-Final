<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 px-4 pt-6 pb-28">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95">
          <ArrowLeft :size="18" />
        </RouterLink>
        <div>
          <h1 class="flex gap-2 items-center text-xl font-black text-slate-900 dark:text-white">
            <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-none">
              <ClipboardList :size="18" class="text-white" />
            </span>
            Tarix
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">O'tilgan testlar, mashqlar va o'yinlar</p>
        </div>
      </div>

      <!-- 📊 Umumiy statistika (testlar tabiga qarab) -->
      <div v-if="activeTab === 'quiz' && allQuiz.length" class="grid grid-cols-3 gap-2.5 mb-4 animate-fade-in-up">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 text-center shadow-sm">
          <p class="text-xl font-black text-slate-900 dark:text-white">{{ quizHistory.length }}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Test</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 text-center shadow-sm">
          <p class="text-xl font-black text-green-500">{{ avgPercent }}%</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">O'rtacha</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 text-center shadow-sm">
          <p class="text-xl font-black text-orange-500">{{ bestPercent }}%</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Eng yaxshi</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 mb-4 shadow-sm">
        <button v-for="t in tabs" :key="t.id" @click="switchTab(t.id)"
          :class="activeTab === t.id ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5">
          <component :is="t.icon" :size="14" />
          {{ t.label }}
        </button>
      </div>

      <!-- 🔍 Qidiruv + filtr (faqat quiz va practice) -->
      <div v-if="activeTab !== 'game' && (allQuiz.length > 5 || practiceHistory.length > 5)" class="flex gap-2 mb-3">
        <div class="relative flex-1">
          <Search :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="searchQuery" type="text" placeholder="Qidirish..."
            class="w-full pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 transition" />
        </div>
        <select v-model="sortMode"
          class="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-orange-400 transition">
          <option value="new">Yangi</option>
          <option value="best">Eng yaxshi</option>
          <option value="worst">Eng zaif</option>
        </select>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Quiz history: AI + ustoz testlari JAMI -->
      <div v-else-if="activeTab === 'quiz'" class="space-y-3">
        <div v-if="allQuiz.length === 0" class="text-center py-14 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div class="flex justify-center mb-3">
            <span class="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <ClipboardList :size="30" class="text-orange-400" />
            </span>
          </div>
          <p class="font-bold text-slate-600 dark:text-slate-300">Hali test yechmadingiz</p>
          <p class="text-xs text-slate-400 mt-1">Birinchi testni yechsangiz, natijalar shu yerda ko'rinadi</p>
          <RouterLink to="/student-quiz"
            class="mt-4 inline-block px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl text-sm shadow-md shadow-orange-200 dark:shadow-none hover:opacity-90 active:scale-95 transition">Test yechish</RouterLink>
        </div>
        <div v-else-if="filteredQuiz.length === 0" class="text-center py-10 text-slate-400 text-sm">
          «{{ searchQuery }}» bo'yicha natija topilmadi
        </div>
        <RouterLink v-for="item in filteredQuiz" :key="item.id" to="/solo-quiz"
          class="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.99]">
          <div class="flex items-center justify-between mb-2">
            <div class="min-w-0">
              <!-- Tur badge: 🤖 AI test / 👨‍🏫 Ustoz testi -->
              <div class="flex items-center gap-1.5 mb-1">
                <span v-if="item.mode === 'solo'"
                  class="text-[10px] font-black bg-indigo-50 dark:bg-indigo-500/15 text-indigo-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Brain :size="10" /> AI test
                </span>
                <span v-else
                  class="text-[10px] font-black bg-orange-50 dark:bg-orange-500/15 text-orange-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <User :size="10" /> Ustoz testi
                </span>
                <!-- Daraja (faqat AI testda) -->
                <span v-if="item.level"
                  class="text-[10px] font-black bg-purple-50 dark:bg-purple-500/15 text-purple-500 px-2 py-0.5 rounded-lg">
                  {{ item.level }}
                </span>
              </div>
              <span class="text-sm font-black text-slate-900 dark:text-white truncate block">{{ item.title || 'Test' }}</span>
              <p class="text-xs text-slate-400">{{ item.subject }}</p>
            </div>
            <span :class="percentClass(item.percent)"
              class="text-sm font-black px-3 py-1 rounded-xl flex-shrink-0 ml-2">{{ item.percent }}%</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1"><CheckCircle :size="14" class="text-green-500" /> {{ item.score }}/{{ item.total }} to'g'ri</span>
            <span class="flex items-center gap-1"><Calendar :size="14" /> {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2.5 overflow-hidden">
            <div :class="item.percent >= 70 ? 'bg-green-500' : item.percent >= 40 ? 'bg-orange-400' : 'bg-red-400'" class="h-2 rounded-full transition-all duration-700"
              :style="{ width: `${item.percent}%` }"></div>
          </div>
        </RouterLink>
      </div>

      <!-- Practice history -->
      <div v-else-if="activeTab === 'practice'" class="space-y-3">
        <div v-if="practiceHistory.length === 0" class="text-center py-14 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div class="flex justify-center mb-3">
            <span class="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <FileText :size="30" class="text-sky-400" />
            </span>
          </div>
          <p class="font-bold text-slate-600 dark:text-slate-300">Hali mashq qilmadingiz</p>
          <p class="text-xs text-slate-400 mt-1">AI sizga mos mashqlar tayyorlaydi</p>
          <RouterLink to="/practice"
            class="mt-4 inline-block px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-md shadow-sky-200 dark:shadow-none hover:opacity-90 active:scale-95 transition">Mashq boshlash</RouterLink>
        </div>
        <div v-else-if="filteredPractice.length === 0" class="text-center py-10 text-slate-400 text-sm">
          «{{ searchQuery }}» bo'yicha natija topilmadi
        </div>
        <div v-for="item in filteredPractice" :key="item.id"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div class="flex items-center justify-between mb-2">
            <div class="min-w-0">
              <span class="text-sm font-black text-slate-900 dark:text-white truncate block">{{ item.topic }}</span>
              <p class="text-xs text-slate-400">{{ item.question_count }} savol</p>
            </div>
            <span :class="percentClass(item.percent)"
              class="text-sm font-black px-3 py-1 rounded-xl flex-shrink-0 ml-2">{{ item.percent }}%</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1"><CheckCircle :size="14" class="text-green-500" /> {{ item.correct }}/{{ item.question_count }} to'g'ri</span>
            <span class="flex items-center gap-1"><Calendar :size="14" /> {{ new Date(item.created_at).toLocaleDateString('uz') }}</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2.5 overflow-hidden">
            <div :class="item.percent >= 70 ? 'bg-green-500' : item.percent >= 40 ? 'bg-orange-400' : 'bg-red-400'" class="h-2 rounded-full transition-all duration-700"
              :style="{ width: `${item.percent}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Game history -->
      <div v-else class="space-y-3">
        <div v-if="gameHistory.length === 0" class="text-center py-14 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div class="flex justify-center mb-3">
            <span class="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Dices :size="30" class="text-indigo-400" />
            </span>
          </div>
          <p class="font-bold text-slate-600 dark:text-slate-300">Hali o'yin o'ynamadingiz</p>
          <p class="text-xs text-slate-400 mt-1">So'z juftliklarini toping — tanga yutib oling!</p>
          <RouterLink to="/game"
            class="mt-4 inline-block px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black rounded-2xl text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:opacity-90 active:scale-95 transition">O'yin boshlash</RouterLink>
        </div>
        <div v-for="item in gameHistory" :key="item.id"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-black text-slate-900 dark:text-white">So'z o'yini</span>
              <p class="text-xs text-slate-400">{{ item.pairs }} juft so'z</p>
            </div>
            <span class="text-xs font-black text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-1 rounded-xl">{{ item.time_seconds }}s</span>
          </div>
          <div class="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
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
import { ref, computed, onMounted } from 'vue';
import { FileText, Dices, Calendar, CheckCircle, Target, Search, ArrowLeft, ClipboardList, BookOpen, Gamepad2, Brain, User } from '@lucide/vue';
import supabase from '../supabase';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';

const activeTab = ref('quiz');
const loading = ref(false);
const searchQuery = ref('');
const sortMode = ref<'new' | 'best' | 'worst'>('new');
const tabs = [
  { id: 'quiz', label: 'Testlar', icon: ClipboardList },
  { id: 'practice', label: 'Mashqlar', icon: BookOpen },
  { id: 'game', label: "O'yinlar", icon: Gamepad2 },
];
const quizHistory = ref<any[]>([]); // ustoz bergan testlar
const soloHistory = ref<any[]>([]); // AI bergan testlar (solo quiz)
const practiceHistory = ref<any[]>([]);
const gameHistory = ref<any[]>([]);

// Testlar tabida ikkala tur JAMI ko'rinadi (AI + ustoz), mode badge bilan
const allQuiz = computed(() => [...quizHistory.value, ...soloHistory.value]);

const avgPercent = computed(() =>
  allQuiz.value.length
    ? Math.round(allQuiz.value.reduce((s, i) => s + (i.percent || 0), 0) / allQuiz.value.length)
    : 0,
);
const bestPercent = computed(() =>
  allQuiz.value.length ? Math.max(...allQuiz.value.map((i) => i.percent || 0)) : 0,
);

const percentClass = (p: number) =>
  p >= 70
    ? 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300'
    : p >= 40
      ? 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300'
      : 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-300';

const sortByMode = (arr: any[], percentKey = 'percent') => {
  const q = searchQuery.value.trim().toLowerCase();
  let list = arr;
  if (q) {
    list = arr.filter((i) =>
      String(i.title || i.topic || i.tests?.title || i.tests?.subject || i.subject || '').toLowerCase().includes(q),
    );
  }
  const sorted = [...list];
  if (sortMode.value === 'best') sorted.sort((a, b) => (b[percentKey] || 0) - (a[percentKey] || 0));
  else if (sortMode.value === 'worst') sorted.sort((a, b) => (a[percentKey] || 0) - (b[percentKey] || 0));
  // 'new' — allaqachon created_at desc
  return sorted;
};

const filteredQuiz = computed(() => sortByMode(allQuiz.value));
const filteredPractice = computed(() => sortByMode(practiceHistory.value));

const switchTab = (tab: string) => {
  activeTab.value = tab;
  searchQuery.value = '';
  sortMode.value = 'new';
  loadTab(tab);
};

onMounted(() => loadTab('quiz'));

const loadTab = async (tab: string) => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { loading.value = false; return; }

  if (tab === 'quiz') {
    // Ikkala jadvalni parallel yuklaymiz: ustoz testlari + AI testlar
    const [teacherRes, soloRes] = await Promise.all([
      supabase.from('test_results')
        .select('*, tests(title, subject)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('practice_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('mode', 'solo')
        .order('created_at', { ascending: false }),
    ]);
    quizHistory.value = (teacherRes.data || []).map((r: any) => ({
      ...r,
      mode: 'teacher',
      title: r.tests?.title || 'Test',
      subject: r.tests?.subject || 'Test',
      level: null as string | null,
    }));
    soloHistory.value = (soloRes.data || []).map((r: any) => {
      const parts = (r.topic || '').split(' — ');
      return {
        ...r,
        mode: 'solo',
        subject: parts[0] || 'AI test',
        title: r.topic || 'AI test',
        level: parts[1] || null, // daraja: "Matematika — B1" → "B1"
      };
    });
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
