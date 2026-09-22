<template>
  <div class="space-y-4">
    <!-- Yashirin file input (kamera + galereya) -->
    <input ref="fileInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onFilePicked" />

    <!-- Rasm tanlanmagan holat: katta yuklash maydoni -->
    <div v-if="!previewUrl && !analyzing" @click="fileInput?.click()"
      class="relative rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-10 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 dark:hover:bg-slate-700 transition-all group">
      <div class="flex justify-center mb-4">
        <span
          class="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none group-hover:scale-110 transition-transform">
          <Camera :size="30" class="text-white" />
        </span>
      </div>
      <p class="font-black text-slate-900 dark:text-white">Uy vazifasini suratga oling</p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">AI masalani o'qib, bosqichma-bosqich yechib beradi</p>
      <div class="flex justify-center gap-2 mt-4 text-xs font-bold text-slate-400">
        <span class="bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-1.5">📸 Kamera</span>
        <span class="bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-1.5">🖼 Galereya</span>
      </div>
    </div>

    <!-- Rasm tanlangan: preview + tugmalar -->
    <div v-if="previewUrl" class="space-y-3">
      <div class="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm animate-pop">
        <img :src="previewUrl" alt="Uy vazifasi rasmi" class="w-full max-h-80 object-contain bg-slate-50 dark:bg-slate-900" />
        <!-- Analyzing overlay: scan chizig'i animatsiyasi -->
        <div v-if="analyzing" class="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div class="absolute inset-x-8 h-0.5 bg-orange-400 shadow-[0_0_12px_2px_rgba(249,115,22,0.8)] animate-scan"></div>
          <div class="bg-white/95 dark:bg-slate-800 rounded-2xl px-5 py-3 text-center relative">
            <p class="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Loader :size="15" class="animate-spin text-orange-500" /> AI masalani o'qimoqda...
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rasm tahlil qilinmoqda</p>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="reset"
          :disabled="analyzing"
          class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition text-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
          <RotateCcw :size="15" /> Boshqa rasm
        </button>
        <button @click="$emit('solve', file!)"
          :disabled="analyzing"
          class="flex-[2] py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 active:scale-95 transition text-sm shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-1.5">
          <Sparkles :size="15" /> {{ analyzing ? 'Tahlil qilinmoqda...' : 'Yechimni olish' }}
        </button>
      </div>
    </div>

    <!-- Xato xabari -->
    <Transition name="fade">
      <div v-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl px-4 py-3 text-sm text-red-600 dark:text-red-300 font-bold flex items-center gap-2">
        <XCircle :size="16" class="flex-shrink-0" /> {{ error }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { Camera, Loader, RotateCcw, Sparkles, XCircle } from '@lucide/vue';

const emit = defineEmits<{ (e: 'solve', file: File): void }>();

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref('');
const analyzing = ref(false);
const error = ref('');
let currentObjectUrl: string | null = null;
const file = ref<File | null>(null);

const onFilePicked = (e: Event) => {
  error.value = '';
  const input = e.target as HTMLInputElement;
  const picked = input.files?.[0];
  if (!picked) return;

  // Validatsiya: rasm va 8MB dan kichik (edge function limiti)
  if (!picked.type.startsWith('image/')) {
    error.value = 'Faqat rasm fayl tanlang.';
    input.value = '';
    return;
  }
  if (picked.size > 8 * 1024 * 1024) {
    error.value = 'Rasm juda katta (maks 8MB). Kichikroq suratga oling.';
    input.value = '';
    return;
  }

  file.value = picked;
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(picked);
  previewUrl.value = currentObjectUrl;
  input.value = '';
};

const reset = () => {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = null;
  previewUrl.value = '';
  file.value = null;
  error.value = '';
};

const setAnalyzing = (v: boolean) => (analyzing.value = v);

onUnmounted(() => {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
});

defineExpose({ setAnalyzing, reset });
</script>

<style scoped>
@keyframes scan {
  0% { top: 12%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 88%; opacity: 0; }
}

.animate-scan {
  animation: scan 1.8s ease-in-out infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
