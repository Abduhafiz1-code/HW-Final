<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28">
    <div class="max-w-lg mx-auto px-4 md:px-8 py-4">
      <div class="flex items-center gap-3 pt-8 pb-4">
        <button @click="router.push('/events')"
          class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 active:scale-95 transition">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white">So'z yodlash — B1</h1>
          <p class="text-xs text-slate-400 font-semibold">30 ta so'zning tarjimasini toping</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-10 h-10 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin"></div>
      </div>

      <!-- Allaqachon bajarilgan -->
      <div v-else-if="eventId && store.myParticipation[eventId]?.reward_claimed"
        class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center flex flex-col items-center gap-3 animate-fade-in-up">
        <CheckCircle2 :size="40" class="text-green-500" />
        <h2 class="font-black text-slate-900 dark:text-white">Bu event allaqachon bajarilgan</h2>
        <p class="text-sm text-slate-400">Natijangiz: <span class="font-black text-slate-600 dark:text-slate-300">{{ store.myParticipation[eventId]?.score_percent }}%</span></p>
        <RouterLink to="/events" class="mt-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm px-5 py-2.5 rounded-xl">
          Event'larga qaytish
        </RouterLink>
      </div>

      <!-- Natija ekrani -->
      <div v-else-if="finished" class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center flex flex-col items-center gap-3 animate-fade-in-up">
        <component :is="percent >= 40 ? Trophy : RotateCcw" :size="40" :class="percent >= 40 ? 'text-amber-400' : 'text-slate-300'" />
        <h2 class="font-black text-slate-900 dark:text-white text-lg">Natijangiz: {{ percent }}%</h2>
        <p class="text-xs text-slate-400">{{ correctCount }} / {{ VOCAB_B1.length }} to'g'ri javob</p>

        <div v-if="tier" class="flex items-center gap-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl px-4 py-3 mt-2">
          <span class="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-black"><Gem :size="16" /> +{{ tier.diamonds }}</span>
          <span class="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black"><Coins :size="16" /> +{{ tier.coins }}</span>
        </div>
        <p v-else class="text-xs text-orange-500 font-semibold mt-1">Kamida 40% to'g'ri javob berish kerak. Qayta urinib ko'ring!</p>

        <button v-if="tier && !claimed" @click="claim"
          class="mt-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 transition text-white font-black text-sm px-6 py-2.5 rounded-xl">
          Mukofotni olish
        </button>
        <RouterLink v-else-if="claimed" to="/events"
          class="mt-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm px-5 py-2.5 rounded-xl">
          Event'larga qaytish
        </RouterLink>
        <button v-else @click="restart"
          class="mt-2 bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white font-bold text-sm px-5 py-2.5 rounded-xl">
          Qayta urinish
        </button>
      </div>

      <!-- Test jarayoni -->
      <div v-else-if="eventId" class="flex flex-col gap-4 animate-fade-in-up">
        <div class="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>{{ currentIndex + 1 }} / {{ VOCAB_B1.length }}</span>
          <span>{{ correctCount }} to'g'ri</span>
        </div>
        <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
          <div class="h-1.5 rounded-full bg-cyan-500 transition-all duration-300" :style="{ width: `${((currentIndex) / VOCAB_B1.length) * 100}%` }" />
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center shadow-sm">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">Bu so'zning tarjimasi qaysi?</p>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">{{ current.word }}</h2>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <button v-for="opt in shuffledOptions" :key="opt" @click="selectAnswer(opt)" :disabled="selected !== null"
            class="w-full text-left px-4 py-3.5 rounded-2xl border-2 font-bold text-sm transition"
            :class="answerClass(opt)">
            {{ opt }}
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 gap-3">
        <CalendarX2 :size="48" class="text-slate-300 dark:text-slate-600" />
        <p class="text-slate-400 font-semibold text-sm">Bu event hozircha faol emas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, CheckCircle2, Trophy, RotateCcw, Gem, Coins, CalendarX2 } from "@lucide/vue";
import { useEventStore } from "../stores/EventStore";
import { getEventTier } from "../lib/eventTiers";
import { VOCAB_B1 } from "../data/vocabB1";

const router = useRouter();
const store = useEventStore();

const loading = ref(true);
const eventId = ref<string | null>(null);

const currentIndex = ref(0);
const correctCount = ref(0);
const selected = ref<string | null>(null);
const finished = ref(false);
const claimed = ref(false);

const current = computed(() => VOCAB_B1[currentIndex.value]);
const shuffledOptions = ref<string[]>([]);

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

const loadQuestion = () => {
  selected.value = null;
  shuffledOptions.value = shuffle(current.value.options);
};

const selectAnswer = (opt: string) => {
  if (selected.value !== null) return;
  selected.value = opt;
  if (opt === current.value.correct) correctCount.value++;
  setTimeout(() => {
    if (currentIndex.value < VOCAB_B1.length - 1) {
      currentIndex.value++;
      loadQuestion();
    } else {
      finished.value = true;
    }
  }, 550);
};

const answerClass = (opt: string) => {
  if (selected.value === null) return "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-cyan-300";
  const isCorrect = opt === current.value.correct;
  const isSelected = opt === selected.value;
  if (isCorrect) return "border-green-400 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400";
  if (isSelected && !isCorrect) return "border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400";
  return "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 opacity-60";
};

const percent = computed(() => Math.round((correctCount.value / VOCAB_B1.length) * 100));
const tier = computed(() => getEventTier(percent.value));

const claim = async () => {
  if (!eventId.value) return;
  const res = await store.completeEvent(eventId.value, percent.value);
  if (res.ok) claimed.value = true;
};

const restart = () => {
  currentIndex.value = 0;
  correctCount.value = 0;
  finished.value = false;
  claimed.value = false;
  loadQuestion();
};

onMounted(async () => {
  if (!store.events.length) await store.fetchEvents();
  const ev = store.events.find((e) => e.type === "vocab_b1");
  eventId.value = ev?.id ?? null;
  loading.value = false;
  loadQuestion();
});
</script>
