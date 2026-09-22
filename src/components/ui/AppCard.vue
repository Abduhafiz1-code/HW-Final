<template>
  <div
    class="rounded-3xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none p-5"
    :class="padding === 'none' ? '!p-0 overflow-hidden' : ''">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ padding?: "normal" | "none" }>(), {
  padding: "normal",
});
</script>
