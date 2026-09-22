<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
    <div class="mb-4 flex justify-center">
      <span v-if="trophy"
        class="w-16 h-16 rounded-3xl flex items-center justify-center animate-bounce-slow"
        :class="badgeClass">
        <Trophy :size="34" class="text-white" />
      </span>
      <span v-else class="w-16 h-16 rounded-3xl flex items-center justify-center"
        :class="badgeClass">
        <ThumbsUp :size="34" class="text-white" />
      </span>
    </div>
    <h2 class="text-2xl font-black text-slate-900 dark:text-white">{{ title }}</h2>
    <p v-if="$slots.default" class="text-slate-500 dark:text-slate-400 mt-1 text-sm"><slot /></p>

    <div class="mt-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
      <p class="text-4xl font-black tabular-nums" :class="percent >= 70 ? 'text-green-600' : 'text-orange-500'">
        {{ percent }}%
      </p>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ detail }}</p>
      <div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mt-3 overflow-hidden">
        <div :class="percent >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-500'"
          class="h-3 rounded-full transition-all duration-700" :style="{ width: `${percent}%` }" />
      </div>
    </div>

    <p class="mt-4 font-bold text-slate-700 dark:text-slate-300">{{ encouragement }}</p>
    <slot name="extra" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Trophy, ThumbsUp } from '@lucide/vue';

const props = withDefaults(defineProps<{
  title?: string;
  percent: number;
  detail: string;
  trophy?: boolean;
}>(), { title: 'Yakunlandi!' });

const encouragement = computed(() =>
  props.percent >= 90 ? "Ajoyib! Siz zo'rsiz!"
    : props.percent >= 70 ? "Yaxshi natija! Davom eting!"
      : props.percent >= 50 ? "Yaxshi harakat! Ko'proq mashq qiling!"
        : "Tushkunlikka tushmang — qayta urinib ko'ring!",
);

const badgeClass = computed(() =>
  props.percent >= 70
    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-amber-200 dark:shadow-none'
    : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700',
);
</script>
