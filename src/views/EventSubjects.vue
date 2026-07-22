<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28">
    <div class="max-w-lg mx-auto px-4 md:px-8 py-4">
      <div class="flex items-center gap-3 pt-8 pb-4">
        <button @click="back"
          class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 active:scale-95 transition">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white">Fanlar testi — B2</h1>
          <p class="text-xs text-slate-400 font-semibold">Bitta fanni tanlang va testni yeching</p>
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

      <!-- Fan tanlash -->
      <div v-else-if="!selectedSubject && !finished" class="grid grid-cols-2 gap-3 animate-fade-in-up">
        <button v-for="s in SUBJECTS_B2" :key="s.key" @click="chooseSubject(s)"
          class="bg-white dark:bg-slate-800 rounded-3xl p-5 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <component :is="iconFor(s.icon)" :size="22" class="text-white" />
          </div>
          <p class="font-black text-slate-900 dark:text-white text-sm text-center">{{ s.title }}</p>
          <p class="text-[11px] text-slate-400">{{ s.questions.length }} savol</p>
        </button>
      </div>

      <!-- Natija ekrani -->
      <div v-else-if="finished" class="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center flex flex-col items-center gap-3 animate-fade-in-up">
        <component :is="percent >= 40 ? Trophy : RotateCcw" :size="40" :class="percent >= 40 ? 'text-amber-400' : 'text-slate-300'" />
        <h2 class="font-black text-slate-900 dark:text-white text-lg">Natijangiz: {{ percent }}%</h2>
        <p class="text-xs text-slate-400">{{ selectedSubject?.title }} — {{ correctCount }} / {{ selectedSubject?.questions.length }} to'g'ri</p>

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
      <div v-else class="flex flex-col gap-4 animate-fade-in-up">
        <div class="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>{{ currentIndex + 1 }} / {{ selectedSubject!.questions.length }}</span>
          <span>{{ correctCount }} to'g'ri</span>
        </div>
        <div class="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
          <div class="h-1.5 rounded-full bg-cyan-500 transition-all duration-300" :style="{ width: `${(currentIndex / selectedSubject!.questions.length) * 100}%` }" />
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">{{ selectedSubject!.title }}</p>
          <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ currentQuestion.question }}</h2>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <button v-for="(opt, i) in currentQuestion.options" :key="opt" @click="selectAnswer(i)" :disabled="selected !== null"
            class="w-full text-left px-4 py-3.5 rounded-2xl border-2 font-bold text-sm transition"
            :class="answerClass(i)">
            {{ opt }}
          </button>
        </div>
      </div>
    </div>

    <!-- Fikr bildirish oynasi -->
    <Transition name="modal-pop">
      <div v-if="showFeedback" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" @click.self="closeFeedback">
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
          <h2 class="font-black text-slate-900 dark:text-white mb-1">Fikringiz bizga muhim!</h2>
          <p class="text-xs text-slate-400 mb-4">"Fanlar testi" event'i haqida fikr bildiring</p>

          <div class="flex justify-center gap-2 mb-4">
            <button v-for="n in 5" :key="n" @click="rating = n">
              <Star :size="28" :class="n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'" />
            </button>
          </div>

          <textarea v-model="comment" rows="3" placeholder="Izoh (ixtiyoriy)..."
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"></textarea>

          <div class="flex gap-2 mt-4">
            <button @click="closeFeedback" class="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold text-sm py-2.5 rounded-xl">
              O'tkazib yuborish
            </button>
            <button @click="sendFeedback" :disabled="rating === 0"
              class="flex-1 bg-cyan-500 hover:bg-cyan-600 active:scale-95 transition text-white font-black text-sm py-2.5 rounded-xl disabled:opacity-40">
              Yuborish
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, CheckCircle2, Trophy, RotateCcw, Gem, Coins, Star, Sigma, Languages, Code2, Landmark } from "@lucide/vue";
import { useEventStore } from "../stores/EventStore";
import { getEventTier } from "../lib/eventTiers";
import { SUBJECTS_B2, type Subject } from "../data/subjectsB2";

const router = useRouter();
const store = useEventStore();

const loading = ref(true);
const eventId = ref<string | null>(null);

const selectedSubject = ref<Subject | null>(null);
const currentIndex = ref(0);
const correctCount = ref(0);
const selected = ref<number | null>(null);
const finished = ref(false);
const claimed = ref(false);

const showFeedback = ref(false);
const rating = ref(0);
const comment = ref("");

const iconMap: Record<string, any> = { Sigma, Languages, Code2, Landmark };
const iconFor = (name: string) => iconMap[name] ?? Sigma;

const currentQuestion = computed(() => selectedSubject.value!.questions[currentIndex.value]);

const chooseSubject = (s: Subject) => {
  selectedSubject.value = s;
  currentIndex.value = 0;
  correctCount.value = 0;
  selected.value = null;
  finished.value = false;
};

const selectAnswer = (i: number) => {
  if (selected.value !== null) return;
  selected.value = i;
  if (i === currentQuestion.value.correctIndex) correctCount.value++;
  setTimeout(() => {
    if (currentIndex.value < selectedSubject.value!.questions.length - 1) {
      currentIndex.value++;
      selected.value = null;
    } else {
      finished.value = true;
    }
  }, 550);
};

const answerClass = (i: number) => {
  if (selected.value === null) return "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-cyan-300";
  const isCorrect = i === currentQuestion.value.correctIndex;
  const isSelected = i === selected.value;
  if (isCorrect) return "border-green-400 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400";
  if (isSelected && !isCorrect) return "border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400";
  return "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 opacity-60";
};

const percent = computed(() => Math.round((correctCount.value / (selectedSubject.value?.questions.length || 1)) * 100));
const tier = computed(() => getEventTier(percent.value));

const claim = async () => {
  if (!eventId.value) return;
  const res = await store.completeEvent(eventId.value, percent.value);
  if (res.ok) {
    claimed.value = true;
    showFeedback.value = true;
  }
};

const restart = () => {
  selectedSubject.value = null;
  finished.value = false;
  claimed.value = false;
};

const closeFeedback = () => (showFeedback.value = false);

const sendFeedback = async () => {
  if (!eventId.value || rating.value === 0) return;
  await store.submitFeedback(eventId.value, rating.value, comment.value);
  showFeedback.value = false;
};

const back = () => {
  if (selectedSubject.value && !finished.value) {
    selectedSubject.value = null;
  } else {
    router.push("/events");
  }
};

onMounted(async () => {
  if (!store.events.length) await store.fetchEvents();
  const ev = store.events.find((e) => e.type === "subject_b2");
  eventId.value = ev?.id ?? null;
  loading.value = false;
});
</script>

<style scoped>
.modal-pop-enter-active, .modal-pop-leave-active { transition: opacity 0.18s ease; }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; }
.modal-pop-enter-active > div, .modal-pop-leave-active > div { transition: transform 0.18s ease; }
.modal-pop-enter-from > div, .modal-pop-leave-to > div { transform: scale(0.95); }
</style>
