<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 px-4 pt-6 pb-28 transition-colors">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition">
          <ArrowLeft :size="18" /></RouterLink>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-200 dark:shadow-none">
              <BookOpen :size="18" class="text-white" />
            </span>
            Mashq
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">AI bilan kunlik mashqlar</p>
        </div>
      </div>

      <!-- Topic selector -->
      <div v-if="!session" class="space-y-4">
        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-fade-in-up">
          <h2 class="font-black text-lg text-slate-900 dark:text-white mb-4">Mashq turini tanlang</h2>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <button v-for="t in topics" :key="t.id" @click="selectedTopic = t.id"
              :class="selectedTopic === t.id
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 ring-2 ring-orange-200 dark:ring-orange-500/30 scale-[1.02]'
                : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:border-orange-300'"
              class="p-4 rounded-2xl border-2 text-left transition-all duration-200">
              <div class="mb-1.5 w-9 h-9 rounded-xl flex items-center justify-center"
                :class="selectedTopic === t.id ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300'">
                <component :is="topicIconMap[t.id]" :size="18" />
              </div>
              <p class="font-bold text-sm text-slate-900 dark:text-white">{{ t.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t.desc }}</p>
            </button>
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1">Qo'shimcha mavzu (ixtiyoriy)</label>
            <input v-model="customTopic" placeholder="Masalan: Pythagoras teoremasi"
              class="w-full px-4 py-3 rounded-2xl dark:text-white text-slate-800 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 transition" />
          </div>
          <div class="mt-4">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1">Savol soni</label>
            <div class="flex gap-2">
              <button v-for="n in [5, 10, 15]" :key="n" @click="questionCount = n"
                :class="questionCount === n ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'"
                class="flex-1 py-2 rounded-xl font-bold text-sm transition-all">{{ n }}</button>
            </div>
          </div>
          <Transition name="fade">
            <p v-if="startError" class="mt-3 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <XCircle :size="13" /> {{ startError }}
            </p>
          </Transition>
          <button @click="startPractice" :disabled="loading"
            class="w-full mt-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 transition disabled:opacity-60 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none">
            <template v-if="loading"><Loader :size="16" class="animate-spin" /> AI tayyorlayapti...</template>
            <template v-else><Rocket :size="16" /> Mashqni boshlash</template>
          </button>
        </div>
      </div>

      <!-- Practice session -->
      <div v-else>
        <!-- Progress -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-3 mb-4 flex items-center gap-4 shadow-sm">
          <div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div class="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              :style="{ width: `${(currentIdx / session.length) * 100}%` }"></div>
          </div>
          <span class="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">{{ currentIdx }}/{{ session.length }}</span>
          <span class="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1"><Check :size="14" /> {{ score }}</span>
        </div>

        <!-- Done -->
        <div v-if="currentIdx >= session.length"
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm animate-pop">
          <div class="flex justify-center mb-4">
            <span class="w-20 h-20 rounded-3xl flex items-center justify-center animate-bounce-slow"
              :class="percentNum >= 70 ? 'bg-yellow-50 dark:bg-yellow-500/10' : 'bg-orange-50 dark:bg-orange-500/10'">
              <Star v-if="percentNum >= 70" :size="44" class="text-yellow-500" />
              <ThumbsUp v-else :size="44" class="text-orange-500" />
            </span>
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Mashq yakunlandi!</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-2">{{ score }}/{{ session.length }} to'g'ri javob</p>
          <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 mt-4 overflow-hidden">
            <div :class="percentNum >= 70 ? 'bg-green-500' : 'bg-orange-400'" class="h-4 rounded-full transition-all duration-1000"
              :style="{ width: `${percentNum}%` }"></div>
          </div>
          <div class="flex items-center justify-center gap-3 mt-4">
            <p class="text-lg font-bold" :class="percentNum >= 70 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'">{{ percentNum }}%</p>
            <span v-if="earnedCoins > 0" class="text-sm font-black text-orange-500 bg-orange-50 dark:bg-orange-500/15 px-3 py-1 rounded-xl flex items-center gap-1">
              <Coins :size="14" /> +{{ earnedCoins }} tanga
            </span>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="restartPractice"
              class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 active:scale-95 transition flex items-center justify-center gap-1.5">
              <RotateCcw :size="15" /> Qayta
            </button>
            <button @click="session = null"
              class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
              Bosh sahifa
            </button>
          </div>
        </div>

        <!-- Question -->
        <div v-else-if="current" class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">Savol {{ currentIdx + 1 }} / {{ session.length }}</p>
          <p class="text-lg font-black text-slate-900 dark:text-white mb-6 leading-snug">{{ current.question }}</p>
          <div class="space-y-3">
            <button v-for="opt in current.options" :key="opt" @click="selectAnswer(opt)" :disabled="!!selected" :class="{
              'border-green-400 bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300': selected && opt === current.answer,
              'border-red-400 bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-300': selected === opt && opt !== current.answer,
              'border-slate-200 dark:border-slate-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-slate-800 dark:text-slate-100': !selected,
            }"
              class="w-full px-5 py-3 rounded-2xl border-2 text-left font-semibold text-sm transition disabled:cursor-default">
              {{ opt }}
            </button>
          </div>
          <div v-if="selected" class="mt-4 animate-fade-in-up">
            <p class="text-sm font-semibold" :class="selected === current.answer ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
              <template v-if="selected === current.answer"><CheckCircle :size="16" class="inline text-green-600 mr-1" /> Barakalla! To'g'ri!</template>
              <template v-else><XCircle :size="16" class="inline text-red-500 mr-1" /> Noto'g'ri. To'g'ri javob: {{ current.answer }}</template>
            </p>
            <p v-if="current.explanation" class="text-xs text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">{{ current.explanation }}</p>
            <button @click="nextQuestion"
              class="mt-3 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 active:scale-95 transition">
              <template v-if="currentIdx + 1 >= session.length"><Flag :size="16" class="inline mr-1" /> Yakunla</template>
              <template v-else>Keyingi <ArrowRight :size="15" class="inline-block" /></template>
            </button>
          </div>
        </div>
      </div>
    </div>
    <OnboardingTooltip pageId="Practice" title="Mashqlar" description="AI yordamida fan bo'yicha mashqlar yeching" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { BookOpen, Hash, FlaskConical, ScrollText, Globe, Loader, Rocket, Star, ThumbsUp, Flag, CheckCircle, XCircle, ArrowLeft, ArrowRight, Check, RotateCcw, Coins } from '@lucide/vue';
import supabase from '../supabase';
import { askAIJson } from '../lib/ai';
import { useCoinStore } from '../stores/CoinStore';
import { saveNotification } from '../lib/Notification';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
const coinStore = useCoinStore();

const topicIconMap: Record<string, any> = {
  math: Hash,
  english: Globe,
  science: FlaskConical,
  history: ScrollText,
  geography: Globe,
  uzbek: Globe,
};

const topics = [
  { id: 'math', name: 'Matematika', desc: 'Algebra, geometriya' },
  { id: 'english', name: 'Ingliz tili', desc: 'Grammar, vocabulary' },
  { id: 'science', name: 'Fan', desc: 'Fizika, kimyo, biologiya' },
  { id: 'history', name: 'Tarix', desc: "O'zbekiston va dunyo tarixi" },
  { id: 'geography', name: 'Geografiya', desc: 'Mamlakatlar, poytaxtlar' },
  { id: 'uzbek', name: "O'zbek tili", desc: 'Grammatika, imlo' },
];

interface Question { question: string; options: string[]; answer: string; explanation?: string; }

const selectedTopic = ref('math'); const customTopic = ref(''); const questionCount = ref(5);
const loading = ref(false); const session = ref<Question[] | null>(null);
const currentIdx = ref(0); const score = ref(0); const selected = ref('');
const activeTopic = ref('');
const current = computed(() => session.value?.[currentIdx.value]);
const percentNum = computed(() =>
  session.value ? Math.round((score.value / session.value.length) * 100) : 0,
);
// Mukofot: har to'g'ri javob +2 tanga
const earnedCoins = ref(0);

const startError = ref('');

const startPractice = async () => {
  startError.value = '';
  loading.value = true;
  const topicName = topics.find(t => t.id === selectedTopic.value)?.name || selectedTopic.value;
  const topic = customTopic.value || topicName;
  activeTopic.value = topic;

  const result = await askAIJson<Question[]>(
    `Generate ${questionCount.value} multiple choice questions about "${topic}".
Return ONLY a JSON array, no other text:
[
  {
    "question": "Question text here?",
    "options": ["First option", "Second option", "Third option", "Fourth option"],
    "answer": "First option",
    "explanation": "Brief explanation"
  }
]
IMPORTANT: "answer" must be exactly identical to one of the "options" values.`,
    []
  );

  if (result && result.length) {
    session.value = result;
    currentIdx.value = 0; score.value = 0; selected.value = ''; earnedCoins.value = 0;
  } else {
    startError.value = "Mashq yaratishda xatolik. Qayta urinib ko'ring.";
  }
  loading.value = false;
};
const selectAnswer = (opt: string) => {
  if (selected.value) return;
  selected.value = opt;
  if (current.value && opt === current.value.answer) score.value++;
};

const savePractice = async () => {
  if (!session.value) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const percent = percentNum.value;
  await supabase.from('practice_results').insert({
    user_id: user.id,
    topic: activeTopic.value,
    correct: score.value,
    question_count: session.value.length,
    percent,
  });
  await coinStore.fetchCoins();
  await coinStore.addProgress(percent);

  // Tanga mukofoti: har to'g'ri javob +2
  earnedCoins.value = score.value * 2;
  if (earnedCoins.value > 0) await coinStore.addCoins(earnedCoins.value);

  await saveNotification(
    user.id,
    'Mashq yakunlandi!',
    `${activeTopic.value} — ${percent}% natija`,
    'FileText', `+${percent}%`, 'bg-green-50', 'text-green-500', 'bg-green-50 text-green-600'
  );
};

const nextQuestion = async () => {
  currentIdx.value++;
  selected.value = '';
  if (session.value && currentIdx.value >= session.value.length) {
    await savePractice();
  }
};

const restartPractice = () => { currentIdx.value = 0; score.value = 0; selected.value = ''; earnedCoins.value = 0; };
</script>
