<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-3.5 mb-4 flex items-center gap-4 shadow-sm">
    <div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
      <div class="h-3 rounded-full transition-all duration-500 bg-gradient-to-r"
        :class="barClass" :style="{ width: pct + '%' }" />
    </div>
    <span class="text-sm font-black text-slate-600 dark:text-slate-300 tabular-nums flex-shrink-0">{{ current }}/{{ total
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  current: number;
  total: number;
  tone?: 'orange' | 'indigo' | 'green';
}>(), { tone: 'orange' });

const pct = computed(() =>
  props.total ? Math.min(100, Math.max(0, (props.current / props.total) * 100)) : 0,
);

const barClass = computed(() => ({
  orange: 'from-orange-400 to-orange-600',
  indigo: 'from-indigo-400 to-indigo-600',
  green: 'from-green-400 to-green-600',
}[props.tone]));
</script>
