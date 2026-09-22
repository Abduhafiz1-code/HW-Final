<template>
  <div
    class="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 pt-6 px-4 pb-28 md:pb-6">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <RouterLink
          to="/"
          class="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 active:scale-90 transition">
          <ArrowLeft :size="18" />
        </RouterLink>
        <div>
          <h1
            class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span
              class="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-300">
              <Globe :size="18" />
            </span>
            Tarjimon
          </h1>
          <p class="text-xs text-slate-500 dark:text-white/60 ml-9">
            Matn, so'z va rasmlarni tarjima qiling
          </p>
        </div>
      </div>

      <!-- Mode tabs: Matn / Rasm -->
      <div
        class="flex gap-1.5 mb-4 bg-white dark:bg-white/5 rounded-2xl p-1 border border-slate-200 dark:border-white/10 w-fit">
        <button
          @click="mode = 'text'"
          class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
          :class="
            mode === 'text'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-500 dark:text-white/50 hover:text-orange-500'
          ">
          <Type :size="14" /> Matn
        </button>
        <button
          @click="mode = 'image'"
          class="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
          :class="
            mode === 'image'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-500 dark:text-white/50 hover:text-orange-500'
          ">
          <Camera :size="14" /> Rasm tarjima
        </button>
      </div>

      <!-- ══════════ MATN TARJIMA ══════════ -->
      <template v-if="mode === 'text'">
        <!-- Source language -->
        <div
          class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-3 shadow-sm transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-500 dark:text-white/60">
              {{
                sourceLang === "auto"
                  ? detectedLang
                    ? `Aniqlandi: ${detectedLang}`
                    : "Tilni avtomatik aniqlash"
                  : "Tarjima qilish"
              }}
            </span>
            <button
              @click="speak(sourceText, sourceLang)"
              :disabled="!sourceText"
              class="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <Volume2 :size="14" /> O'qish
            </button>
          </div>
          <div class="mb-3">
            <select
              v-model="sourceLang"
              class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-orange-400 transition">
              <option value="auto">Tilni avtomatik aniqlash</option>
              <option v-for="l in languages" :key="l.code" :value="l.code">
                {{ l.name }}
              </option>
            </select>
          </div>
          <div class="relative">
            <textarea
              v-model="sourceText"
              @keydown.enter.meta.prevent="translateText"
              @keydown.enter.ctrl.prevent="translateText"
              placeholder="Matn yoki so'zni kiriting..."
              class="w-full px-4 py-3 pr-10 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm resize-none focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10 transition h-24"></textarea>
            <button
              v-if="sourceText"
              @click="clearSource"
              title="Tozalash"
              class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 flex items-center justify-center active:scale-90 transition">
              <X :size="14" />
            </button>
            <p
              v-if="sourceText"
              class="text-[10px] text-slate-400 text-right mt-1 font-semibold">
              {{ sourceText.length }} belgi
            </p>
          </div>
        </div>

        <!-- Swap button -->
        <div class="flex justify-center my-2">
          <button
            @click="swapLanguages"
            class="w-10 h-10 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/50 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-white/20 active:scale-90 transition-all shadow-sm">
            <ArrowLeftRight
              :size="18"
              class="transition-transform duration-300"
              :class="{ 'rotate-180': swapped }" />
          </button>
        </div>

        <!-- Target language -->
        <div
          class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm transition-shadow hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-500 dark:text-white/60"
              >Tarjima</span
            >
            <button
              v-if="translatedText && !translating"
              @click="copyResult"
              class="text-xs font-bold flex items-center gap-1 transition"
              :class="copied ? 'text-green-500' : 'text-slate-400 hover:text-orange-500'">
              <CheckCircle v-if="copied" :size="14" />
              <Copy v-else :size="14" /> {{ copied ? "Nusxalandi" : "Nusxalash" }}
            </button>
            <button
              v-if="translatedText && !translating"
              @click="speak(translatedText, targetLang)"
              class="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition">
              <Volume2 :size="14" /> O'qish
            </button>
          </div>
          <div class="mb-3">
            <select
              v-model="targetLang"
              class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400 transition">
              <option v-for="l in languages" :key="l.code" :value="l.code">
                {{ l.name }}
              </option>
            </select>
          </div>

          <div
            class="min-h-12 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 p-4 text-sm text-slate-800 dark:text-white">
            <span
              v-if="translating"
              class="text-slate-400 flex items-center gap-2">
              <Loader :size="16" class="animate-spin" /> Tarjima qilinmoqda...
            </span>
            <div
              v-else-if="translatedText"
              :key="resultKey"
              class="animate-pop">
              <p class="leading-relaxed font-semibold">{{ translatedText }}</p>
            </div>
            <span v-else class="text-slate-400"
              >Tarjima shu yerda paydo bo'ladi</span
            >
          </div>

          <!-- Sinonimlar + qo'llanilishi (so'z tarjima qilinganda) -->
          <Transition name="pop">
            <div
              v-if="synonyms.length && !translating"
              class="mt-4 space-y-3 animate-pop">
              <!-- Sinonimlar: TARJIMA TILIDA -->
              <div
                class="rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-900/40 p-3">
                <p
                  class="text-[11px] font-black text-purple-600 dark:text-purple-300 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <ListTree :size="13" /> Sinonimlar
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="(s, i) in synonyms"
                    :key="i"
                    @click="lookupSynonym(s)"
                    class="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/40 active:scale-95 transition">
                    {{ s }}
                  </button>
                </div>
              </div>
              <!-- Qo'llanilishi -->
              <div
                v-if="usageExample"
                class="rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/40 p-3">
                <p
                  class="text-[11px] font-black text-blue-600 dark:text-blue-300 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <MessageSquareQuote :size="13" /> Qo'llanilishi
                </p>
                <p
                  class="text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  "{{ usageExample }}"
                </p>
              </div>
            </div>
          </Transition>

          <!-- CEFR level badge -->
          <Transition name="pop">
            <div
              v-if="currentLevel && !translating"
              class="mt-3 flex items-center gap-3">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border"
                :class="levelStyle(currentLevel).badge">
                <BarChart3 :size="12" /> {{ currentLevel }} —
                {{ levelStyle(currentLevel).label }}
              </span>
              <div class="flex-1 flex gap-1">
                <span
                  v-for="(seg, i) in cefrOrder"
                  :key="seg"
                  class="h-1.5 flex-1 rounded-full transition-all duration-500"
                  :class="
                    i <= cefrOrder.indexOf(currentLevel)
                      ? levelStyle(currentLevel).bar
                      : 'bg-slate-200 dark:bg-white/10'
                  "
                  :style="{ transitionDelay: `${i * 60}ms` }" />
              </div>
            </div>
          </Transition>
        </div>

        <!-- Translate button -->
        <button
          @click="translateText"
          :disabled="translating || !sourceText.trim()"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-lg hover:opacity-90 transition disabled:opacity-60 active:scale-95 shadow-lg shadow-orange-200 dark:shadow-orange-800/30">
          <span
            v-if="translating"
            class="flex items-center justify-center gap-2">
            <Loader :size="18" class="animate-spin" /> Tarjima qilinmoqda...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <Globe :size="18" /> Tarjima qilish
          </span>
        </button>
        <p
          v-if="errorMsg"
          class="text-xs text-red-400 text-center mt-2 flex items-center justify-center gap-1">
          <AlertCircle :size="13" /> {{ errorMsg }}
        </p>

        <!-- Save to Word List -->
        <div
          v-if="translatedText && sourceText.trim() && !translating"
          class="mt-4 text-center animate-pop">
          <button
            @click="saveWord"
            class="px-5 py-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/20 active:scale-95 transition flex items-center gap-2 mx-auto">
            <BookOpen :size="16" class="text-orange-500" /> So'zlar ro'yxatiga
            qo'shish
          </button>
          <p
            v-if="wordSaved"
            class="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1 animate-pop">
            <CheckCircle :size="14" /> Saqlandi!
          </p>
        </div>
      </template>

      <!-- ══════════ RASM TARJIMA ══════════ -->
      <template v-else>
        <div
          class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm">
          <p
            class="text-xs font-bold text-slate-500 dark:text-white/60 mb-3 flex items-center gap-1.5">
            <Languages :size="14" class="text-orange-500" /> Rasm tili →
            <select
              v-model="targetLang"
              class="ml-auto rounded-lg border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 text-xs font-bold px-2 py-1 focus:outline-none">
              <option v-for="l in languages" :key="l.code" :value="l.code">
                {{ l.name }}
              </option>
            </select>
          </p>

          <!-- Rasm tanlash / kamera -->
          <div
            v-if="!imageUrl"
            class="border-2 border-dashed border-slate-200 dark:border-white/20 rounded-2xl p-8 text-center">
            <div class="flex justify-center mb-3">
              <span
                class="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <Camera :size="26" class="text-orange-500" />
              </span>
            </div>
            <p class="font-black text-slate-800 dark:text-white text-sm mb-1">
              Rasmga oling yoki tanlang
            </p>
            <p class="text-xs text-slate-400 mb-4">
              Matnli rasm — AI o'qib tarjima qiladi
            </p>
            <div class="flex justify-center gap-2">
              <button
                @click="triggerFile('camera')"
                class="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-black hover:bg-orange-600 active:scale-95 transition flex items-center gap-1.5">
                <Camera :size="14" /> Kamera
              </button>
              <button
                @click="triggerFile('gallery')"
                class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 text-xs font-black hover:bg-slate-200 active:scale-95 transition flex items-center gap-1.5">
                <Images :size="14" /> Galereya
              </button>
            </div>
          </div>

          <!-- Rasm ko'rsatish + natija -->
          <div v-else>
            <div class="relative rounded-2xl overflow-hidden mb-3">
              <img
                :src="imageUrl"
                class="w-full max-h-72 object-contain bg-slate-50 dark:bg-white/5 rounded-2xl" />
              <!-- Scan animatsiyasi -->
              <div
                v-if="imageTranslating"
                class="absolute inset-0 scan-line pointer-events-none"></div>
              <button
                @click="clearImage"
                class="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/50 text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition">
                <X :size="14" />
              </button>
            </div>

            <div
              v-if="imageTranslating"
              class="rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 p-4 text-sm text-slate-400 flex items-center gap-2">
              <Loader :size="16" class="animate-spin" /> Rasm o'qilmoqda va
              tarjima qilinmoqda...
            </div>
            <div
              v-else-if="imageResult"
              class="rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 p-4 text-sm text-slate-800 dark:text-white animate-pop">
              <p class="leading-relaxed whitespace-pre-wrap">
                {{ imageResult }}
              </p>
            </div>

            <button
              v-if="!imageTranslating && !imageResult"
              @click="translateImage"
              class="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2">
              <Languages :size="17" /> Rasmni tarjima qilish
            </button>
          </div>

          <p
            v-if="imageError"
            class="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertCircle :size="13" /> {{ imageError }}
          </p>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageSelected" />
        </div>
      </template>

      <!-- Recent Translations -->
      <div
        v-if="recentTranslations.length > 0"
        class="mt-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
        <h2
          class="font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <BookOpen :size="16" class="text-orange-500" /> So'nggi tarjimalar
        </h2>
        <TransitionGroup name="row">
          <button
            v-for="(item, idx) in recentTranslations"
            :key="item.source + idx"
            @click="reuse(item)"
            class="w-full flex items-center justify-between gap-2 py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0 text-left hover:bg-slate-50 dark:hover:bg-white/5 -mx-1 px-1 rounded-lg transition">
            <div class="min-w-0">
              <p
                class="text-sm font-bold text-slate-800 dark:text-white truncate">
                {{ item.source }}
              </p>
              <p class="text-xs text-slate-400 truncate">
                {{ item.translated }}
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                v-if="item.level"
                class="px-1.5 py-0.5 rounded text-[10px] font-black border"
                :class="levelStyle(item.level).badge"
                >{{ item.level }}</span
              >
              <span
                @click.stop="speak(item.translated, targetLang)"
                class="text-slate-400 hover:text-orange-500 transition">
                <Volume2 :size="14" />
              </span>
            </div>
          </button>
        </TransitionGroup>
      </div>
    </div>
    <OnboardingTooltip
      pageId="Translate"
      title="Tarjimon"
      description="Matnlarni tez va oson tarjima qiling, so'zning sinonimlari va qo'llanilishini ko'ring" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Globe,
  ArrowLeftRight,
  Loader,
  BookOpen,
  CheckCircle,
  Volume2,
  BarChart3,
  AlertCircle,
  ArrowLeft,
  Type,
  Camera,
  Languages,
  X,
  Images,
  ListTree,
  MessageSquareQuote,
  Copy,
} from "@lucide/vue";
import supabase from "../supabase";
import { askAIJson } from "../lib/ai";
import { compressImage } from "../lib/image";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";

const languages = [
  { code: "uz", name: "O'zbek" },
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "ar", name: "العربية" },
  { code: "tr", name: "Türkçe" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "ja", name: "日本語" },
  { code: "it", name: "Italiano" },
];

// Google Translate uslubi: "auto" = tilni AI o'zi aniqlaydi
const detectedLang = ref("");
const copied = ref(false);

const cefrOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
const cefrMeta: Record<string, { label: string; badge: string; bar: string }> =
  {
    A1: {
      label: "Boshlang'ich",
      badge:
        "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30",
      bar: "bg-green-400",
    },
    A2: {
      label: "Oddiy",
      badge:
        "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30",
      bar: "bg-teal-400",
    },
    B1: {
      label: "O'rta",
      badge:
        "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
      bar: "bg-blue-400",
    },
    B2: {
      label: "O'rta-yuqori",
      badge:
        "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30",
      bar: "bg-indigo-400",
    },
    C1: {
      label: "Yuqori",
      badge:
        "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30",
      bar: "bg-purple-400",
    },
    C2: {
      label: "Mukammal",
      badge:
        "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
      bar: "bg-red-400",
    },
  };
const levelStyle = (lvl: string) => cefrMeta[lvl] || cefrMeta.B1;

const mode = ref<"text" | "image">("text");
const sourceLang = ref("auto");
const targetLang = ref("en");
const sourceText = ref("");
const translatedText = ref("");
const translating = ref(false);
const wordSaved = ref(false);
const errorMsg = ref("");
const currentLevel = ref("");
const swapped = ref(false);
const resultKey = ref(0);
const synonyms = ref<string[]>([]);
const usageExample = ref("");
const recentTranslations = ref<
  { source: string; translated: string; level: string }[]
>([]);

/* ---- Rasm tarjima ---- */
const fileInput = ref<HTMLInputElement>();
const fileMode = ref<"camera" | "gallery">("gallery");
const imageUrl = ref("");
const imageBase64 = ref("");
const imageMimeType = ref("image/jpeg");
const imageTranslating = ref(false);
const imageResult = ref("");
const imageError = ref("");

const triggerFile = (m: "camera" | "gallery") => {
  fileMode.value = m;
  if (fileInput.value) {
    fileInput.value.setAttribute(
      "capture",
      m === "camera" ? "environment" : "",
    );
    fileInput.value.click();
  }
};

const onImageSelected = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 15 * 1024 * 1024) {
    imageError.value = "Rasm 15MB dan kichik bo\u2019lishi kerak.";
    return;
  }
  imageError.value = "";
  imageResult.value = "";
  try {
    // Siqish: kamera rasmlari ~3-5MB → ~200-400KB. Token limitiga urilmaydi.
    const compressed = await compressImage(file, {
      maxDimension: 1600,
      maxBytes: 1_200_000,
    });
    imageUrl.value = compressed.dataUrl;
    imageBase64.value = compressed.base64;
    imageMimeType.value = compressed.mimeType;
  } catch {
    imageError.value = "Rasmni yuklashda xatolik.";
  }
};

const clearImage = () => {
  imageUrl.value = "";
  imageBase64.value = "";
  imageResult.value = "";
  imageError.value = "";
  if (fileInput.value) fileInput.value.value = "";
};

const translateImage = async () => {
  if (!imageBase64.value || imageTranslating.value) return;
  imageTranslating.value = true;
  imageError.value = "";
  imageResult.value = "";
  const toName =
    languages.find((l) => l.code === targetLang.value)?.name ||
    targetLang.value;
  // 2 urinish: rate-limit bo'lsa server aytgan vaqtcha kutib qayta uriniladi
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke("homework-ocr", {
        body: {
          imageBase64: imageBase64.value,
          mimeType: imageMimeType.value,
          question: `Rasmdagi BARCHA matnni aniqlab, ${toName} tiliga to'liq tarjima qil. Faqat tarjimani yoz, boshqa izoh qo'shma.`,
        },
      });
      if (error) throw error;
      imageResult.value = data?.text || "Tarjima topilmadi.";
      break;
    } catch (e: any) {
      console.error("image translate error:", e);
      // FunctionsHttpError bo'lsa, .context — Response obyekti, uni o'qish kerak
      const providerMessage = e?.context?.json
        ? await e.context
            .json()
            .then((body: any) => body?.error)
            .catch(() => "")
        : "";
      const msg = String(providerMessage || e?.message || "");

      // "Please try again in 24.36s" → avtomatik kutib qayta urinish (1 marta)
      const waitMatch =
        attempt === 0 ? msg.match(/try again in ([\d.]+)\s*s/i) : null;
      if (waitMatch) {
        const secs = Math.min(30, Math.ceil(parseFloat(waitMatch[1])) + 1);
        imageError.value = `AI band — ${secs} soniyadan keyin avtomatik qayta uriniladi...`;
        await new Promise((r) => setTimeout(r, secs * 1000));
        imageError.value = "";
        continue;
      }

      if (msg.includes("does not exist") || msg.includes("not_found")) {
        imageError.value =
          "Server'dagi funksiya eskirgan — yangi versiyani deploy qiling: supabase functions deploy homework-ocr";
      } else if (
        msg.includes("Failed to send") ||
        msg.includes("Failed to fetch")
      ) {
        imageError.value =
          "Serverga ulanmadi — funksiya deploy qilinganini tekshiring (supabase functions deploy homework-ocr).";
      } else if (
        msg.includes("limit") ||
        msg.includes("rate") ||
        msg.includes("429")
      ) {
        imageError.value =
          "Bir daqiqada juda ko'p so'rov yuborildi — 1 daqiqa kutib qayta urining.";
      } else if (msg.toLowerCase().includes("too large")) {
        imageError.value =
          "Rasm juda katta — kichikroq rasm bilan urinib ko'ring.";
      } else {
        imageError.value =
          providerMessage || "Tarjimada xatolik. Qayta urinib ko'ring.";
      }
      break;
    }
  }
  imageTranslating.value = false;
};

const normalizeLevel = (lvl: string) => {
  const clean = (lvl || "").trim().toUpperCase();
  return cefrOrder.includes(clean) ? clean : "B1";
};

const translateText = async () => {
  if (!sourceText.value.trim() || translating.value) return;
  translating.value = true;
  wordSaved.value = false;
  errorMsg.value = "";
  translatedText.value = "";
  currentLevel.value = "";
  synonyms.value = [];
  usageExample.value = "";

  const fromName =
    languages.find((l) => l.code === sourceLang.value)?.name ||
    "aniqlanmagan (o'zingiz aniqlang)";
  const toName =
    languages.find((l) => l.code === targetLang.value)?.name ||
    targetLang.value;
  const text = sourceText.value.trim();

  try {
    const result = await askAIJson<{
      translated: string;
      level: string;
      detected: string;
      synonyms: string[];
      usage_example: string;
    }>(
      `Sen professional tarjimonsan va leksikografsan. ${fromName === "aniqlanmagan (o'zingiz aniqlang)" ? `"${text}" matnining tilini O'ZING aniqla` : `"${text}" matnini/so'zini ${fromName} tilidan`} ${toName} tiliga tarjima qil. Agar bitta so'z bo'lsa: 1) so'zning ${toName} tilidagi sinonimlarini top (3-5 ta, ${toName} tilida yoz); 2) so'zning ${toName} tilidagi gapda qo'llanilishini ko'rsatuvchi bitta misol gap yoz (${toName} tilida). Agar uzun matn bo'lsa: sinonimlar bo'sh massiv, usage_example bo'sh string bo'lsin. Shuningdek, asl so'zning CEFR darajasini aniqla. "detected" maydoniga matn tilining nomini yoz (masalan "O'zbek", "English"). Faqat JSON formatda javob ber: {"translated":"tarjima","level":"B1","detected":"til nomi","synonyms":["so'z1","so'z2"],"usage_example":"misol gap"}`,
      { translated: "", level: "", detected: "", synonyms: [], usage_example: "" },
    );

    if (!result?.translated?.trim()) {
      errorMsg.value = "Tarjima topilmadi. Qayta urinib ko'ring.";
    } else {
      translatedText.value = result.translated.trim();
      currentLevel.value = normalizeLevel(result.level);
      detectedLang.value = (result.detected || "").trim();
      synonyms.value = (result.synonyms || [])
        .filter((s) => typeof s === "string" && s.trim())
        .slice(0, 5);
      usageExample.value = (result.usage_example || "").trim();
      resultKey.value++;
      recentTranslations.value.unshift({
        source: text,
        translated: translatedText.value,
        level: currentLevel.value,
      });
      if (recentTranslations.value.length > 6) recentTranslations.value.pop();
    }
  } catch (e) {
    console.error("translate error:", e);
    errorMsg.value = "Xatolik yuz berdi. Qayta urinib ko'ring.";
  }
  translating.value = false;
};

// Sinonimga bosilganda — uni o'ziga tarjima qiladi (chain lookup)
const lookupSynonym = (s: string) => {
  sourceText.value = s;
  sourceLang.value = targetLang.value;
  translateText();
};

// Tozalash + nusxalash (Google Translate uslubi)
const clearSource = () => {
  sourceText.value = "";
  translatedText.value = "";
  currentLevel.value = "";
  synonyms.value = [];
  usageExample.value = "";
  errorMsg.value = "";
  detectedLang.value = "";
};

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(translatedText.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    /* clipboard mavjud emas */
  }
};

const swapLanguages = () => {
  swapped.value = !swapped.value;
  // "auto" tanlangan bo'lsa — aniqlangan tilga almashtirish
  const temp =
    sourceLang.value === "auto"
      ? detectedLang.value
        ? (languages.find((l) => l.name === detectedLang.value)?.code ?? "uz")
        : "uz"
      : sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = temp;
  sourceText.value = translatedText.value;
  translatedText.value = "";
  currentLevel.value = "";
  synonyms.value = [];
  usageExample.value = "";
  errorMsg.value = "";
  detectedLang.value = "";
};

const reuse = (item: { source: string; translated: string; level: string }) => {
  sourceText.value = item.source;
  translatedText.value = item.translated;
  currentLevel.value = item.level;
  resultKey.value++;
};

const speak = (text: string, lang: string) => {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang =
    {
      uz: "uz-UZ",
      ru: "ru-RU",
      ar: "ar-SA",
      tr: "tr-TR",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      zh: "zh-CN",
      ko: "ko-KR",
      ja: "ja-JP",
      it: "it-IT",
      en: "en-US",
    }[lang] || "en-US";
  speechSynthesis.speak(utterance);
};

const saveWord = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("word_list").insert({
      user_id: user.id,
      word: sourceText.value.trim(),
      translation: translatedText.value,
    });
    wordSaved.value = true;
    setTimeout(() => {
      wordSaved.value = false;
    }, 2000);
  } catch (e) {
    console.error("saveWord error:", e);
  }
};
</script>

<style scoped>
@keyframes pop {
  0% {
    opacity: 0;
    transform: scale(0.94) translateY(2px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-pop {
  animation: pop 0.25s ease-out;
}

.pop-enter-active {
  transition: all 0.25s ease-out;
}

.pop-leave-active {
  transition: all 0.15s ease-in;
}

.pop-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.pop-leave-to {
  opacity: 0;
}

.row-enter-active,
.row-leave-active {
  transition: all 0.25s ease;
}

.row-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.row-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* Rasm ustida scan animatsiyasi */
.scan-line {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(249, 115, 22, 0.15) 45%,
    rgba(249, 115, 22, 0.5) 50%,
    rgba(249, 115, 22, 0.15) 55%,
    transparent 100%
  );
  background-size: 100% 200%;
  animation: scanMove 1.8s ease-in-out infinite;
}

@keyframes scanMove {
  0% {
    background-position: 0 -100%;
  }

  100% {
    background-position: 0 200%;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
