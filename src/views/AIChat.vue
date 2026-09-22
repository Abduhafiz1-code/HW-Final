<template>
  <div
    class="ai-chat flex min-h-0 h-[100dvh] flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
    <div
      class="bg-white dark:bg-slate-800 px-4 py-4 shadow-sm flex items-center gap-3 flex-shrink-0 border-b border-slate-100 dark:border-slate-700">
      <RouterLink
        to="/"
        class="w-10 h-10 md:hidden rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
        <ArrowLeft :size="18"
      /></RouterLink>
      <div
        class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
        <Bot :size="20" class="text-white" />
      </div>
      <div class="flex-1">
        <p class="font-black text-slate-900 dark:text-white text-sm">AI</p>
        <p
          class="text-xs font-semibold"
          :class="
            authStore.isPremium
              ? 'text-green-500'
              : authStore.canUseAI
                ? 'text-orange-500'
                : 'text-red-500 truncate'
          ">
          {{
            authStore.isPremium
              ? "Premium — Cheksiz"
              : authStore.canUseAI
                ? `${10 - authStore.aiUsageCount} marta qoldi`
                : "Limit tugadi"
          }}
        </p>
      </div>
      <RouterLink
        v-if="!authStore.isPremium"
        to="/premium"
        class="px-3 py-1.5 bg-orange-50 truncate text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-100 transition">
        <Crown :size="14" class="inline -mt-0.5" />
        Premium
      </RouterLink>
      <button
        @click="messages = []"
        class="text-xs text-slate-400 hover:text-red-500 px-2 py-1.5 rounded-xl hover:bg-red-50 transition">
        <Trash2 :size="16" />
      </button>
    </div>

    <div
      ref="msgContainer"
      class="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 space-y-4"
      @click="handleContainerClick">
      <div
        v-if="messages.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center">
        <div
          class="mb-4 w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-200 dark:shadow-none animate-pop">
          <Bot :size="40" class="text-white" />
        </div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white">
          AI O'qituvchi
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs">
          Matematika, fizika, ingliz tili — istalgan savol! Javoblar
          bosqichma-bosqich, sizning darajangizga mos.
        </p>
        <div
          v-if="!authStore.isPremium"
          class="mt-4 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-sm text-orange-700 max-w-xs">
          Sizda <strong>{{ 10 - authStore.aiUsageCount }}</strong> ta bepul
          so'rov qoldi.
          <RouterLink
            to="/premium"
            class="mt-1 font-bold underline inline-flex items-center gap-1"
            >Premium olish <ArrowRight :size="13"
          /></RouterLink>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-5 w-full max-w-sm">
          <button
            v-for="s in suggestions"
            :key="s"
            @click="quickSend(s)"
            class="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-semibold hover:border-orange-300 hover:bg-orange-50 transition text-left">
            {{ s }}
          </button>
        </div>
      </div>

      <div v-for="msg in messages" :key="msg.id">
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div
            class="max-w-[80%] bg-orange-500 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
            <p class="text-sm leading-relaxed whitespace-pre-wrap">
              {{ msg.content }}
            </p>
            <p class="text-[10px] text-orange-200 mt-1 text-right">
              {{ msg.time }}
            </p>
          </div>
        </div>
        <div v-else>
          <ChatMessage :content="msg.content" :time="msg.time" :copied="copiedId === msg.id" @copy="copyAnswer(msg)" />
        </div>
      </div>

      <div v-if="loading" class="flex gap-3">
        <div
          class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <Bot :size="16" class="text-white" />
        </div>
        <div
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl shadow-sm">
          <div class="flex gap-1 items-center h-5">
            <div
              v-for="i in 3"
              :key="i"
              class="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
              :style="`animation-delay:${(i - 1) * 150}ms`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Limit modal -->
    <div
      v-if="showLimitModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
        <div class="mb-4 text-slate-400 flex justify-center">
          <Lock :size="52" />
        </div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white">
          Limit tugadi!
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">
          3 ta bepul so'rovdan foydalandingiz. Premium oling!
        </p>
        <div class="flex gap-3 mt-6">
          <RouterLink
            to="/premium"
            class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm text-center">
            <Crown :size="16" class="inline -mt-0.5" /> Premium
          </RouterLink>
          <button
            @click="showLimitModal = false"
            class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm">
            Yopish
          </button>
        </div>
      </div>
    </div>

    <!-- Tez savollar: suhbat davom etayotganda ham ko'rinadi -->
    <div
      v-if="messages.length > 0 && !loading"
      class="px-4 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0"
      style="scrollbar-width: none">
      <button
        v-for="s in suggestions"
        :key="s"
        @click="quickSend(s)"
        class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] text-slate-600 dark:text-slate-300 font-semibold hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition whitespace-nowrap flex-shrink-0">
        {{ s }}
      </button>
    </div>

    <div
      class="ai-composer bg-white dark:bg-slate-800 px-3 py-2.5 sm:px-4 sm:py-3 flex items-end gap-2 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="sendMessage"
        rows="1"
        placeholder="Savolingizni yozing..."
        :disabled="!authStore.canUseAI && !authStore.isPremium"
        class="min-w-0 flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-orange-400 transition resize-none max-h-32 disabled:opacity-50"
        style="min-height: 44px" />
      <button
        @click="sendMessage"
        :disabled="
          !inputText.trim() ||
          loading ||
          (!authStore.canUseAI && !authStore.isPremium)
        "
        class="w-12 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-sm transition disabled:opacity-40 active:scale-95 flex-shrink-0">
        <SendHorizontal :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from "vue";
import {
  Bot,
  Crown,
  Lock,
  Trash2,
  ArrowLeft,
  SendHorizontal,
} from "@lucide/vue";
import { useAuthStore } from "../stores/AuthStore";
import supabase from "../supabase";
import { checkAILimit } from "../lib/ai";
import ChatMessage from "../components/ChatMessage.vue";
const authStore = useAuthStore();

interface Msg {
  id: number;
  role: "user" | "ai";
  content: string;
  time: string;
}

const messages = ref<Msg[]>([]);
const inputText = ref("");
const loading = ref(false);
const msgContainer = ref<HTMLElement>();
const showLimitModal = ref(false);
let id = 0;

const suggestions = [
  "Matematikadan misol ber",
  "Kimyo formulasini tushuntir",
  "Ingliz tilida gapirish",
  "Fizika masalasi yech",
];

const remaining = ref(10);

/* ---- Suhbat tarixi localStorage'da saqlanadi (yangilansa ham yo'qolmaydi) ---- */
const HISTORY_KEY = "ai_chat_history";
const copiedId = ref<number | null>(null);

const saveHistory = () => {
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(messages.value.slice(-40)),
    );
  } catch {
    /* storage to'lgan bo'lsa jim o'tamiz */
  }
};

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Msg[];
      if (Array.isArray(saved) && saved.length) {
        messages.value = saved;
        id = saved.length ? Math.max(...saved.map((m) => m.id)) : 0;
        nextTick(scrollBottom);
      }
    }
  } catch {
    /* buzilgan data — e'tiborsiz */
  }
};

watch(messages, saveHistory, { deep: true });

onMounted(async () => {
  const { remaining: r } = await checkAILimit();
  remaining.value = r;
  loadHistory();
});

const copyAnswer = async (msg: Msg) => {
  try {
    await navigator.clipboard.writeText(msg.content);
    copiedId.value = msg.id;
    setTimeout(() => (copiedId.value = null), 1500);
  } catch {
    /* clipboard ruxsat bermadi */
  }
};

const getTime = () =>
  new Date().toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" });

const quickSend = (text: string) => {
  inputText.value = text;
  sendMessage();
};

const scrollBottom = () =>
  nextTick(() => {
    if (msgContainer.value)
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  });

const handleContainerClick = async (e: MouseEvent) => {
  const target = (e.target as HTMLElement)?.closest(
    ".copy-btn",
  ) as HTMLElement | null;
  if (!target) return;

  const codeId = target.getAttribute("data-code-id");
  if (!codeId) return;

  const codeEl = document.getElementById(codeId);
  if (!codeEl) return;

  try {
    await navigator.clipboard.writeText(codeEl.textContent || "");
    const label = target.querySelector(".copy-label");
    if (label) {
      const original = label.textContent;
      label.textContent = "Nusxalandi";
      setTimeout(() => {
        if (label) label.textContent = original;
      }, 1500);
    }
  } catch {
    // clipboard ruxsat bermasa, hech narsa qilmaymiz
  }
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || loading.value) return;

  if (!authStore.isPremium && !authStore.canUseAI) {
    showLimitModal.value = true;
    return;
  }

  messages.value.push({
    id: ++id,
    role: "user",
    content: text,
    time: getTime(),
  });
  inputText.value = "";
  loading.value = true;
  scrollBottom();

  const history = messages.value
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "Foydalanuvchi" : "AI"}: ${m.content}`)
    .join("\n");

  const prompt = history
    ? `Suhbat tarixi:\n${history}\n\nFoydalanuvchi: ${text}`
    : text;

  try {
    const { data, error } = await supabase.functions.invoke("GroqAI", {
      body: { prompt },
    });

    if (error) throw error;

    const answer = data?.text || "Javob olinmadi";

    messages.value.push({
      id: ++id,
      role: "ai",
      content: answer,
      time: getTime(),
    });
    await authStore.incrementAIUsage();
  } catch (e) {
    messages.value.push({
      id: ++id,
      role: "ai",
      content: "Xatolik yuz berdi. Qayta urinib ko'ring.",
      time: getTime(),
    });
  } finally {
    loading.value = false;
    scrollBottom();
  }
};
</script>

<style scoped>
.ai-content :deep(p:first-child) {
  margin-top: 0;
}

.ai-content :deep(p:last-child) {
  margin-bottom: 0;
}

.ai-content :deep(ul),
.ai-content :deep(ol) {
  padding-left: 0.25rem;
}
</style>
