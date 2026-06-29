<template>
  <div class="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
    <!-- Top banner -->
    <div class="bg-gradient-to-r from-orange-500 to-amber-400 px-5 pt-5 pb-8 relative overflow-hidden">
      <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10"></div>
      <div class="absolute -right-2 top-8 w-16 h-16 rounded-full bg-white/10"></div>
      <div class="flex items-center justify-between relative z-10">
        <div>
          <p class="text-orange-100 text-xs font-bold uppercase tracking-wider">Hisobingiz</p>
          <div class="flex items-end gap-1 mt-0.5">
            <span class="text-4xl font-black text-white">{{ coinStore.coins }}</span>
            <span class="text-xl mb-1">🪙</span>
          </div>
        </div>
        <!-- Ring -->
        <div class="relative w-16 h-16">
          <svg class="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="6" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"
              :stroke-dasharray="`${2 * Math.PI * 26}`"
              :stroke-dashoffset="`${2 * Math.PI * 26 * (1 - cyclePercent / 100)}`"
              class="transition-all duration-700" />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs font-black text-white">{{ cyclePercent }}%</span>
          </div>
        </div>
      </div>
      <!-- Progress -->
      <div class="mt-4 relative z-10">
        <div class="flex justify-between text-[11px] text-orange-100 font-semibold mb-1">
          <span>Umumiy progress</span>
          <span>{{ coinStore.progress }} ball</span>
        </div>
        <div class="h-1.5 rounded-full bg-white/25">
          <div class="h-1.5 rounded-full bg-white transition-all duration-500" :style="{ width: `${cyclePercent}%` }">
          </div>
        </div>
      </div>
    </div>

    <!-- Milestone track -->
    <div
      class="mx-4 -mt-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-md px-4 pt-4 pb-3 relative z-10">
      <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
        Progress sovg'alari
      </p>

      <div class="flex gap-3 overflow-x-auto pb-1" style="scrollbar-width: none;">
        <div v-for="m in visibleMilestones" :key="m" class="flex flex-col items-center gap-1 flex-shrink-0">
          <button @click="coinStore.claimMilestone(m)" :disabled="!coinStore.canClaimMilestone(m)" :class="[
            coinStore.claimedMilestones.includes(m)
              ? 'bg-green-100 border-green-300 cursor-default'
              : coinStore.canClaimMilestone(m)
                ? 'bg-orange-500 border-orange-400 animate-bounce shadow-lg shadow-orange-200'
                : 'bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed'
          ]" class="w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all">
            <span v-if="coinStore.claimedMilestones.includes(m)">✅</span>
            <span v-else-if="coinStore.canClaimMilestone(m)">🎁</span>
            <span v-else>🔒</span>
          </button>
          <p class="text-[10px] font-black text-slate-400">{{ m }}</p>
        </div>
      </div>
    </div>

    <!-- Hint -->
    <div class="px-4 pt-3 pb-4">
      <div v-if="hasClaimable"
        class="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2.5">
        <span class="text-base animate-bounce">🎁</span>
        <p class="text-xs text-orange-600 font-bold">Sovg'angiz tayyor! Bosib oling!</p>
      </div>
      <div v-else class="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
        <span class="text-base">📈</span>
        <p class="text-xs text-slate-500 font-semibold">
          Keyingi sovg'a: <span class="text-orange-500 font-black">{{ nextMilestone }}</span> progressda
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCoinStore } from '../stores/CoinStore';

const coinStore = useCoinStore();

const cyclePercent = computed(() => {
  const p = coinStore.progress % 100;
  return p === 0 && coinStore.progress > 0 ? 100 : p;
});

// Hozirgi progressgacha + 1 keyingi milestone ko'rinadi
const visibleMilestones = computed(() => {
  const max = Math.max(coinStore.progress, 100);
  const count = Math.ceil(max / 100) + 1;
  return Array.from({ length: count }, (_, i) => (i + 1) * 100);
});

const hasClaimable = computed(() =>
  visibleMilestones.value.some(m => coinStore.canClaimMilestone(m))
);

const nextMilestone = computed(() => {
  return visibleMilestones.value.find(m => !coinStore.claimedMilestones.includes(m) && coinStore.progress < m) ?? '?';
});

onMounted(() => coinStore.fetchCoins());
</script>