<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28 px-4 pt-6">
    <div class="max-w-lg mx-auto">
      <QuizPageHeader title="Birgalikda Test" :icon="Target"
        icon-bg-class="bg-gradient-to-br from-indigo-400 to-indigo-600" back-to="/chat">
        <template #action>
          <RouterLink v-if="!authStore.isPremium" to="/premium"
            class="ml-auto px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-xs font-bold rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition flex items-center gap-1">
            <Crown :size="14" /> Premium
          </RouterLink>
        </template>
      </QuizPageHeader>
      <p class="text-xs font-semibold flex items-center gap-1 -mt-4 mb-6"
        :class="authStore.isPremium ? 'text-green-500' : authStore.canUseCoop ? 'text-orange-500' : 'text-red-500'">
        <Crown v-if="authStore.isPremium" :size="12" />
        {{ authStore.isPremium ? 'Premium — 10 ta limit' : authStore.canUseCoop ? `${2 - authStore.coopUsageCount} marta qoldi (bepul)` : 'Limit tugadi' }}
      </p>

      <!-- Limit block -->
      <div v-if="!authStore.isPremium && !authStore.canUseCoop"
        class="bg-white dark:bg-slate-800 rounded-3xl border border-red-200 dark:border-red-900/50 p-8 text-center shadow-sm">
        <div class="flex justify-center mb-4 text-red-400">
          <Lock :size="48" />
        </div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white">Limit tugadi!</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">Bepul 2 ta co-op testdan foydalandingiz. Premium bilan 10 tagacha!</p>
        <RouterLink to="/premium"
          class="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition">
          <Crown :size="16" /> Premium olish
        </RouterLink>
      </div>

      <div v-else>
        <!-- Incoming requests -->
        <div v-if="!quizStore.session && quizStore.incomingRequests.length > 0" class="space-y-3 mb-5">
          <p class="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Mail :size="14" /> Kiruvchi takliflar:
          </p>
          <div v-for="req in quizStore.incomingRequests" :key="req.id"
            class="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 p-4 flex items-center justify-between shadow-sm animate-slide-down">
            <div>
              <p class="font-bold text-slate-900 dark:text-white">{{ req.profiles?.full_name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Test taklif qildi</p>
            </div>
            <button @click="acceptAndStart(req.id)"
              class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition active:scale-95 shadow-md shadow-indigo-100 dark:shadow-none">Qabul</button>
          </div>
        </div>

        <!-- No session -->
        <div v-if="!quizStore.session"
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="text-center py-10 px-8 border-b border-slate-100 dark:border-slate-700">
            <div class="flex justify-center mb-4">
              <span class="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none animate-bounce-slow">
                <Trophy :size="32" class="text-white" />
              </span>
            </div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white">Guruhda test yech!</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm mt-2 px-4">Chat dan do'stingga test taklifini yuboring. 4 kishigacha
              birgalikda!</p>
            <RouterLink to="/chat"
              class="mt-6 inline-flex items-center gap-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition shadow-lg shadow-orange-100 dark:shadow-none">
              Chat <ArrowRight :size="15" /></RouterLink>
          </div>

          <!-- Qo'shimcha tugmalar -->
          <div class="grid grid-cols-2 gap-0 divide-x divide-slate-100 dark:divide-slate-700">
            <RouterLink to="/solo-quiz"
              class="flex flex-col items-center gap-2 py-5 px-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-center">
              <Brain :size="28" class="text-indigo-400" />
              <p class="font-black text-sm text-slate-800 dark:text-slate-100">Yolg'iz test</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">O'zing mustaqil yech</p>
            </RouterLink>
            <RouterLink to="/student-quiz"
              class="flex flex-col items-center gap-2 py-5 px-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-center">
              <ClipboardList :size="28" class="text-indigo-400" />
              <p class="font-black text-sm text-slate-800 dark:text-slate-100">Ustoz testi</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">Kod orqali kirish</p>
            </RouterLink>
          </div>
        </div>

        <!-- Waiting: guest qabul qilishi bilan real-time yangilanadi, qo'lda yangilash shart emas -->
        <div v-else-if="quizStore.session.status === 'waiting'"
          class="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-4">
          </div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white">Do'stingizni kutmoqda...</h2>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">Qabul qilishi bilan test avtomatik boshlanadi</p>
          <!-- Jonli ulanish indikatori -->
          <p class="mt-3 text-[11px] font-bold flex items-center gap-1.5 justify-center"
            :class="quizStore.realtimeConnected ? 'text-green-500' : 'text-amber-500'">
            <span class="w-2 h-2 rounded-full"
              :class="quizStore.realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'" />
            {{ quizStore.realtimeConnected ? 'Jonli ulanish faol' : 'Zaxira ulanish (polling)' }}
          </p>
        </div>

        <!-- Active -->
        <div v-else-if="quizStore.session.status === 'active'">
          <div
            class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 mb-4 shadow-sm">
            <div class="flex justify-between items-center">
              <div class="text-center flex-1">
                <p class="text-xs text-slate-500 dark:text-slate-400">Sen</p>
                <p class="text-2xl font-black text-orange-500 tabular-nums">{{ myScore }}</p>
              </div>
              <div class="text-center px-2">
                <p class="text-xs text-slate-400 dark:text-slate-500 font-bold tabular-nums">
                  {{ quizStore.session.current_question + 1 }}/{{ quizStore.session.questions.length }}</p>
                <p class="text-lg font-black text-slate-300 dark:text-slate-600">VS</p>
                <!-- Sherik onlaynligi -->
                <p class="text-[10px] font-bold flex items-center gap-1 justify-center"
                  :class="quizStore.partnerOnline ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'">
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="quizStore.partnerOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'" />
                  {{ quizStore.partnerOnline ? 'onlayn' : 'oflayn' }}
                </p>
              </div>
              <div class="text-center flex-1">
                <p class="text-xs text-slate-500 dark:text-slate-400">Do'sting</p>
                <p class="text-2xl font-black text-indigo-500 tabular-nums">{{ partnerScore }}</p>
              </div>
            </div>
          </div>
          <div v-if="currentQ"
            class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div class="flex items-start justify-between gap-3 mb-4">
              <p class="text-lg font-black text-slate-900 dark:text-white">{{ currentQ.question ?? currentQ.q }}</p>
              <span v-if="currentQ.type === 'open'"
                class="flex-shrink-0 text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-lg">OCHIQ</span>
            </div>

            <!-- Variantli savol -->
            <div v-if="currentQ.type !== 'open'" class="space-y-2.5">
              <QuizOptionButton v-for="(opt, i) in (currentQ.options as string[])" :key="opt" :option="opt"
                :letter="currentQ.options.length <= 4 ? LETTERS[i] : undefined" :disabled="!!quizStore.myAnswer"
                :state="coopOptionState(opt)" @select="answerQ" />
            </div>

            <!-- Ochiq savol: o'quvchi o'zi yozadi -->
            <QuizOpenAnswer v-else v-model="openAnswer" @submit="submitOpenAnswer" :disabled="!!quizStore.myAnswer"
              :state="quizStore.myAnswer ? (myOpenCorrect ? 'correct' : 'wrong') : 'idle'" />
            <div v-if="quizStore.myAnswer" class="mt-4 text-center">
              <p :class="answerFeedbackClass" class="font-bold text-sm mb-3">
                {{ answerFeedbackText }}
              </p>
              <p class="text-xs text-slate-400 dark:text-slate-500">
                {{ partnerHasAnswered ? "Keyingi savolga o'tilmoqda..." : "Do'stingiz javob bermoqda..." }}
              </p>
            </div>
          </div>
        </div>

        <!-- Finished -->
        <div v-else-if="quizStore.session.status === 'finished'">
          <!-- Animatsiyali g'alaba/mag'lubiyat ekrani -->
          <CelebrationOverlay :show="!celebrationDismissed"
            :variant="myScore > partnerScore ? 'win' : myScore === partnerScore ? 'tie' : 'lose'"
            :title="finishTitle"
            :subtitle="`Sen ${myScore} — Do'sting ${partnerScore}`"
            :count-up-to="totalQuestions ? Math.round((myScore / totalQuestions) * 100) : 0"
            count-suffix="%"
            :stats="[
              { label: 'Sen', value: myScore, colorClass: 'text-orange-500' },
              { label: 'Do\'sting', value: partnerScore, colorClass: 'text-indigo-500' },
            ]"
            :share-text="myScore > partnerScore
              ? `Do'stimni Birgalikda Test'da ${myScore}:${partnerScore} hisobida yutdim! 🏆 Sen ham chaqir!`
              : `Birgalikda Test yakunlandi: ${myScore}:${partnerScore}. Revansh qilamizmi? 😄`
            "
            primary-label="Yana o'ynash" secondary-label="Chiqish"
            @primary="leave" @secondary="leave" />

          <QuizResultCard :percent="totalQuestions ? Math.round((myScore / totalQuestions) * 100) : 0"
            :detail="`Sen ${myScore} — Do'sting ${partnerScore}`"
            :title="finishTitle"
            :trophy="myScore >= partnerScore" />
          <button @click="celebrationDismissed = false"
            class="mt-4 w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-90 transition">🎉 Tabrikni qayta ko'rish</button>
        </div>
      </div>
    </div>
    <OnboardingTooltip pageId="QuizCoop" title="Birgalikda Test" description="Do'stingiz bilan birgalikda test yeching" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuizCoopStore } from '../stores/QuizCoopStore';
import { useAuthStore } from '../stores/AuthStore';
import supabase from '../supabase';
import { isOpenCorrect } from '../lib/question';
import { Target, Lock, Trophy, Brain, ClipboardList, Crown, Mail, ArrowRight } from '@lucide/vue';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
import CelebrationOverlay from '../components/CelebrationOverlay.vue';
import QuizPageHeader from '../components/quiz/QuizPageHeader.vue';
import QuizOptionButton from '../components/quiz/QuizOptionButton.vue';
import QuizOpenAnswer from '../components/quiz/QuizOpenAnswer.vue';
import QuizResultCard from '../components/quiz/QuizResultCard.vue';

const LETTERS = ['A', 'B', 'C', 'D'];
const quizStore = useQuizCoopStore();
const authStore = useAuthStore();
const currentUserId = ref('');
const isHost = computed(() => quizStore.session?.host_id === currentUserId.value);
const currentQ = computed(() => quizStore.session?.questions[quizStore.session.current_question]);
const myScore = computed(() => isHost.value ? quizStore.session?.host_score ?? 0 : quizStore.session?.guest_score ?? 0);
const partnerScore = computed(() => isHost.value ? quizStore.session?.guest_score ?? 0 : quizStore.session?.host_score ?? 0);
const totalQuestions = computed(() => quizStore.session?.questions.length ?? 0);
const finishTitle = computed(() =>
  myScore.value > partnerScore.value ? "Siz g'alaba qozdingiz! 🏆"
    : myScore.value === partnerScore.value ? "Teng natija! 🤝"
      : "Do'sting yutdi. Harakat! 💪"
);
const celebrationDismissed = ref(false);
// Sherigi javob berdimi - "kutmoqda" holatini ko'rsatish uchun
const partnerHasAnswered = computed(() => !!quizStore.partnerAnswer);

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  currentUserId.value = user?.id || '';
  await refreshData();
  // Real-time: do'st so'rovni qabul qilishi bilan (yoki savol/javob o'zgarishi bilan)
  // hech qanday qo'lda "Yangilash"siz avtomatik yangilanadi.
  quizStore.subscribeToIncoming(currentUserId.value);
  if (quizStore.session) quizStore.subscribeToSession(quizStore.session.id);
});
onUnmounted(() => quizStore.unsubscribeSession());

const refreshData = async () => await quizStore.fetchMyRequests();
const acceptAndStart = async (id: string) => {
  await authStore.incrementCoopUsage();
  await quizStore.acceptSession(id);
};
const answerQ = (opt: string) => quizStore.submitAnswer(opt);

// Variant tugmalari holati (co-op): o'z javobim bor bo'lsa to'g'ri/noto'g'ri ko'rsatiladi
const coopOptionState = (opt: string): 'idle' | 'selected' | 'correct' | 'wrong' => {
  if (!quizStore.myAnswer || !currentQ.value) return 'idle';
  if (opt === currentQ.value.answer) return 'correct';
  if (opt === quizStore.myAnswer) return 'wrong';
  return 'idle';
};

// Ochiq savol uchun holat
const openAnswer = ref('');
const myOpenCorrect = ref(false);
const submitOpenAnswer = () => {
  if (!currentQ.value || quizStore.myAnswer) return;
  const given = openAnswer.value.trim();
  if (!given) return;
  myOpenCorrect.value = isOpenCorrect(given, currentQ.value.teacher_answer ?? currentQ.value.answer);
  quizStore.submitAnswer(given);
};

const answerFeedbackText = computed(() => {
  if (!currentQ.value) return '';
  if (currentQ.value.type === 'open') return myOpenCorrect.value ? "To'g'ri!" : "Noto'g'ri!";
  return quizStore.myAnswer === currentQ.value.answer ? "To'g'ri!" : "Noto'g'ri!";
});
const answerFeedbackClass = computed(() =>
  (currentQ.value?.type === 'open' ? myOpenCorrect.value : quizStore.myAnswer === currentQ.value?.answer)
    ? 'text-green-600' : 'text-red-500');

const leave = () => { quizStore.leaveSession(); refreshData(); };
</script>
