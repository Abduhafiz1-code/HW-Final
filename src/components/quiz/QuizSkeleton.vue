<template>
  <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
    <div class="flex items-center gap-2 text-sm font-bold text-orange-500">
      <Loader :size="16" class="animate-spin" /> {{ label }}
    </div>
    <div class="skeleton h-5 w-4/5 rounded-xl"></div>
    <div class="grid grid-cols-1 gap-2.5">
      <div v-for="i in 4" :key="i" class="skeleton h-12 rounded-2xl"
        :style="{ animationDelay: `${i * 120}ms`, opacity: 1 - (i - 1) * 0.15 }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from '@lucide/vue';

withDefaults(defineProps<{ label?: string }>(), {
  label: 'AI savollarni tayyorlamoqda...',
});
</script>
