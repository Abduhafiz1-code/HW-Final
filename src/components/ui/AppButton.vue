<template>
  <component
    :is="to ? RouterLink : 'button'"
    v-bind="to ? { to } : { type: 'button', disabled: disabled || loading }"
    :class="[base, sizes[size], variants[variant], disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:shadow-md']"
    class="inline-flex items-center justify-center gap-1.5 transition-all duration-200 select-none">
    <Loader2 v-if="loading" :size="14" class="animate-spin" />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Loader2 } from "@lucide/vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "danger" | "info";
    size?: "sm" | "md" | "lg";
    to?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  { variant: "primary", size: "md", loading: false, disabled: false },
);

const base =
  "font-black rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/40";

const variants: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200 dark:shadow-none hover:from-orange-600 hover:to-orange-700",
  secondary:
    "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600",
  ghost:
    "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-100 dark:shadow-none",
  info: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800",
};

const sizes: Record<string, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3.5",
};
</script>
