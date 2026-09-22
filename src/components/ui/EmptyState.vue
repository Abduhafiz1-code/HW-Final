<template>
  <div class="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
    <div
      class="w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-sm"
      :class="iconBg">
      <component :is="icon" :size="30" :class="iconClass" />
    </div>
    <p class="font-black text-slate-700 dark:text-slate-200 text-sm">{{ title }}</p>
    <p v-if="description" class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[260px] leading-relaxed">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

withDefaults(
  defineProps<{
    icon: Component;
    title: string;
    description?: string;
    iconBg?: string;
    iconClass?: string;
  }>(),
  {
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconClass: "text-orange-500",
    description: "",
  },
);
</script>
