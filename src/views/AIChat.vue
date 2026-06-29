<template>
  <div class="flex flex-col h-screen bg-slate-50 dark:bg-slate-900"> <!-- ① #F7F9FC → bg-slate-50 -->
    <div
      class="bg-white dark:bg-slate-800 px-4 py-4 shadow-sm flex items-center gap-3 flex-shrink-0 border-b border-slate-100 dark:border-slate-700">
      <RouterLink to="/"
        class="w-10 h-10  md:hidden rounded-xl text-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">
        ←</RouterLink>
      <div
        class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xl">
        🤖</div>
      <div class="flex-1">
        <p class="font-black text-slate-900 dark:text-white text-sm">AI</p>
        <p class="text-xs font-semibold "
          :class="authStore.isPremium ? 'text-green-500' : authStore.canUseAI ? 'text-orange-500' : 'text-red-500 truncate'">
          {{ authStore.isPremium ? '👑 Premium — Cheksiz' : authStore.canUseAI ? `${10 - authStore.aiUsageCount} marta qoldi` : '❌ Limit tugadi' }}
        </p>
      </div>
      <RouterLink v-if="!authStore.isPremium" to="/premium"
        class="px-3 py-1.5 bg-orange-50 truncate text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-100 transition">
        👑
        Premium</RouterLink>
      <button @click="messages = []"
        class="text-xs text-slate-400 hover:text-red-500 px-2 py-1.5 rounded-xl hover:bg-red-50 transition">🗑</button>
    </div>

    <div ref="msgContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <div class="text-6xl mb-4">🤖</div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white">AI O'qituvchi</h2> <!-- ③ qo'shildi -->
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs">Matematika, fizika, ingliz tili — istalgan
          savol!</p> <!-- ④ qo'shildi -->
        <div v-if="!authStore.isPremium"
          class="mt-4 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-sm text-orange-700 max-w-xs">
          Sizda <strong>{{ 10 - authStore.aiUsageCount }}</strong> ta bepul so'rov qoldi.
          <RouterLink to="/premium" class="block mt-1 font-bold underline">Premium olish →</RouterLink>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-5 w-full max-w-sm">
          <button v-for="s in suggestions" :key="s" @click="quickSend(s)"
            class="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-semibold hover:border-orange-300 hover:bg-orange-50 transition text-left">{{ s }}</button>
        </div>
      </div>

      <div v-for="msg in messages" :key="msg.id">
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div class="max-w-[80%] bg-orange-500 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
            <p class="text-sm leading-relaxed">{{ msg.content }}</p>
            <p class="text-[10px] text-orange-200 mt-1 text-right">{{ msg.time }}</p>
          </div>
        </div>
        <div v-else class="flex gap-3">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">
            🤖</div>
          <div class="max-w-[80%]">
            <div
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <p class="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {{ msg.content }}</p>
            </div>
            <p class="text-[10px] text-slate-400 mt-1 ml-1">{{ remaining }}</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex gap-3">
        <div
          class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm">
          🤖</div>
        <div
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl shadow-sm">
          <div class="flex gap-1 items-center h-5">
            <div v-for="i in 3" :key="i" class="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
              :style="`animation-delay:${(i - 1) * 150}ms`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Limit modal -->
    <div v-if="showLimitModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
        <div class="text-5xl mb-4">🔒</div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white">Limit tugadi!</h2> <!-- ② qo'shildi -->
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">3 ta bepul so'rovdan foydalandingiz. Premium oling!
        </p> <!-- ③ qo'shildi -->
        <div class="flex gap-3 mt-6">
          <RouterLink to="/premium"
            class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm text-center">👑 Premium
          </RouterLink>
          <button @click="showLimitModal = false"
            class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm">Yopish</button>
        </div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-800 px-4 py-3 flex gap-2 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
      <textarea v-model="inputText" @keydown.enter.exact.prevent="sendMessage" rows="1"
        placeholder="Savolingizni yozing..." :disabled="!authStore.canUseAI && !authStore.isPremium"
        class="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-orange-400 transition resize-none max-h-32 disabled:opacity-50"
        style="min-height:44px" />
      <button @click="sendMessage"
        :disabled="!inputText.trim() || loading || (!authStore.canUseAI && !authStore.isPremium)"
        class="w-12 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center text-lg shadow-sm transition disabled:opacity-40 active:scale-95 flex-shrink-0">↑</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useAuthStore } from '../stores/AuthStore';
import supabase from '../supabase';  // ✅ to'g'ridan supabase ishlatamiz
import { checkAILimit } from '../lib/ai';
const authStore = useAuthStore();

interface Msg {
  id: number;
  role: 'user' | 'ai';
  content: string;
  time: string;
}



const messages = ref<Msg[]>([]);
const inputText = ref('');
const loading = ref(false);
const msgContainer = ref<HTMLElement>();
const showLimitModal = ref(false);
let id = 0;

const suggestions = [
  '📐 Matematikadan misol ber',
  '🧪 Kimyo formulasini tushuntir',
  '🇬🇧 Ingliz tilida gapirish',
  '⚡ Fizika masalasi yech',
];


const remaining = ref(10);

onMounted(async () => {
  const { remaining: r } = await checkAILimit();
  remaining.value = r;
});
const getTime = () =>
  new Date().toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' });

const scrollBottom = () =>
  nextTick(() => {
    if (msgContainer.value)
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  });

const quickSend = (text: string) => {
  inputText.value = text;
  sendMessage();
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || loading.value) return;

  if (!authStore.isPremium && !authStore.canUseAI) {
    showLimitModal.value = true;
    return;
  }

  messages.value.push({ id: ++id, role: 'user', content: text, time: getTime() });
  inputText.value = '';
  loading.value = true;
  scrollBottom();

  // Suhbat tarixini prompt ga qo'shamiz
  const history = messages.value
    .slice(0, -1)  // oxirgi user xabarni chiqarib tashlaymiz (allaqo'shilgan)
    .map((m) => `${m.role === 'user' ? 'Foydalanuvchi' : 'AI'}: ${m.content}`)
    .join('\n');

  const prompt = history
    ? `Suhbat tarixi:\n${history}\n\nFoydalanuvchi: ${text}`
    : text;

  try {
    // ✅ Supabase Edge Function ga murojaat
    const { data, error } = await supabase.functions.invoke('GroqAI', {
      body: { prompt },
    });

    if (error) throw error;

    const answer = data?.text || "Javob olinmadi";

    messages.value.push({ id: ++id, role: 'ai', content: answer, time: getTime() });
    await authStore.incrementAIUsage();

  } catch (e) {
    messages.value.push({
      id: ++id,
      role: 'ai',
      content: "Xatolik yuz berdi. Qayta urinib ko'ring. 😔",
      time: getTime(),
    });
  } finally {
    loading.value = false;
    scrollBottom();
  }
};
</script>