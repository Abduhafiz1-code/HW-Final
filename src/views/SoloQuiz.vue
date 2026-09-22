<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <QuizPageHeader
        title="Yolg'iz Quiz"
        subtitle="AI bilan o'z testingni yech"
        :icon="Brain"
        icon-bg-class="bg-gradient-to-br from-indigo-400 to-indigo-600"
        back-to="/" />

      <!-- Setup -->
      <div
        v-if="!session"
        class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
        <div>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2"
            >Fan</label
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in subjects"
              :key="s.id"
              @click="selectSubject(s.id)"
              :class="
                selectedSubject === s.id
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-100 dark:ring-orange-900'
                  : 'border-slate-200 dark:border-slate-600 hover:border-orange-200'
              "
              class="p-3 rounded-2xl border-2 text-left transition-all active:scale-[0.98]">
              <component
                :is="subjectIconMap[s.id]"
                :size="22"
                class="mb-1"
                :class="
                  selectedSubject === s.id
                    ? 'text-orange-500'
                    : 'text-slate-400 dark:text-slate-500'
                " />
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {{ s.name }}
              </p>
            </button>
          </div>
        </div>

        <div>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2"
            >Yo'nalish</label
          >
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="topic in currentTopics"
              :key="topic"
              @click="selectedTopic = topic"
              :class="
                selectedTopic === topic
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-100 dark:shadow-none'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              "
              class="px-3 py-2 rounded-xl font-bold text-xs transition-all">
              {{ topic }}
            </button>
          </div>
        </div>

        <!-- Xato xabari (alert o'rniga chiroyli inline) -->
        <Transition name="slide-down">
          <div
            v-if="startError"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl px-4 py-3 text-sm text-red-600 dark:text-red-300 font-bold flex items-center gap-2 animate-pop">
            <XCircle :size="16" class="flex-shrink-0" /> {{ startError }}
          </div>
        </Transition>
        <div>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2"
            >Daraja</label
          >
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="l in levels"
              :key="l"
              @click="selectedLevel = l"
              :class="
                selectedLevel === l
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none scale-[1.03]'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              "
              class="px-4 py-2 rounded-xl font-bold text-sm transition-all">
              {{ l }}
            </button>
          </div>
        </div>
        <div>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2"
            >Savol soni</label
          >
          <div class="flex gap-2">
            <button
              v-for="n in [5, 10, 15]"
              :key="n"
              @click="questionCount = n"
              :class="
                questionCount === n
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-100 dark:shadow-none scale-[1.03]'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              "
              class="flex-1 py-2 rounded-xl font-bold text-sm transition-all">
              {{ n }}
            </button>
          </div>
        </div>
        <div
          class="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl px-4 py-3 text-xs text-indigo-600 dark:text-indigo-300 font-semibold flex items-center gap-2">
          <Lightbulb :size="14" /> Endi savollarda ochiq savollar ham bo'ladi —
          javobni o'zingiz yozasiz!
        </div>
        <!-- Adaptiv qiyinlik ko'rsatkichi -->
        <div
          v-if="adaptiveLabel"
          class="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl px-4 py-3 text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-2">
          <Zap :size="14" class="text-orange-500" /> {{ adaptiveLabel }}
        </div>
        <button
          @click="startQuiz"
          :disabled="loading"
          class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 transition disabled:opacity-60 active:scale-[0.98] shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2">
          <template v-if="loading"
            ><Loader :size="16" class="animate-spin" />
            Tayyorlanmoqda...</template
          >
          <template v-else><Rocket :size="16" /> Boshlash</template>
        </button>
      </div>

      <!-- Loading skeleton (AI savol yaratish payti) -->
      <QuizSkeleton v-else-if="loading" />

      <!-- Quiz -->
      <div v-else>
        <QuizProgressBar
          :current="currentIdx"
          :total="session.length"
          tone="orange" />

        <!-- Finished: result + review -->
        <!-- Animatsiyali tabrik ekrani: sahifa darajasida, kartaning ichida EMAS
             (kartaning default sloti <p> ichida — div uyasi noto'g'ri bo'lmasligi uchun) -->
        <CelebrationOverlay
          v-if="currentIdx >= session.length"
          :show="!celebrationDismissed"
          :variant="percent >= 50 ? 'win' : 'lose'"
          :title="finishTitle"
          :subtitle="`${score}/${session.length} to'g'ri javob berdingiz`"
          :count-up-to="percent"
          count-suffix="%"
          :stats="celebrationStats"
          :share-text="`Men Yolg'iz Quiz'da ${percent}% natija oldim! (${score}/${session.length} to'g'ri) Sen ham sinab ko'r! 🎯`"
          primary-label="Sharhni ko\'rish"
          secondary-label="Bosh menyu"
          @primary="celebrationDismissed = true"
          @secondary="$router.push('/')" />

        <div v-if="currentIdx >= session.length" class="space-y-4">
          <QuizResultCard
            :percent="percent"
            :detail="`${score}/${session.length} to'g'ri javob`"
            :trophy="percent >= 70">
            {{ score }}/{{ session.length }} to'g'ri
            <template #extra>
              <div v-if="saving" class="mt-3 text-xs text-slate-400">
                <Loader :size="12" class="inline animate-spin mr-1" />
                Saqlanmoqda...
              </div>
              <div v-else class="mt-3 text-xs text-green-500">
                <CheckCircle :size="12" class="inline mr-1" /> Natija saqlandi!
              </div>
            </template>
          </QuizResultCard>

          <!-- Javoblar sharhi -->
          <div
            class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm text-left space-y-2">
            <p
              class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Javoblaringiz
            </p>
            <div
              v-for="(a, i) in answerLog"
              :key="i"
              class="rounded-2xl border p-3 text-sm"
              :class="
                a.isCorrect
                  ? 'border-green-200 bg-green-50/60 dark:bg-green-900/10 dark:border-green-800'
                  : 'border-red-200 bg-red-50/60 dark:bg-red-900/10 dark:border-red-800'
              ">
              <p class="font-bold text-slate-800 dark:text-slate-100">
                {{ i + 1 }}. {{ a.q.question }}
              </p>
              <p
                class="text-xs mt-1"
                :class="
                  a.isCorrect
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                ">
                Sizning javobingiz: {{ a.given || "—" }}
                {{ a.isCorrect ? "✓" : "✗" }}
              </p>
              <p
                v-if="!a.isCorrect"
                class="text-xs text-slate-500 dark:text-slate-400">
                To'g'ri javob: {{ a.q.answer }}
              </p>
              <p v-if="a.q.explanation" class="text-xs text-slate-400 mt-1">
                {{ a.q.explanation }}
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="session = null"
              class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition active:scale-[0.98]">
              Qayta
            </button>
            <RouterLink
              to="/"
              class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-center hover:bg-slate-200 dark:hover:bg-slate-600 transition">
              Home
            </RouterLink>
          </div>
        </div>

        <!-- Question -->
        <div
          v-else-if="hasCurrent"
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <p
              class="text-xs font-bold uppercase tracking-wider text-orange-500">
              Savol {{ currentIdx + 1 }} • {{ selectedLevel }}
            </p>
            <span
              v-if="cur.type === 'open'"
              class="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <PenLine :size="11" /> OCHIQ SAVOL
            </span>
          </div>
          <p class="text-lg font-black text-slate-900 dark:text-white mb-6">
            {{ cur.question }}
          </p>

          <!-- MCQ -->
          <div v-if="cur.type !== 'open'" class="space-y-2.5">
            <template v-for="(opt, i) in cur.options" :key="opt">
              <QuizOptionButton
                v-if="!hiddenOptions.includes(opt)"
                :option="opt"
                :letter="cur.options.length <= 4 ? LETTERS[i] : undefined"
                :disabled="!!selected"
                :state="optionState(opt)"
                @select="selectAnswer" />
            </template>
          </div>

          <!-- 💡 Yordam: 50:50 (15 tanga) va Skip (10 tanga) -->
          <div v-if="!selected" class="flex gap-2 mt-4">
            <button
              v-if="cur.type !== 'open' && !hintUsed"
              @click="use5050"
              :disabled="
                coinStore.coins < HINT_COST || hiddenOptions.length > 0
              "
              class="flex-1 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-black hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
              <Lightbulb :size="14" /> 50:50 ({{ HINT_COST }} tanga)
            </button>
            <button
              @click="skipQuestion"
              :disabled="coinStore.coins < SKIP_COST"
              class="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
              <SkipForward :size="14" /> Skip ({{ SKIP_COST }} tanga)
            </button>
            <span
              class="flex items-center gap-1 text-xs font-black text-orange-500 px-1 flex-shrink-0">
              <Coins :size="13" /> {{ coinStore.coins }}
            </span>
          </div>
          <p
            v-if="hintMsg"
            class="text-[11px] font-bold mt-2"
            :class="hintMsg.ok ? 'text-green-600' : 'text-red-500'">
            {{ hintMsg.text }}
          </p>

          <!-- Open (yozma javob) -->
          <QuizOpenAnswer
            v-else
            ref="openInput"
            v-model="openAnswer"
            @submit="submitOpen"
            :disabled="!!selected"
            :state="
              selected ? (lastOpenCorrect ? 'correct' : 'wrong') : 'idle'
            " />

          <div v-if="selected" class="mt-4">
            <p
              class="text-sm font-bold"
              :class="
                lastOpenCorrect || selected === cur.answer
                  ? 'text-green-600'
                  : 'text-red-500'
              ">
              <template v-if="lastOpenCorrect || selected === cur.answer"
                ><CheckCircle :size="16" class="inline text-green-600 mr-1" />
                To'g'ri!</template
              >
              <template v-else
                ><XCircle :size="16" class="inline text-red-500 mr-1" /> To'g'ri
                javob: {{ cur.answer }}</template
              >
            </p>
            <p
              v-if="cur.explanation"
              class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ cur.explanation }}
            </p>
            <button
              @click="nextQ"
              class="mt-3 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition active:scale-95 shadow-md shadow-orange-100 dark:shadow-none">
              <template v-if="currentIdx + 1 >= session.length"
                ><Flag :size="16" class="inline mr-1" /> Yakunla</template
              >
              <template v-else
                >Keyingi <ArrowRight :size="15" class="inline-block"
              /></template>
            </button>
          </div>
        </div>
      </div>
    </div>
    <OnboardingTooltip
      pageId="SoloQuiz"
      title="Yolg'iz Test"
      description="Mustaqil test yeching va natijangizni ko'ring" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import {
  Brain,
  Hash,
  FlaskConical,
  ScrollText,
  Globe,
  Loader,
  Rocket,
  Flag,
  CheckCircle,
  XCircle,
  ArrowRight,
  PenLine,
  Lightbulb,
  Zap,
  SkipForward,
  Coins,
  Code2,
} from "@lucide/vue";
import supabase from "../supabase";
import { useCoinStore } from "../stores/CoinStore";
import { askAIJson } from "../lib/ai";
import {
  normalizeQuestionList,
  isOpenCorrect,
  mixedQuestionsPrompt,
  type NormalizedQuestion,
} from "../lib/question";
import {
  nextAdaptiveLevel,
  adaptiveDifficultyClause,
  recordAdaptiveAttempt,
  adaptiveStats,
} from "../lib/adaptive";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";
import QuizPageHeader from "../components/quiz/QuizPageHeader.vue";
import QuizProgressBar from "../components/quiz/QuizProgressBar.vue";
import QuizOptionButton from "../components/quiz/QuizOptionButton.vue";
import QuizOpenAnswer from "../components/quiz/QuizOpenAnswer.vue";
import QuizResultCard from "../components/quiz/QuizResultCard.vue";
import QuizSkeleton from "../components/quiz/QuizSkeleton.vue";
import CelebrationOverlay from "../components/CelebrationOverlay.vue";
import { playDing, playBuzz } from "../lib/sound";
import { useAuthStore } from "../stores/AuthStore";

const LETTERS = ["A", "B", "C", "D"];
const authStore = useAuthStore();
const coinStore = useCoinStore();
const celebrationDismissed = ref(false);
const finishTitle = computed(() =>
  percent.value >= 90
    ? "Zo'r natija!"
    : percent.value >= 70
      ? "Ajoyib! 🎉"
      : percent.value >= 50
        ? "Yaxshi ish!"
        : "Keyingi safar champing! 💪",
);
// Har to'g'ri javob = +5 tanga (test yakunida beriladi)
const earnedCoins = computed(() => score.value * 5);
const celebrationStats = computed(() => [
  { label: "To'g'ri", value: score.value, colorClass: "text-green-600" },
  {
    label: "Savol",
    value: session.value?.length ?? 0,
    colorClass: "text-indigo-600",
  },
  {
    label: "Tanga",
    value: `+${earnedCoins.value}`,
    colorClass: "text-orange-500",
  },
]);

const subjectIconMap: Record<string, any> = {
  math: Hash,
  english: Globe,
  science: FlaskConical,
  history: ScrollText,
  geography: Globe,
  uzbek: Globe,
  programming: Code2,
};

const subjects = [
  { id: "math", name: "Matematika" },
  { id: "english", name: "Ingliz tili" },
  { id: "science", name: "Fanlar" },
  { id: "history", name: "Tarix" },
  { id: "geography", name: "Geografiya" },
  { id: "uzbek", name: "O'zbek tili" },
  { id: "programming", name: "Dasturlash" },
];
const subjectTopics: Record<string, string[]> = {
  math: ["Aralash", "Algebra", "Geometriya", "Kasrlar va foizlar"],
  english: ["Aralash", "Grammar", "Vocabulary", "Speaking"],
  science: ["Aralash", "Fizika", "Kimyo", "Biologiya"],
  history: ["Aralash", "O'zbekiston tarixi", "Jahon tarixi", "Amir Temur"],
  geography: [
    "Aralash",
    "Materiklar",
    "Davlatlar va poytaxtlar",
    "Tabiiy geografiya",
  ],
  uzbek: ["Aralash", "Grammatika", "Adabiyot", "So'z boyligi"],
  programming: [
    "Aralash",
    "Vue.js",
    "Python",
    "JavaScript",
    "HTML va CSS",
    "Algoritmlar",
  ],
};
const levels = ["A1", "A2", "B1", "B2", "C1"];

const selectedSubject = ref("math");
const selectedTopic = ref(subjectTopics.math[0]);
const currentTopics = computed(
  () => subjectTopics[selectedSubject.value] ?? ["Aralash"],
);

const selectSubject = (subjectId: string) => {
  selectedSubject.value = subjectId;
  selectedTopic.value = subjectTopics[subjectId]?.[0] ?? "Aralash";
};

const selectedLevel = ref("A1");
const questionCount = ref(5);
const loading = ref(false);
const saving = ref(false);
const session = ref<NormalizedQuestion[] | null>(null);
const currentIdx = ref(0);
const score = ref(0);
const selected = ref("");
const openAnswer = ref("");
const lastOpenCorrect = ref(false);
const openInput = ref<InstanceType<typeof QuizOpenAnswer> | null>(null);

// Har bir javob yozib boriladi — oxirida sharh sifatida ko'rsatiladi
interface AnswerLogEntry {
  q: NormalizedQuestion;
  given: string;
  isCorrect: boolean;
}
const answerLog = ref<AnswerLogEntry[]>([]);

const current = computed(
  () => session.value?.[currentIdx.value] as NormalizedQuestion | undefined,
);
// Template'da `current` optional bo'lgani uchun TS shikoyat qilmasligi uchun
// savol ekrani faqat current mavjud bo'lganda ko'rsatiladi (v-else-if zanjiri).
const hasCurrent = computed(() => !!current.value);
const cur = computed(() => current.value as NormalizedQuestion);
const percent = computed(() =>
  session.value ? Math.round((score.value / session.value.length) * 100) : 0,
);

// Variant tugmalarining holati: to'g'ri/noto'g'ri/tanlangan/bo'sh
const optionState = (
  opt: string,
): "idle" | "selected" | "correct" | "wrong" => {
  if (!selected.value) return "idle";
  if (opt === cur.value.answer) return "correct";
  if (opt === selected.value) return "wrong";
  return "idle";
};

const startError = ref("");

// Adaptiv qiyinlik: bir xil test yecha versа keyingisi qiyinlashadi
const adaptiveInfo = computed(() =>
  adaptiveStats(selectedSubject.value, selectedLevel.value),
);
const adaptiveLabel = computed(() => {
  const a = adaptiveInfo.value;
  if (a.attempts === 0) return "";
  const eff = nextAdaptiveLevel(selectedSubject.value, selectedLevel.value);
  return `🔥 Siz bu mavzuda ${a.attempts} bor yechdingiz — endi ${eff} darajasi savollar!`;
});

const startQuiz = async () => {
  startError.value = "";
  loading.value = true;
  const subjectName =
    subjects.find((s) => s.id === selectedSubject.value)?.name || "";
  try {
    const effLevel = nextAdaptiveLevel(
      selectedSubject.value,
      selectedLevel.value,
    );
    const adaptiveClause = adaptiveDifficultyClause(
      selectedSubject.value,
      selectedLevel.value,
    );
    const topicInstruction =
      selectedTopic.value === "Aralash"
        ? "tanlangan fan doirasida turli mavzularni aralashtir"
        : `faqat ${selectedTopic.value} yo'nalishidan savollar ber`;
    const raw = await askAIJson<any[]>(
      `${subjectName} fanidan ${selectedTopic.value} yo'nalishida ${effLevel} darajasida ${questionCount.value} ta savol yarat; ${topicInstruction}. Mavzuga qarab til tanla va foydalanuvchi so'ragan darajadan bir oz kuchliroq darajadagi savollar ber. ${adaptiveClause} ${mixedQuestionsPrompt(`${subjectName} — ${selectedTopic.value}`, questionCount.value).split(". ").slice(1).join(". ")}`,
      [],
    );
    const normalized = normalizeQuestionList(raw).slice(0, questionCount.value);
    if (!normalized.length) throw new Error("empty");
    session.value = normalized;
    currentIdx.value = 0;
    score.value = 0;
    selected.value = "";
    openAnswer.value = "";
    lastOpenCorrect.value = false;
    answerLog.value = [];
  } catch {
    startError.value =
      "Savollar yaratishda xatolik bo'ldi. Internetni tekshirib, qayta urinib ko'ring.";
  }
  loading.value = false;
};

const selectAnswer = (opt: string) => {
  if (selected.value) return;
  selected.value = opt;
  const isCorrect = !!current.value && opt === current.value.answer;
  if (isCorrect) score.value++;
  // 🔊 Ovozli feedback: to'g'ri = ding, xato = buzz
  if (isCorrect) playDing();
  else playBuzz();
  if (current.value)
    answerLog.value.push({ q: current.value, given: opt, isCorrect });
};

// ── 💡 Tanga bilan yordam: 50:50 va Skip ──────────────────────
const HINT_COST = 15;
const SKIP_COST = 10;
const hiddenOptions = ref<string[]>([]);
const hintUsed = ref(false);
const hintMsg = ref<{ text: string; ok: boolean } | null>(null);

// 50:50: ikki noto'g'ri variantni yashiradi (to'g'ri + 1 noto'g'ri qoladi)
const use5050 = async () => {
  if (hintUsed.value || !current.value || current.value.type === "open") return;
  hintMsg.value = null;
  const ok = await coinStore.spendCoins(HINT_COST);
  if (!ok) {
    hintMsg.value = {
      text: `Tanga yetmadi — ${HINT_COST} tanga kerak`,
      ok: false,
    };
    return;
  }
  const cur = current.value;
  if (!cur) return;
  const wrong = cur.options.filter((o: string) => o !== cur.answer);
  // tasodifiy 2 ta noto'g'risini yashiramiz (agar 4 variant bo'lsa)
  const toHide = wrong
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(1, wrong.length - 1));
  hiddenOptions.value = toHide;
  hintUsed.value = true;
  hintMsg.value = { text: "Ikki noto'g'ri variant olib tashlandi!", ok: true };
};

// Skip: savolni to'g'ri hisoblanmagan holda o'tkazib yuboradi (ball yechilmaydi)
const skipQuestion = async () => {
  if (selected.value || !current.value) return;
  hintMsg.value = null;
  const ok = await coinStore.spendCoins(SKIP_COST);
  if (!ok) {
    hintMsg.value = {
      text: `Tanga yetmadi — ${SKIP_COST} tanga kerak`,
      ok: false,
    };
    return;
  }
  // javob belgilanmagan holda keyingi savolga o'tamiz (score o'zgarmaydi)
  answerLog.value.push({ q: current.value, given: "", isCorrect: false });
  selected.value = "__skipped__";
  nextQ();
};

const submitOpen = () => {
  if (selected.value || !current.value) return;
  const given = openAnswer.value.trim();
  if (!given) return;
  const isCorrect = isOpenCorrect(
    given,
    current.value.teacher_answer ?? current.value.answer,
  );
  lastOpenCorrect.value = isCorrect;
  selected.value = given;
  if (isCorrect) score.value++;
  answerLog.value.push({ q: current.value, given, isCorrect });
};

const nextQ = async () => {
  if (currentIdx.value + 1 >= (session.value?.length || 0)) {
    currentIdx.value++;
    await saveResult();
  } else {
    currentIdx.value++;
    selected.value = "";
    openAnswer.value = "";
    lastOpenCorrect.value = false;
    // Hint holatini yangi savolga resetlaymiz
    hiddenOptions.value = [];
    hintUsed.value = false;
    hintMsg.value = null;
    if (current.value?.type === "open") {
      await nextTick();
      openInput.value?.focus();
    }
  }
};

const saveResult = async () => {
  if (!session.value) return;
  saving.value = true;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: resultError } = await supabase
      .from("practice_results")
      .insert({
        user_id: user.id,
        topic: `${subjects.find((s) => s.id === selectedSubject.value)?.name} — ${selectedTopic.value} — ${selectedLevel.value}`,
        correct: score.value,
        question_count: session.value.length,
        percent: percent.value,
        mode: "solo", // AI bergan test — statistikada "solo" sifatida ko'rinadi
      });
    if (resultError) console.error("Natijani saqlashda xatolik:", resultError);

    // Natija oynasi saqlashdagi vaqtinchalik xatolar sabab buzilmasligi kerak.
    const premiumBonus = (authStore.isPremium ? 2 : 1) * earnedCoins.value;
    if (premiumBonus > 0) await coinStore.addCoins(premiumBonus);
    await coinStore.fetchCoins();
    await coinStore.addProgress(percent.value * (authStore.isPremium ? 2 : 1));
    recordAdaptiveAttempt(
      selectedSubject.value,
      selectedLevel.value,
      percent.value,
    );
  } catch (error) {
    console.error("Test yakunlanishida xatolik:", error);
  } finally {
    saving.value = false;
  }
};
</script>
