<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <QuizPageHeader title="Test yechish" subtitle="O'qituvchi kodi bilan kirish" :icon="ClipboardList"
        icon-bg-class="bg-gradient-to-br from-orange-400 to-orange-600" back-to="/" />

      <!-- Code entry -->
      <div v-if="!test && !loading && !blocked">
        <div
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div class="text-center mb-6">
            <div class="mb-3 flex justify-center">
              <span class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
                <Key :size="26" class="text-white" />
              </span>
            </div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white">
              Test kodini kiriting
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              O'qituvchingiz bergan kodni kiriting
            </p>
          </div>
          <input v-model="codeInput" @input="codeInput = codeInput.toUpperCase()" @keyup.enter="findTest" maxlength="4"
            placeholder="AB3X"
            class="w-full text-center text-3xl font-black tracking-[0.5em] px-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/40 transition uppercase mb-4" />
          <p v-if="notFound" class="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2 mb-3">
            <XCircle :size="16" class="inline-block mr-1" /> Bunday kodli test topilmadi
          </p>
          <p v-if="alreadyTaken"
            class="text-amber-600 text-sm text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2 mb-3">
            <AlertTriangle :size="16" class="inline-block mr-1" /> Siz bu testni allaqachon yechgansiz. Takroriy natija
            saqlanmaydi.
          </p>
          <button @click="findTest" :disabled="codeInput.length < 4 || searching"
            class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 transition disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-orange-100 dark:shadow-none">
            <template v-if="searching"><Search :size="16" class="inline-block mr-1" /> Qidirilmoqda...</template>
            <template v-else>Testni topish <ArrowRight :size="15" class="inline-block" /></template>
          </button>
        </div>

        <!-- Recent tests -->
        <div v-if="myResults.length > 0" class="mt-5">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Oxirgi natijalarim
          </p>
          <div v-for="r in myResults" :key="r.id"
            class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-2 shadow-sm flex items-center justify-between card-hover">
            <div class="min-w-0">
              <p class="font-bold text-sm text-slate-900 dark:text-white truncate">
                {{ r.tests?.title }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ r.tests?.subject }} •
                {{ new Date(r.created_at).toLocaleDateString("uz") }}
              </p>
            </div>
            <span :class="r.percent >= 70
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'
              " class="text-sm font-black px-3 py-1 rounded-xl flex-shrink-0 tabular-nums">{{ r.percent }}%</span>
          </div>
        </div>
      </div>

      <!-- Blocked -->
      <div v-else-if="blocked"
        class="bg-white dark:bg-slate-800 rounded-3xl border border-red-200 p-8 text-center shadow-sm">
        <div class="mb-4 flex justify-center"><Ban :size="56" class="text-red-500" /></div>
        <h2 class="text-xl font-black text-red-600">Siz testdan chiqarildingiz</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Test davomida ekrandan uzoqlashganingiz uchun test bekor qilindi.
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Qayta kirish uchun o'qituvchingizdan ruxsat so'rang.
        </p>
        <RouterLink to="/"
          class="inline-block mt-6 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 transition">
          Bosh sahifa
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="text-center py-20">
        <div class="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-4">
        </div>
        <p class="text-slate-500 dark:text-slate-400">Yuklanmoqda...</p>
      </div>

      <!-- Test found, not started -->
      <div v-else-if="test && !started && !finished">
        <div
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm text-center">
          <div class="mb-4 flex justify-center">
            <span class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
              <FileText :size="26" class="text-white" />
            </span>
          </div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white">{{ test.title }}</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">{{ test.subject }}</p>
          <div class="flex justify-center gap-6 mt-5 mb-6">
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-2xl px-6 py-3">
              <p class="text-2xl font-black text-orange-500 tabular-nums">
                {{ test.questions.length }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">savol</p>
            </div>
            <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl px-6 py-3">
              <p class="text-2xl font-black text-indigo-500 tabular-nums">
                {{ openCount }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">ochiq savol</p>
            </div>
          </div>
          <p class="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2 mb-4">
            <AlertTriangle :size="16" class="inline-block mr-1" /> Test davomida boshqa ekranga / tabga o'tmang. 5
            soniyadan ko'p
            uzoqlashsangiz, test avtomatik bekor qilinadi.
          </p>
          <p v-if="alreadyTaken"
            class="text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-xl px-4 py-2 mb-4">
            Diqqat: bu testni allaqachon yechgansiz — yangi natija o'qituvchiga yuborilmaydi.
          </p>
          <button @click="startTest"
            class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 transition active:scale-[0.98] shadow-lg shadow-orange-100 dark:shadow-none">
            <Rocket :size="16" class="inline-block mr-1" /> Testni boshlash
          </button>
          <button @click="
            test = null;
          codeInput = '';
          "
            class="w-full py-2 mt-2 text-slate-400 text-sm hover:text-slate-600 dark:hover:text-slate-300 transition flex items-center justify-center gap-1">
            <ArrowLeft :size="14" /> Orqaga
          </button>
        </div>
      </div>

      <!-- Active test -->
      <div v-else-if="started && !finished">
        <QuizProgressBar :current="currentIdx" :total="questions.length" tone="orange" />

        <!-- Question card -->
        <div
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-bold uppercase tracking-wider text-orange-500">
              Savol {{ currentIdx + 1 }}
            </p>
            <span v-if="currentQ?.type === 'open'"
              class="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <PenLine :size="11" /> OCHIQ SAVOL
            </span>
          </div>
          <p class="text-lg font-black text-slate-900 dark:text-white mb-6 leading-snug">
            {{ currentQ.question }}
          </p>

          <!-- MCQ: test rejimi — javob to'g'ri/noto'g'ri ko'rsatilmaydi -->
          <div v-if="currentQ?.type !== 'open'" class="space-y-2.5">
            <QuizOptionButton v-for="(opt, i) in currentQ.options" :key="opt" :option="opt"
              :letter="currentQ.options.length <= 4 ? LETTERS[i] : undefined" :disabled="!!selectedAnswer"
              :state="selectedAnswer === opt ? 'selected' : 'idle'" @select="selectAnswer" />
          </div>

          <!-- Open -->
          <QuizOpenAnswer v-else v-model="openAnswer" @submit="submitOpenAnswer" :disabled="!!selectedAnswer"
            :state="'idle'" submit-label="Yuborish" />

          <div v-if="selectedAnswer" class="mt-5">
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400">
              <Check :size="16" class="inline-block mr-1" /> Javobingiz qabul qilindi
            </p>
            <button @click="nextQuestion"
              class="mt-3 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition active:scale-95 shadow-md shadow-orange-100 dark:shadow-none">
              <template v-if="currentIdx + 1 < questions.length">Keyingi <ArrowRight :size="15"
                  class="inline-block" /></template>
              <template v-if="currentIdx + 1 >= questions.length"><Flag :size="16" class="inline-block mr-1" />
                Yakunlash</template>
            </button>
          </div>
        </div>
      </div>

      <!-- Finished -->
      <div v-else-if="finished" class="space-y-4">
        <!-- Animatsiyali tabrik ekrani (test tugaganda) -->
        <CelebrationOverlay :show="!celebrationDismissed" :variant="percent >= 50 ? 'win' : 'lose'"
          :title="finishTitle"
          :subtitle="test.title"
          :count-up-to="percent" count-suffix="%"
          :stats="[
            { label: 'To\'g\'ri', value: score, colorClass: 'text-green-600' },
            { label: 'Savol', value: questions.length, colorClass: 'text-indigo-600' },
          ]"
          :primary-label="saving ? 'Saqlanmoqda...' : 'Natijalarni ko\'rish'"
          @primary="celebrationDismissed = true" />

        <QuizResultCard :percent="percent" :detail="`${score} / ${questions.length} to'g'ri javob`"
          :trophy="percent >= 70">
          {{ test.title }}
        </QuizResultCard>

        <!-- Javoblar sharhi -->
        <div
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm text-left space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Javoblaringiz</p>
          <div v-for="(a, i) in userAnswers" :key="i" class="rounded-2xl border p-3 text-sm"
            :class="a.is_correct ? 'border-green-200 bg-green-50/60 dark:bg-green-900/10 dark:border-green-800' : 'border-red-200 bg-red-50/60 dark:bg-red-900/10 dark:border-red-800'">
            <p class="font-bold text-slate-800 dark:text-slate-100">{{ i + 1 }}.
              {{ test.questions[a.question_index].question }}</p>
            <p class="text-xs mt-1"
              :class="a.is_correct ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              Sizning javobingiz: {{ a.given_text || (a.chosen_option >= 0 ?
                test.questions[a.question_index].options[a.chosen_option] : "—") }} {{ a.is_correct ? "✓" : "✗" }}
            </p>
            <p v-if="!a.is_correct" class="text-xs text-slate-500 dark:text-slate-400">To'g'ri javob:
              {{ test.questions[a.question_index].answer }}</p>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 text-center shadow-sm">
          <div v-if="saving" class="text-xs text-slate-400">
            <Loader :size="14" class="inline-block mr-1 animate-spin" /> Natija saqlanmoqda...
          </div>
          <div v-else class="text-xs text-green-500">
            <CheckCircle :size="14" class="inline-block mr-1 text-green-500" /> {{ savedMessage }}
          </div>
          <button @click="goHome"
            class="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition">
            Bosh sahifa
          </button>
        </div>
      </div>
    </div>

    <!-- Ekrandan uzoqlashganda chiqadigan ogohlantirish (qaytib kelganda ko'rinadi) -->
    <div v-if="showLeaveWarning" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-xl animate-pop">
        <div class="mb-3 flex justify-center"><AlertTriangle :size="48" class="text-red-500" /></div>
        <h3 class="text-lg font-black text-slate-900 dark:text-white">Diqqat!</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Siz ekrandan uzoqlashdingiz. Testga qaytmasangiz
          <span class="font-black text-red-500 tabular-nums">{{ leaveCountdown }}</span>
          soniyadan so'ng test bekor qilinadi.
        </p>
      </div>
    </div>
    <OnboardingTooltip pageId="StudentQuiz" title="Test yechish" description="Kod orqali o'qituvchi testini yeching" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import supabase from "../supabase";
import { useCoinStore } from "../stores/CoinStore";
import { saveNotification } from "../lib/Notification";
import { normalizeQuestionList, isOpenCorrect, type NormalizedQuestion } from "../lib/question";
import {
  ClipboardList,
  Key,
  Search,
  Ban,
  FileText,
  Rocket,
  Flag,
  Loader,
  CheckCircle,
  AlertTriangle,
  Check,
  XCircle,
  ArrowLeft,
  ArrowRight,
  PenLine,
} from '@lucide/vue';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
import CelebrationOverlay from '../components/CelebrationOverlay.vue';
import QuizPageHeader from '../components/quiz/QuizPageHeader.vue';
import QuizProgressBar from '../components/quiz/QuizProgressBar.vue';
import QuizOptionButton from '../components/quiz/QuizOptionButton.vue';
import QuizOpenAnswer from '../components/quiz/QuizOpenAnswer.vue';
import QuizResultCard from '../components/quiz/QuizResultCard.vue';

const LETTERS = ['A', 'B', 'C', 'D'];
const router = useRouter();
const coinStore = useCoinStore();
const codeInput = ref("");
const test = ref<any>(null);
const loading = ref(false);
const searching = ref(false);
const notFound = ref(false);
const started = ref(false);
const finished = ref(false);
const saving = ref(false);
const currentIdx = ref(0);
const score = ref(0);
const selectedAnswer = ref("");
const openAnswer = ref("");
const myResults = ref<any[]>([]);
const blocked = ref(false);
const alreadyTaken = ref(false);
let currentUserId: string | null = null;

const questions = ref<NormalizedQuestion[]>([]);
const currentQ = computed(() => questions.value[currentIdx.value]);
const openCount = computed(() => questions.value.filter((q) => q.type === "open").length);
const percent = computed(() =>
  questions.value.length
    ? Math.round((score.value / questions.value.length) * 100)
    : 0,
);

interface AnswerRow {
  question_index: number;
  chosen_option: number;
  correct_option: number;
  is_correct: boolean;
  given_text?: string;
}
const userAnswers = ref<AnswerRow[]>([]);

// --- Anti-cheat: ekrandan uzoqlashishni kuzatish ---
const LEAVE_GRACE_SECONDS = 5;
const showLeaveWarning = ref(false);
const leaveCountdown = ref(LEAVE_GRACE_SECONDS);
let leaveTimeoutId: number | null = null;
let leaveIntervalId: number | null = null;

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  currentUserId = user.id;

  const { data } = await supabase
    .from("test_results")
    .select("*, tests(title, subject)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  myResults.value = data || [];

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);
  window.addEventListener("focus", handleWindowFocus);
  window.addEventListener("pagehide", handleHardLeave);
});

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("blur", handleWindowBlur);
  window.removeEventListener("focus", handleWindowFocus);
  window.removeEventListener("pagehide", handleHardLeave);
  clearLeaveTimers();
});

const clearLeaveTimers = () => {
  if (leaveTimeoutId) {
    clearTimeout(leaveTimeoutId);
    leaveTimeoutId = null;
  }
  if (leaveIntervalId) {
    clearInterval(leaveIntervalId);
    leaveIntervalId = null;
  }
  showLeaveWarning.value = false;
  leaveCountdown.value = LEAVE_GRACE_SECONDS;
};

const isActiveTestRunning = () => started.value && !finished.value;

const startLeaveCountdown = () => {
  if (!isActiveTestRunning()) return;
  if (leaveTimeoutId) return; // allaqachon hisoblanyapti

  showLeaveWarning.value = true;
  leaveCountdown.value = LEAVE_GRACE_SECONDS;

  leaveIntervalId = window.setInterval(() => {
    leaveCountdown.value--;
  }, 1000);

  leaveTimeoutId = window.setTimeout(() => {
    disqualifyStudent();
  }, LEAVE_GRACE_SECONDS * 1000);
};

const cancelLeaveCountdown = () => {
  clearLeaveTimers();
};

const handleVisibilityChange = () => {
  if (!isActiveTestRunning()) return;
  if (document.hidden) {
    startLeaveCountdown();
  } else {
    cancelLeaveCountdown();
  }
};

const handleWindowBlur = () => {
  if (!isActiveTestRunning()) return;
  startLeaveCountdown();
};

const handleWindowFocus = () => {
  if (!isActiveTestRunning()) return;
  cancelLeaveCountdown();
};

// Tabni / brauzerni butunlay yopib yuborsa (5 soniya kutishning iloji
// bo'lmaydi), to'g'ridan-to'g'ri diskvalifikatsiya qilamiz
const handleHardLeave = () => {
  if (!isActiveTestRunning()) return;
  disqualifyStudent();
};

const disqualifyStudent = async () => {
  clearLeaveTimers();
  if (!isActiveTestRunning()) return;

  const testId = test.value?.id;

  started.value = false;
  finished.value = false;
  blocked.value = true;
  test.value = null;

  if (currentUserId && testId) {
    try {
      await supabase.from("test_blocks").insert({
        user_id: currentUserId,
        test_id: testId,
        reason: "left_screen",
      });
    } catch (e) {
      // unique constraint tufayli takror urinishda xato chiqishi mumkin,
      // bu holatda ham foydalanuvchi baribir bloklangan holatda qoladi
      console.warn("test_blocks insert xatosi:", e);
    }
  }
};

// --- Test topish / boshlash ---

const checkExistingBlock = async (userId: string, testId: string) => {
  const { data } = await supabase
    .from("test_blocks")
    .select("id, unblocked")
    .eq("user_id", userId)
    .eq("test_id", testId)
    .maybeSingle();
  return data && !data.unblocked;
};

const findTest = async () => {
  if (codeInput.value.length < 4) return;
  searching.value = true;
  notFound.value = false;
  alreadyTaken.value = false;
  // Xavfsizlik: testlar faqat SECURITY DEFINER RPC (get_test_by_code) orqali
  // olinadi — kodsiz barcha testlarni o'qib bo'lmaydi.
  const { data } = (await supabase
    .rpc("get_test_by_code", { test_code: codeInput.value })
    .maybeSingle()) as { data: any };
  if (data) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const isBlocked = await checkExistingBlock(user.id, data.id);
      if (isBlocked) {
        blocked.value = true;
        searching.value = false;
        return;
      }
      // Bu testni avval yechganmi? (natijalar test_answers bilan bog'liq)
      const { data: prior } = await supabase
        .from("test_results")
        .select("id")
        .eq("user_id", user.id)
        .eq("test_id", data.id)
        .limit(1);
      alreadyTaken.value = !!prior && prior.length > 0;
    }
    test.value = data;
    questions.value = normalizeQuestionList(data.questions);
  } else {
    notFound.value = true;
  }
  searching.value = false;
};

const startTest = () => {
  currentIdx.value = 0;
  score.value = 0;
  selectedAnswer.value = "";
  openAnswer.value = "";
  userAnswers.value = [];
  started.value = true;
  finished.value = false;
};

// Javob tanlanganda hech qanday to'g'ri/noto'g'ri belgisi ko'rsatilmaydi —
// faqat tanlangan variant vizual jihatdan belgilanadi, ball fon tarafda
// hisoblanadi va natija faqat test yakunida ko'rsatiladi
const selectAnswer = (opt: string) => {
  if (selectedAnswer.value || !currentQ.value) return;
  selectedAnswer.value = opt;

  const isCorrect = opt === currentQ.value.answer;
  if (isCorrect) score.value++;

  const chosenIdx = currentQ.value.options.indexOf(opt);
  const correctIdx = currentQ.value.options.indexOf(currentQ.value.answer);

  userAnswers.value.push({
    question_index: currentIdx.value,
    chosen_option: chosenIdx,
    correct_option: correctIdx,
    is_correct: isCorrect,
    given_text: opt,
  });
};

const submitOpenAnswer = () => {
  if (selectedAnswer.value || !currentQ.value) return;
  const given = openAnswer.value.trim();
  if (!given) return;
  const isCorrect = isOpenCorrect(given, currentQ.value.teacher_answer ?? currentQ.value.answer);
  if (isCorrect) score.value++;
  selectedAnswer.value = given;
  userAnswers.value.push({
    question_index: currentIdx.value,
    chosen_option: -1,
    correct_option: -1,
    is_correct: isCorrect,
    given_text: given,
  });
};

const nextQuestion = () => {
  if (currentIdx.value + 1 >= questions.value.length) {
    finished.value = true;
    started.value = false;
    saveResult();
  } else {
    currentIdx.value++;
    selectedAnswer.value = "";
    openAnswer.value = "";
  }
};

const savedMessage = computed(() =>
  alreadyTaken.value ? "Natija ko'rildi (saqlanmadi)" : "Natija o'qituvchiga yuborildi",
);
const celebrationDismissed = ref(false);
const finishTitle = computed(() =>
  percent.value >= 90 ? "Ajoyib natija! 🏆" : percent.value >= 70 ? "Yaxshi ish! 🎉" : percent.value >= 50 ? "Yakunlandi!" : "Qayta urinib ko'ring! 💪",
);

const goHome = () => {
  finished.value = false;
  test.value = null;
  questions.value = [];
  codeInput.value = "";
  router.push("/");
};

const saveResult = async () => {
  saving.value = true;
  await coinStore.fetchCoins();
  await coinStore.addProgress(percent.value);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Bir testni qayta yechib, natijani sun'iy oshirib bo'lmasligi uchun:
  // avval yechilgan bo'lsa natija DB ga YAZILMAYDI (faqat ko'rsatiladi).
  if (user && !alreadyTaken.value && test.value?.id) {
    const { data: resultRow, error: resultError } = await supabase
      .from("test_results")
      .insert({
        user_id: user.id,
        test_id: test.value.id,
        score: score.value,
        total: questions.value.length,
        percent: percent.value,
      })
      .select()
      .single();

    if (!resultError && resultRow) {
      const answerRows = userAnswers.value.map((a) => ({
        result_id: resultRow.id,
        question_index: a.question_index,
        chosen_option: a.chosen_option,
        correct_option: a.correct_option,
        is_correct: a.is_correct,
      }));
      if (answerRows.length > 0) {
        await supabase.from("test_answers").insert(answerRows);
      }
    }

    await saveNotification(
      user.id,
      "Test yakunlandi!",
      `${test.value.title} — ${percent.value}% natija`,
      "Target",
      `${score.value}/${questions.value.length}`,
      "bg-orange-50",
      "text-orange-500",
      "bg-orange-50 text-orange-600",
    );
  }
  saving.value = false;
};
</script>
