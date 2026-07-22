<template>
  <div v-if="error" class="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-white dark:bg-slate-900">
    <div class="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
      <TriangleAlert :size="28" class="text-red-400" />
    </div>
    <h2 class="text-lg font-black text-slate-900 dark:text-white">Nimadir xato ketdi</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
      Sahifani qayta yuklab ko'ring. Agar xato takrorlansa, ilovadan chiqib qayta kiring.
    </p>
    <div class="flex gap-2">
      <button @click="reload"
        class="bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white font-bold text-sm px-5 py-2.5 rounded-xl">
        Qayta yuklash
      </button>
      <RouterLink to="/" @click="error = false"
        class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm px-5 py-2.5 rounded-xl">
        Bosh sahifa
      </RouterLink>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, watch } from 'vue';
import { useRoute } from 'vue-router';
import { TriangleAlert } from '@lucide/vue';

const error = ref(false);
const route = useRoute();

onErrorCaptured((err) => {
  console.error("Ilova xatosi:", err);
  error.value = true;
  return false; // xato yuqoriga tarqalib, butun ilovani buzib qo'ymasin
});

// Foydalanuvchi boshqa sahifaga o'tsa, xato holatini tozalab qo'yamiz
watch(() => route.fullPath, () => {
  error.value = false;
});

const reload = () => window.location.reload();
</script>
