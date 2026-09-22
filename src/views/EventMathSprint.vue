<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28">
    <div class="max-w-lg mx-auto px-4 md:px-8 py-4">
      <div class="flex items-center gap-3 pt-8 pb-4">
        <button @click="router.push('/events')"
          class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 active:scale-95 transition">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white">Tezkor Matematika Sprinti</h1>
          <p class="text-xs text-slate-400 font-semibold">90 soniyada imkon qadar ko'p savolga to'g'ri javob bering</p>
        </div>
      </div>

      <!-- Bajarilgan -->
      <div v-if="eventId && store.myParticipation[eventId]?.reward_claimed"
        class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center flex flex-col items-center gap-3 animate-fade-in-up">
        <CheckCircle2 :size="40" class="text-green-500" />
        <h2 class="font-black text-slate-900 dark:text-white">Bu event allaqachon bajarilgan</h2>
        <p class="text-sm text-slate-400">Natijangiz: <span class="font-black text-slate-600 dark:text-slate-300">{{ store.myParticipation[eventId]?.score_percent }}%</span></p>
        <RouterLink to="/events" class="mt-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm px-5 py-2.5 rounded-xl">
          Event'larga qaytish
        </RouterLink>
      </div>

      <!-- Natija -->
      <div v-else-if="finished" class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center flex flex-col items-center gap-3 animate-fade-in-up">
        <component :is="percent >= 40 ? Trophy : RotateCcw" :size="40" :class="percent >= 40 ? 'text-amber-400' : 'text-slate-300'" />
        <h2 class="font-black text-slate-900 dark:text-white text-lg">Natijangiz: {{ percent }}%</h2>
        <p class="text-xs text-slate-400">{{ correctCount }} / {{ answeredCount }} to'g'ri</p>

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

      <!-- Tayyorgarlik -->
      <div v-else-if="!started" class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center animate-fade-in-up">
        <Timer :size="48" class="text-orange-500 mx-auto mb-3" />
        <h2 class="font-black text-slate-900 dark:text-white text-lg">90 soniya tayyor</h2>
        <p class="text-sm text-slate-400 mt-2">Har savolga 4 ta variant. Vaqt tugaganda yoki 20 savol tugasa — sprint yakunlanadi. Ochiq savollar yo'q, tezlik muhim!</p>
        <button @click="start"
          class="mt-5 w-full bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white font-black text-sm px-6 py-3 rounded-2xl">
          Sprintni boshlash
        </button>
      </div>

      <!-- Sprint -->
      <div v-else class="flex flex-col gap-4 animate-fade-in-up">
        <div class="flex items-center justify-between text-xs font-bold">
          <span class="text-slate-400">{{ currentIndex + 1 }} / {{ MATH_SPRINT.length }}</span>
          <span class="flex items-center gap-1 text-orange-500"><Timer :size="13" /> {{ timeLeft }}s</span>
          <span class="text-green-600">{{ correctCount }} to'g'ri</span>
        </div>
        <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
          <div class="h-1.5 rounded-full bg-orange-500 transition-all duration-300" :style="{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }" />
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center shadow-sm">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">Hisoblang</p>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">{{ current.question }}</h2>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button v-for="opt in current.options" :key="opt" @click="selectAnswer(opt)" :disabled="selected !== null"
            class="py-4 rounded-2xl border-2 font-black text-lg transition"
            :class="answerClass(opt)">
            {{ opt }}
          </button>
        </div>
      </div>

      <div v-if="!eventId && !started && !finished" class="flex flex-col items-center justify-center py-20 gap-3">
        <CalendarX2 :size="48" class="text-slate-300 dark:text-slate-600" />
        <p class="text-slate-400 font-semibold text-sm">Bu event hozircha faol emas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, CheckCircle2, Trophy, RotateCcw, Gem, Coins, CalendarX2, Timer } from "@lucide/vue";
import { useEventStore } from "../stores/EventStore";
import { getEventTier } from "../lib/eventTiers";
import { MATH_SPRINT } from "../data/newEvents";

const router = useRouter();
const store = useEventStore();
const TIME_LIMIT = 90;

const loading = ref(true);
const eventId = ref<string | null>(null);
const started = ref(false);
const finished = ref(false);
const claimed = ref(false);
const currentIndex = ref(0);
const selected = ref<number | null>(null);
const correctCount = ref(0);
const timeLeft = ref(TIME_LIMIT);
let timerId: number | null = null;

const current = computed(() => MATH_SPRINT[currentIndex.value]);
const answeredCount = computed(() => currentIndex.value + (selected.value !== null ? 1 : 0));
const percent = computed(() =>
  answeredCount.value ? Math.round((correctCount.value / Math.max(answeredCount.value, 1)) * 100) : 0,
);
const tier = computed(() => getEventTier(percent.value));

const answerClass = (opt: number) => {
  if (selected.value === null) return "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-orange-300";
  if (opt === current.value.answer) return "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
  if (opt === selected.value) return "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400";
  return "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400";
};

const start = () => {
  started.value = true;
  finished.value = false;
  currentIndex.value = 0;
  correctCount.value = 0;
  selected.value = null;
  timeLeft.value = TIME_LIMIT;
  timerId = window.setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) finish();
  }, 1000);
};

const selectAnswer = (opt: number) => {
  if (selected.value !== null) return;
  selected.value = opt;
  if (opt === current.value.answer) correctCount.value++;
  setTimeout(() => {
    selected.value = null;
    if (currentIndex.value + 1 >= MATH_SPRINT.length) finish();
    else currentIndex.value++;
  }, 350);
};

const finish = () => {
  if (timerId) { clearInterval(timerId); timerId = null; }
  finished.value = true;
  started.value = false;
};

const restart = () => {
  finished.value = false;
  started.value = false;
};

const claim = async () => {
  if (!eventId.value) return;
  await store.completeEvent(eventId.value, percent.value);
  claimed.value = true;
};

onMounted(async () => {
  await store.fetchEvents();
  eventId.value = store.events.find((e) => e.type === "math_sprint")?.id ?? null;
  if (eventId.value && store.myParticipation[eventId.value]?.reward_claimed) claimed.value = true;
  loading.value = false;
});

onUnmounted(() => { if (timerId) clearInterval(timerId); });
</script>
