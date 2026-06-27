<!-- <script setup>
import { onMounted } from "vue";
import { useProgressStore } from "../stores/ProgressStore";

const progressStore = useProgressStore();

onMounted(() => {
  progressStore.fetchProgress();
});
</script>

<template>
  <div
    class="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
    <div>
      <p class="font-bold text-black">Your Progress</p>
      <p class="text-sm text-gray-500">Keep up the good work!</p>
    </div>

    <span v-if="progressStore.loading" class="text-gray-400">...</span>

    <div v-else class="relative w-20 h-20">
      <svg viewBox="0 0 36 36" class="w-20 h-20 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#e5e7eb"
          stroke-width="3.8" />

        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#f97316"
          stroke-width="3.8"
          :stroke-dasharray="`${progressStore.progressPercent} 100`"
          stroke-linecap="round"
          style="transition: stroke-dasharray 0.6s ease" />
      </svg>

      <span
        class="absolute inset-0 flex items-center justify-center text-orange-500 font-bold text-sm">
        {{ progressStore.progressPercent }}%
      </span>
    </div>
  </div>
</template> -->
