<template>
  <div class="flex items-center gap-3 mb-6">
    <RouterLink :to="backTo"
      class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition shadow-sm">
      <ArrowLeft :size="18" />
    </RouterLink>
    <div class="min-w-0">
      <h1 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
        <span v-if="icon"
          class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="iconBgClass">
          <component :is="icon" :size="16" class="text-white" />
        </span>
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ subtitle }}</p>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ArrowLeft } from '@lucide/vue';

withDefaults(defineProps<{
  title: string;
  subtitle?: string;
  icon?: any;
  /** gradient classes for the icon chip */
  iconBgClass?: string;
  backTo?: string;
}>(), { backTo: '/' });
</script>
