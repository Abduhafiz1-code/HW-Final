<template>
  <button :disabled="disabled" @click="$emit('select', option)"
    class="w-full px-5 py-3.5 rounded-2xl border-2 text-left font-semibold text-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-default flex items-center gap-3"
    :class="stateClass">
    <span v-if="letter"
      class="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 border"
      :class="letterClass">{{ letter }}</span>
    <span class="min-w-0 break-words">{{ option }}</span>
    <span v-if="state === 'correct'" class="ml-auto flex-shrink-0">
      <CheckCircle :size="18" class="text-green-500" />
    </span>
    <span v-else-if="state === 'wrong'" class="ml-auto flex-shrink-0">
      <XCircle :size="18" class="text-red-500" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle, XCircle } from '@lucide/vue';

const props = defineProps<{
  option: string;
  /** A/B/C/D badge shown above 4 options */
  letter?: string;
  disabled?: boolean;
  state?: 'idle' | 'selected' | 'correct' | 'wrong';
}>();

defineEmits<{ (e: 'select', option: string): void }>();

const stateClass = computed(() => {
  switch (props.state) {
    case 'correct':
      return 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm shadow-green-100 dark:shadow-none';
    case 'wrong':
      return 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    case 'selected':
      return 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
    default:
      return 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-600';
  }
});

const letterClass = computed(() => {
  switch (props.state) {
    case 'correct':
      return 'border-green-400 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300';
    case 'wrong':
      return 'border-red-300 bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-300';
    case 'selected':
      return 'border-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300';
    default:
      return 'border-slate-200 dark:border-slate-500 bg-slate-50 dark:bg-slate-600 text-slate-400 dark:text-slate-300';
  }
});
</script>
