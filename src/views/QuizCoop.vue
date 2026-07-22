<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 px-4 pt-6">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/chat"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition">
          <ArrowLeft :size="18" /></RouterLink>
        <div>
          <h1 class="text-xl font-black text-slate-900 flex items-center gap-2">
            <Target :size="20" /> Birgalikda Test
          </h1>
          <p class="text-xs font-semibold flex items-center gap-1"
            :class="authStore.isPremium ? 'text-green-500' : authStore.canUseCoop ? 'text-orange-500' : 'text-red-500'">
            <Crown v-if="authStore.isPremium" :size="12" />
            {{ authStore.isPremium ? 'Premium — 10 ta limit' : authStore.canUseCoop ? `${2 - authStore.coopUsageCount} marta qoldi (bepul)` : 'Limit tugadi' }}
          </p>
        </div>
        <RouterLink v-if="!authStore.isPremium" to="/premium"
          class="ml-auto px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-100 transition flex items-center gap-1">
          <Crown :size="14" /> Premium
        </RouterLink>
      </div>

      <!-- Limit block -->
      <div v-if="!authStore.isPremium && !authStore.canUseCoop"
        class="bg-white rounded-3xl border border-red-200 p-8 text-center shadow-sm">
        <div class="flex justify-center mb-4 text-red-400">
          <Lock :size="48" />
        </div>
        <h2 class="text-xl font-black text-slate-900">Limit tugadi!</h2>
        <p class="text-slate-500 text-sm mt-2">Bepul 2 ta co-op testdan foydalandingiz. Premium bilan 10 tagacha!</p>
        <RouterLink to="/premium"
          class="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition">
          <Crown :size="16" /> Premium olish
        </RouterLink>
      </div>

      <div v-else>
        <!-- Incoming requests -->
        <div v-if="!quizStore.session && quizStore.incomingRequests.length > 0" class="space-y-3 mb-5">
          <p class="text-sm font-bold text-slate-600 flex items-center gap-1.5">
            <Mail :size="14" /> Kiruvchi takliflar:
          </p>
          <div v-for="req in quizStore.incomingRequests" :key="req.id"
            class="bg-white rounded-2xl border border-indigo-200 p-4 flex items-center justify-between shadow-sm">
            <div>
              <p class="font-bold text-slate-900">{{ req.profiles?.full_name }}</p>
              <p class="text-xs text-slate-500">Test taklif qildi</p>
            </div>
            <button @click="acceptAndStart(req.id)"
              class="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition">Qabul</button>
          </div>
        </div>

        <!-- No session -->
        <!-- No session -->
        <div v-if="!quizStore.session" class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="text-center py-10 px-8 border-b border-slate-100">
            <div class="flex justify-center mb-4 text-orange-400">
              <Trophy :size="56" />
            </div>
            <h2 class="text-xl font-black text-slate-900">Guruhda test yech!</h2>
            <p class="text-slate-500 text-sm mt-2 px-4">Chat dan do'stingga test taklifini yuboring. 4 kishigacha
              birgalikda!</p>
            <RouterLink to="/chat"
              class="mt-6 inline-flex items-center gap-1 px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition">
              Chat <ArrowRight :size="15" /></RouterLink>
          </div>

          <!-- Qo'shimcha tugmalar -->
          <div class="grid grid-cols-2 gap-0 divide-x divide-slate-100">
            <RouterLink to="/solo-quiz"
              class="flex flex-col items-center gap-2 py-5 px-4 hover:bg-slate-50 transition text-center">
              <Brain :size="28" class="text-indigo-400" />
              <p class="font-black text-sm text-slate-800">Yolg'iz test</p>
              <p class="text-xs text-slate-400">O'zing mustaqil yech</p>
            </RouterLink>
            <RouterLink to="/student-quiz"
              class="flex flex-col items-center gap-2 py-5 px-4 hover:bg-slate-50 transition text-center">
              <ClipboardList :size="28" class="text-indigo-400" />
              <p class="font-black text-sm text-slate-800">Ustoz testi</p>
              <p class="text-xs text-slate-400">Kod orqali kirish</p>
            </RouterLink>
          </div>
        </div>

        <!-- Waiting: guest qabul qilishi bilan real-time yangilanadi, qo'lda yangilash shart emas -->
        <div v-else-if="quizStore.session.status === 'waiting'"
          class="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-4">
          </div>
          <h2 class="text-xl font-black text-slate-900">Do'stingizni kutmoqda...</h2>
          <p class="text-xs text-slate-400 mt-2">Qabul qilishi bilan test avtomatik boshlanadi</p>
          <button @click="refreshSession"
            class="mt-4 text-xs text-indigo-500 font-semibold flex items-center gap-1 mx-auto">
            <RotateCw :size="12" /> Yangilash
          </button>
        </div>

        <!-- Active -->
        <div v-else-if="quizStore.session.status === 'active'">
          <div class="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex justify-between">
            <div class="text-center">
              <p class="text-xs text-slate-500">Sen</p>
              <p class="text-2xl font-black text-orange-500">{{ myScore }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-slate-400 font-bold">
                {{ quizStore.session.current_question + 1 }}/{{ quizStore.session.questions.length }}</p>
              <p class="text-lg font-black text-slate-400">VS</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-slate-500">Do'sting</p>
              <p class="text-2xl font-black text-indigo-500">{{ partnerScore }}</p>
            </div>
          </div>
          <div v-if="currentQ" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p class="text-lg font-black text-slate-900 mb-6">{{ currentQ.q }}</p>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="opt in currentQ.options" :key="opt" @click="answerQ(opt)" :disabled="!!quizStore.myAnswer"
                :class="{
                  'border-green-400 bg-green-50 text-green-700': quizStore.myAnswer && opt === currentQ.answer,
                  'border-red-400 bg-red-50 text-red-600': quizStore.myAnswer === opt && opt !== currentQ.answer,
                  'border-slate-200 bg-slate-50 hover:border-orange-300': !quizStore.myAnswer,
                }"
                class="py-4 px-3 rounded-2xl border-2 font-bold text-sm text-slate-800 transition disabled:cursor-default">{{ opt }}</button>
            </div>
            <div v-if="quizStore.myAnswer" class="mt-4 text-center">
              <p :class="quizStore.myAnswer === currentQ.answer ? 'text-green-600' : 'text-red-500'"
                class="font-bold text-sm mb-3">
                {{ quizStore.myAnswer === currentQ.answer ? "To'g'ri!" : "Noto'g'ri!" }}
              </p>
              <p class="text-xs text-slate-400">
                {{ partnerHasAnswered ? "Keyingi savolga o'tilmoqda..." : "Do'stingiz javob bermoqda..." }}
              </p>
            </div>
          </div>
        </div>

        <!-- Finished -->
        <div v-else-if="quizStore.session.status === 'finished'"
          class="text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div class="flex justify-center mb-4"
            :class="myScore > partnerScore ? 'text-orange-400' : myScore === partnerScore ? 'text-indigo-400' : 'text-slate-400'">
            <Trophy :size="56" />
          </div>
          <h2 class="text-2xl font-black text-slate-900">Yakunlandi!</h2>
          <div class="flex justify-center gap-10 mt-5">
            <div>
              <p class="text-3xl font-black text-orange-500">{{ myScore }}</p>
              <p class="text-xs text-slate-500 mt-1">Sen</p>
            </div>
            <div>
              <p class="text-3xl font-black text-indigo-500">{{ partnerScore }}</p>
              <p class="text-xs text-slate-500 mt-1">Do'sting</p>
            </div>
          </div>
          <p class="mt-4 font-bold text-slate-700">
            {{ myScore > partnerScore ? "Siz g'alaba qozdingiz!" : myScore === partnerScore ? "Teng natija!" : "Do'sting yutdi. Harakat!" }}
          </p>
          <button @click="leave"
            class="mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition">Qayta</button>
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
import { Target, Lock, Trophy, Brain, ClipboardList, Crown, Mail, RotateCw, ArrowLeft, ArrowRight } from '@lucide/vue';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';

const quizStore = useQuizCoopStore();
const authStore = useAuthStore();
const currentUserId = ref('');
const isHost = computed(() => quizStore.session?.host_id === currentUserId.value);
const currentQ = computed(() => quizStore.session?.questions[quizStore.session.current_question]);
const myScore = computed(() => isHost.value ? quizStore.session?.host_score ?? 0 : quizStore.session?.guest_score ?? 0);
const partnerScore = computed(() => isHost.value ? quizStore.session?.guest_score ?? 0 : quizStore.session?.host_score ?? 0);
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
const refreshSession = async () => { if (quizStore.session) await quizStore.loadSession(quizStore.session.id); else await refreshData(); };
const acceptAndStart = async (id: string) => {
  await authStore.incrementCoopUsage();
  await quizStore.acceptSession(id);
};
const answerQ = (opt: string) => quizStore.submitAnswer(opt);
const leave = () => { quizStore.leaveSession(); refreshData(); };
</script>
