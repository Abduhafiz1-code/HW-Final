<template>
  <div @click="emit('click')" class="rounded-3xl border border-base-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:border-orange-200 active:scale-[0.98]">
    <div class="flex items-center justify-between gap-3">
      <div class="text-3xl">{{ icon }}</div>
      <span class="badge badge-outline badge-secondary">{{ badge }}</span>
    </div>
    <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ title }}</h3>
    <p class="mt-2 text-sm text-slate-700">{{ description }}</p>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ icon: string; badge: string; title: string; description: string; }>();
const emit = defineEmits(['click']);
</script>
