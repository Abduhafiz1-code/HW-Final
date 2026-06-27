<template>
  <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-black text-slate-900">🌐 Tarjimon</h1>
        <p class="text-sm text-slate-500 mt-1">
          AI yordamida matnni tarjima qiling
        </p>
      </div>

      <!-- Lang selector -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex items-center gap-3">
        <select v-model="fromLang"
          class="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold focus:outline-none">
          <option value="auto">🔍 Avtomatik</option>
          <option value="uz">🇺🇿 O'zbek</option>
          <option value="ru">🇷🇺 Rus</option>
          <option value="en">🇬🇧 Ingliz</option>
          <option value="ko">🇰🇷 Koreys</option>
          <option value="de">🇩🇪 Nemis</option>
        </select>
        <button @click="swapLangs"
          class="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center font-black hover:bg-orange-200 transition">
          ⇄
        </button>
        <select v-model="toLang"
          class="flex-1 px-3 py-2 rounded-xl border text-slate-800 border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none">
          <option value="uz">🇺🇿 O'zbek</option>
          <option value="ru">🇷🇺 Rus</option>
          <option value="en">🇬🇧 Ingliz</option>
          <option value="ko">🇰🇷 Koreys</option>
          <option value="de">🇩🇪 Nemis</option>
          <option value="zh">🇨🇳 Xitoy</option>
        </select>
      </div>

      <!-- Input -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 mb-3">
        <textarea v-model="inputText" @input="autoTranslate" placeholder="Tarjima qilinadigan matnni kiriting..."
          class="w-full h-36 resize-none text-sm text-slate-800 text-slate-800 focus:outline-none placeholder-slate-400" />
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-slate-400">{{ inputText.length }} belgi</span>
          <div class="flex gap-2">
            <button @click="
              inputText = '';
            result = '';
            " class="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50">
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
      <div v-if="result || loading" class="bg-white rounded-2xl border border-slate-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tarjima natijasi
          </p>
          <button v-if="result" @click="copyResult"
            class="text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition px-2 py-1 rounded-lg hover:bg-indigo-50">
            {{ copied ? "✅ Nusxa!" : "📋 Nusxa" }}
          </button>
        </div>
        <div v-if="loading" class="flex items-center gap-2 text-slate-500 text-sm">
          <div class="w-4 h-4 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"></div>
          Tarjima qilinmoqda...
        </div>
        <p v-else class="text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
          {{ result }}
        </p>
      </div>

      <!-- Quick phrases -->
      <div class="mt-6">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Tez tarjimalar
        </p>
        <div class="flex flex-wrap gap-2">
          <button v-for="phrase in quickPhrases" :key="phrase" @click="
            inputText = phrase;
          translate();
          "
            class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold hover:border-orange-300 hover:bg-orange-50 transition">
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

const langNames: Record<string, string> = {
  uz: "O'zbek",
  ru: "Rus",
  en: "Ingliz",
  ko: "Koreys",
  de: "Nemis",
  zh: "Xitoy",
  auto: "aniqlanadi",
};

const quickPhrases = [
  "Hello, how are you?",
  "Thank you very much",
  "I need help",
  "What time is it?",
  "Where is the library?",
];

const translate = async () => {
  if (!inputText.value.trim()) return;
  loading.value = true;
  result.value = "";
  try {
    result.value = await askAI(
      `Faqat tarjimani yoz, boshqa hech narsa qo'shma. Ushbu matnni ${langNames[fromLang.value]} tilidan ${langNames[toLang.value]} tiliga tarjima qil:\n\n${inputText.value}`,
    );
  } catch {
    result.value = "❌ Xatolik yuz berdi. Qayta urinib ko'ring.";
  }
  loading.value = false;
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
