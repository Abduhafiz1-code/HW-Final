<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <QuizPageHeader
        title="Uy vazifasi yordamchisi"
        subtitle="Suratga ol — AI yechib beradi"
        :icon="ScanLine"
        icon-bg-class="bg-gradient-to-br from-orange-400 to-orange-600"
        back-to="/" />

      <!-- Limit ko'rsatkichi -->
      <div v-if="!isPremium" class="mb-4 flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm">
        <p
          class="text-xs font-bold flex items-center gap-1.5"
          :class="remaining > 0 ? 'text-slate-500 dark:text-slate-300' : 'text-red-500'">
          <Sparkles :size="14" :class="remaining > 0 ? 'text-orange-500' : 'text-red-500'" />
          {{
            remaining > 0
              ? `Bugun ${remaining} ta bepul skaner qoldi`
              : "Kunlik 5 ta limit tugadi"
          }}
        </p>
        <RouterLink
          to="/premium"
          class="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline">
          <Crown :size="13" /> Premium = cheksiz
        </RouterLink>
      </div>
      <p v-else
        class="mb-4 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-500/30 rounded-2xl px-4 py-2.5 text-xs font-black text-amber-600 dark:text-amber-400">
        <Crown :size="14" /> Premium — cheksiz skaner 🎉
      </p>

      <!-- Kamera / yuklash -->
      <HomeworkCamera ref="camera" @solve="solve" />
      <p
        v-if="errorMsg"
        class="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ errorMsg }}
      </p>

      <!-- Natija: AI yechimi -->
      <Transition name="fade">
        <div v-if="solution" class="mt-5 space-y-4">
          <div
            class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-pop">
            <div class="flex items-center justify-between mb-4">
              <h2
                class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span
                  class="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <CheckCircle :size="16" class="text-white" />
                </span>
                Yechim tayyor!
              </h2>
              <button
                @click="shareSolution"
                class="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 text-xs font-black flex items-center gap-1 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition active:scale-95">
                <Share2 :size="13" /> Ulashish
              </button>
            </div>
            <!-- AI yechimi: rang-barang, o'qishga oson bloklar (SolutionRenderer) -->
            <SolutionRenderer :text="solution" />
          </div>
          <button
            @click="
              camera?.reset();
              solution = '';
            "
            class="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm">
            Yana bir masala
          </button>
        </div>
      </Transition>
    </div>
    <OnboardingTooltip
      pageId="Homework"
      title="Uy vazifasi yordamchisi"
      description="Masalani suratga olding — AI bosqichma-bosqich yechib beradi" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ScanLine, Sparkles, CheckCircle, Share2, Crown } from "@lucide/vue";
import supabase from "../supabase";
import {
  checkHomeworkLimit,
  useHomeworkQuota,
  HOMEWORK_DAILY_LIMIT,
} from "../lib/premium";
import { compressImage } from "../lib/image";
import QuizPageHeader from "../components/quiz/QuizPageHeader.vue";
import HomeworkCamera from "../components/HomeworkCamera.vue";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";
import SolutionRenderer from "../components/SolutionRenderer.vue";

const camera = ref<InstanceType<typeof HomeworkCamera> | null>(null);
const solution = ref("");
const analyzing = ref(false);
const remaining = ref(HOMEWORK_DAILY_LIMIT);
const isPremium = ref(false);
const errorMsg = ref("");

onMounted(async () => {
  const limit = await checkHomeworkLimit();
  isPremium.value = limit.premium;
  remaining.value = limit.premium ? Infinity : limit.remaining;
});

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
void fileToBase64; // compressImage ishlatiladi (eski util saqlangan)

const solve = async (file: File) => {
  errorMsg.value = "";
  solution.value = "";
  analyzing.value = true;
  camera.value?.setAnalyzing(true);
  try {
    const limit = await checkHomeworkLimit();
    if (!limit.allowed) {
      errorMsg.value =
        "Bugungi 5 ta bepul skaner tugadi! Premium olsangiz cheksiz ishlatasiz.";
      return;
    }
    // Siqish: kamera rasmlari ~3-5MB → ~200-400KB (token tejash + tezroq yuklash)
    const { base64, mimeType } = await compressImage(file, {
      maxDimension: 1600,
      maxBytes: 1_200_000,
    });
    const { data, error } = await supabase.functions.invoke("homework-ocr", {
      body: { imageBase64: base64, mimeType },
    });
    if (error) throw error;
    const text = data?.text || "";
    if (!text) throw new Error("empty");
    solution.value = text;
    if (!limit.premium) useHomeworkQuota(); // faqat muvaffaqiyatli bo'lsa hisoblaymiz
    const updated = await checkHomeworkLimit();
    remaining.value = updated.premium ? Infinity : updated.remaining;
  } catch (e) {
    console.error("homework solve xato:", e);
    const providerMessage = (e as any)?.context?.json
      ? await (e as any).context
          .json()
          .then((body: any) => body?.error)
          .catch(() => "")
      : "";
    const raw = String(providerMessage || "");
    errorMsg.value =
      raw.includes("limit") || raw.includes("429")
        ? "Bir daqiqada juda ko'p so'rov yuborildi — 1 daqiqa kutib qayta urining."
        : providerMessage ||
          "Yechim olishda xatolik. Rasm aniq ekanini tekshirib, qayta urinib ko'ring.";
  } finally {
    analyzing.value = false;
    camera.value?.setAnalyzing(false);
  }
};

const shareSolution = async () => {
  try {
    const url = window.location.origin;
    if ((navigator as any).share) {
      await (navigator as any).share({
        title: "Uy vazifam yechildi!",
        text: solution.value.slice(0, 300),
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(
      `${solution.value.slice(0, 300)}\n${url}`,
    );
  } catch {
    /* bekor qilindi */
  }
};
</script>
