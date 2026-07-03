<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-950 px-4 pt-6 pb-28 transition-colors">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-black text-slate-900 dark:text-white">🌐 Tarjimon</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          AI yordamida matnni tarjima qiling
        </p>
      </div>

      <!-- Lang selector -->
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4 flex flex-col sm:flex-row items-center gap-3">
        <select v-model="fromLang"
          class="w-full sm:flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none">
          <option value="auto">🔍 Avtomatik</option>
          <option value="uz">🇺🇿 O'zbek</option>
          <option value="ru">🇷🇺 Rus</option>
          <option value="en">🇬🇧 Ingliz</option>
          <option value="ko">🇰🇷 Koreys</option>
          <option value="de">🇩🇪 Nemis</option>
        </select>
        <button @click="swapLangs"
          class="w-10 h-10 shrink-0 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 flex items-center justify-center font-black hover:bg-orange-200 dark:hover:bg-orange-500/30 transition rotate-90 sm:rotate-0">
          ⇄
        </button>
        <select v-model="toLang"
          class="w-full sm:flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-semibold focus:outline-none">
          <option value="uz">🇺🇿 O'zbek</option>
          <option value="ru">🇷🇺 Rus</option>
          <option value="en">🇬🇧 Ingliz</option>
          <option value="ko">🇰🇷 Koreys</option>
          <option value="de">🇩🇪 Nemis</option>
          <option value="zh">🇨🇳 Xitoy</option>
        </select>
      </div>

      <!-- Input -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-3">
        <textarea v-model="inputText" @input="autoTranslate" placeholder="Tarjima qilinadigan matnni kiriting..."
          class="w-full h-36 resize-none text-sm bg-transparent text-slate-800 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-500" />
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ inputText.length }} belgi</span>
          <div class="flex gap-2">
            <button @click="clearAll"
              class="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
              ✕ Tozalash
            </button>
            <button @click="translate" :disabled="loading || !inputText.trim()"
              class="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition disabled:opacity-50">
              {{ loading ? "⏳..." : "🌐 Tarjima" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Result -->
      <div v-if="result || loading"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-3">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tarjima natijasi
          </p>
          <button v-if="result" @click="copyResult"
            class="text-xs text-indigo-500 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
            {{ copied ? "✅ Nusxa!" : "📋 Nusxa" }}
          </button>
        </div>
        <div v-if="loading" class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <div class="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
          Tarjima qilinmoqda...
        </div>
        <p v-else class="text-slate-800 dark:text-white leading-relaxed text-sm whitespace-pre-wrap">
          {{ result }}
        </p>
      </div>

      <!-- Word level & synonyms card -->
      <div v-if="wordInfoLoading || wordInfo"
        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-3">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          So'z darajasi
        </p>

        <div v-if="wordInfoLoading" class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <div class="w-4 h-4 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin"></div>
          Tahlil qilinmoqda...
        </div>

        <div v-else-if="wordInfo">
          <!-- Main word + level -->
          <div class="flex items-center flex-wrap gap-2 mb-4">
            <span class="text-lg font-black text-slate-900 dark:text-white">{{ wordInfo.word }}</span>
            <span :class="levelBadgeClass(wordInfo.level)" class="px-2.5 py-1 rounded-lg text-xs font-black border">
              {{ wordInfo.level }}
            </span>
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ levelLabel(wordInfo.level) }}</span>
          </div>

          <!-- Synonyms -->
          <div v-if="wordInfo.synonyms && wordInfo.synonyms.length">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Sinonimlar
            </p>
            <div class="flex flex-wrap gap-2">
              <div v-for="(syn, i) in wordInfo.synonyms" :key="i"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ syn.word }}</span>
                <span :class="levelBadgeClass(syn.level)"
                  class="px-1.5 py-0.5 rounded-md text-[10px] font-black border">
                  {{ syn.level }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick phrases -->
      <div class="mt-6">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Tez tarjimalar
        </p>
        <div class="flex flex-wrap gap-2">
          <button v-for="phrase in quickPhrases" :key="phrase" @click="quickTranslate(phrase)"
            class="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-semibold hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition">
            {{ phrase }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { askAI } from "../lib/ai";

const inputText = ref("");
const result = ref("");
const loading = ref(false);
const fromLang = ref("auto");
const toLang = ref("uz");
const copied = ref(false);
let debounceTimer: any;

interface SynonymInfo {
  word: string;
  level: string;
}
interface WordInfo {
  word: string;
  level: string;
  synonyms: SynonymInfo[];
}

const wordInfo = ref<WordInfo | null>(null);
const wordInfoLoading = ref(false);

const langNames: Record<string, string> = {
  uz: "O'zbek",
  ru: "Rus",
  en: "Ingliz",
  ko: "Koreys",
  de: "Nemis",
  zh: "Xitoy",
  auto: "aniqlanadi",
};

// CEFR darajalari uchun ranglar (dark/light mos)
const levelColors: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  A2: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30",
  B1: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  B2: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30",
  C1: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
  C2: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
};

const levelLabels: Record<string, string> = {
  A1: "Boshlang'ich",
  A2: "Oddiy",
  B1: "O'rta",
  B2: "O'rtadan yuqori",
  C1: "Yuqori",
  C2: "Professional",
};

const levelBadgeClass = (level: string) =>
  levelColors[level] || "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";

const levelLabel = (level: string) => levelLabels[level] || "";

const quickPhrases = [
  "Hello, how are you?",
  "Thank you very much",
  "I need help",
  "What time is it?",
  "Where is the library?",
];

// Faqat 1-3 so'zli qisqa matnlar uchun daraja/sinonim tahlili ma'noli bo'ladi
const isSingleWordOrShortPhrase = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 3;
};

const parseJsonSafely = (raw: string) => {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

const fetchWordInfo = async (text: string) => {
  wordInfoLoading.value = true;
  wordInfo.value = null;
  try {
    const prompt = `Sen til darajasi (CEFR: A1, A2, B1, B2, C1, C2) bo'yicha ekspertsan.
Quyidagi so'z yoki qisqa iborani tahlil qil: "${text}"
Bu so'z ${langNames[toLang.value]} tiliga tarjima qilingandan keyingi shaklda bo'lishi kerak.
Faqat quyidagi JSON formatda javob ber, boshqa hech narsa yozma (matn, izoh, markdown qo'shma):
{
  "word": "tarjima qilingan so'z",
  "level": "CEFR darajasi (A1/A2/B1/B2/C1/C2)",
  "synonyms": [
    {"word": "sinonim1", "level": "CEFR darajasi"},
    {"word": "sinonim2", "level": "CEFR darajasi"},
    {"word": "sinonim3", "level": "CEFR darajasi"},
    {"word": "sinonim4", "level": "CEFR darajasi"}
  ]
}
${langNames[toLang.value]} tilida javob ber, sinonimlar shu tilda bo'lsin.`;

    const raw = await askAI(prompt);
    wordInfo.value = parseJsonSafely(raw);
  } catch {
    wordInfo.value = null;
  }
  wordInfoLoading.value = false;
};

const translate = async () => {
  if (!inputText.value.trim()) return;
  loading.value = true;
  result.value = "";
  wordInfo.value = null;

  const text = inputText.value;
  const shouldFetchWordInfo = isSingleWordOrShortPhrase(text);

  try {
    const translationPromise = askAI(
      `Faqat tarjimani yoz, boshqa hech narsa qo'shma. Ushbu matnni ${langNames[fromLang.value]} tilidan ${langNames[toLang.value]} tiliga tarjima qil:\n\n${text}`,
    );

    if (shouldFetchWordInfo) {
      fetchWordInfo(text);
    }

    result.value = await translationPromise;
  } catch {
    result.value = "❌ Xatolik yuz berdi. Qayta urinib ko'ring.";
  }
  loading.value = false;
};

const quickTranslate = (phrase: string) => {
  inputText.value = phrase;
  translate();
};

const clearAll = () => {
  inputText.value = "";
  result.value = "";
  wordInfo.value = null;
};

const autoTranslate = () => {
  clearTimeout(debounceTimer);
  if (inputText.value.length > 10) debounceTimer = setTimeout(translate, 1200);
};

const swapLangs = () => {
  const tmp = fromLang.value === "auto" ? "uz" : fromLang.value;
  fromLang.value = toLang.value;
  toLang.value = tmp;
  if (result.value) {
    inputText.value = result.value;
    result.value = "";
    translate();
  }
};

const copyResult = () => {
  navigator.clipboard.writeText(result.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};
</script>