<template>
  <div
    class="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
    <!-- Top banner -->
    <div
      class="bg-gradient-to-r from-orange-500 to-amber-400 px-5 pt-5 pb-8 relative overflow-hidden">
      <div
        class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10"></div>
      <div
        class="absolute -right-2 top-8 w-16 h-16 rounded-full bg-white/10"></div>
      <div class="flex items-center justify-between relative z-10">
        <div>
          <p class="text-orange-100 text-xs font-bold uppercase tracking-wider">
            Hisobingiz
          </p>
          <div class="flex items-end gap-1 mt-0.5">
            <span class="text-4xl font-black text-white">{{
              coinStore.coins
            }}</span>
            <span class="text-xl mb-1"
              ><Coins :size="26" class="text-white"
            /></span>
          </div>
          <div class="flex items-center gap-1 mt-1">
            <Gem :size="14" class="text-cyan-100" />
            <span class="text-cyan-50 text-xs font-black">{{
              coinStore.diamonds
            }}</span>
            <span class="text-cyan-100/80 text-[10px] font-semibold"
              >olmos</span
            >
          </div>
        </div>
        <!-- Ring -->
        <div class="relative w-16 h-16">
          <svg class="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              stroke-width="6" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="white"
              stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="`${2 * Math.PI * 26}`"
              :stroke-dashoffset="`${2 * Math.PI * 26 * (1 - cyclePercent / 100)}`"
              class="transition-all duration-700" />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs font-black text-white"
              >{{ cyclePercent }}%</span
            >
          </div>
        </div>
      </div>
      <!-- Progress -->
      <div class="mt-4 relative z-10">
        <div
          class="flex justify-between text-[11px] text-orange-100 font-semibold mb-1">
          <span>Umumiy progress</span>
          <span>{{ coinStore.progress }} ball</span>
        </div>
        <div class="h-1.5 rounded-full bg-white/25">
          <div
            class="h-1.5 rounded-full bg-white transition-all duration-500"
            :style="{ width: `${cyclePercent}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Milestone track: gorizontal skroll kartalar -->
    <div
      class="mx-4 -mt-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-md px-4 pt-4 pb-3 relative z-10">
      <p
        class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
        Progress sovg'alari
      </p>

      <div
        class="flex gap-3 overflow-x-auto pb-2 snap-x"
        style="scrollbar-width: none; -ms-overflow-style: none">
        <div
          v-for="m in visibleMilestones"
          :key="m"
          class="snap-start flex-shrink-0 w-[104px] rounded-2xl border-2 p-3 flex flex-col items-center gap-1.5 transition-all"
          :class="milestoneCardClass(m)">
          <!-- Holat ikonkasi -->
          <span
            class="w-12 h-12 rounded-2xl flex items-center justify-center"
            :class="milestoneIconBg(m)">
            <CheckCircle2
              v-if="coinStore.claimedMilestones.includes(m)"
              :size="26"
              class="text-green-600" />
            <Gift
              v-else-if="coinStore.canClaimMilestone(m)"
              :size="26"
              class="text-white animate-bounce" />
            <Lock v-else :size="22" class="text-slate-300 dark:text-slate-600" />
          </span>

          <!-- Aniq raqam -->
          <p class="text-[13px] font-black leading-none"
            :class="coinStore.canClaimMilestone(m) ? 'text-orange-600' : 'text-slate-700 dark:text-slate-200'">
            +{{ 10 }} tanga
          </p>
          <p class="text-[10px] font-bold text-slate-400">
            {{ m }} ball
            <span
              v-if="!coinStore.claimedMilestones.includes(m) && !coinStore.canClaimMilestone(m)"
              class="text-slate-300 dark:text-slate-600">
              · {{ Math.max(0, m - coinStore.progress) }} qoldi
            </span>
          </p>
          <button
            v-if="coinStore.canClaimMilestone(m)"
            @click="coinStore.claimMilestone(m)"
            class="w-full py-1.5 rounded-xl bg-orange-500 text-white text-[10px] font-black hover:bg-orange-600 active:scale-95 transition">
            Sovg'ani olish
          </button>
          <span
            v-else-if="coinStore.claimedMilestones.includes(m)"
            class="text-[10px] font-bold text-green-500">
            Olingan
          </span>
        </div>
      </div>
    </div>

    <!-- Hint -->
    <div class="px-4 pt-3 pb-4">
      <div
        v-if="hasClaimable"
        class="flex flex-col gap-2.5 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
        <div class="flex items-center gap-2">
          <Gift :size="20" class="text-orange-500 animate-bounce" />
          <p class="text-xs text-orange-600 font-bold">
            Sovg'angiz tayyor! Pastdagi kartadan yoki shu yerdan oling.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            @click="claim(1)"
            class="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white text-xs font-black py-2 rounded-xl">
            Oddiy sovg'a — +10 tanga
          </button>
          <button
            @click="claim(2)"
            :disabled="coinStore.diamonds < 20"
            :class="
              coinStore.diamonds < 20
                ? 'opacity-40 cursor-not-allowed bg-cyan-200'
                : 'bg-cyan-500 hover:bg-cyan-600 active:scale-95'
            "
            class="flex-1 flex items-center justify-center gap-1 transition text-white text-xs font-black py-2 rounded-xl">
            2x sovg'a <Gem :size="12" /> 20
          </button>
          <button
            @click="claim(3)"
            :disabled="coinStore.diamonds < 40"
            :class="
              coinStore.diamonds < 40
                ? 'opacity-40 cursor-not-allowed bg-purple-200'
                : 'bg-purple-500 hover:bg-purple-600 active:scale-95'
            "
            class="flex-1 flex items-center justify-center gap-1 transition text-white text-xs font-black py-2 rounded-xl">
            3x sovg'a <Gem :size="12" /> 40
          </button>
        </div>
      </div>
      <div
        v-else
        class="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
        <Award :size="20" class="text-orange-500" />
        <p class="text-xs text-slate-500 font-semibold">
          Keyingi sovg'a uchun
          <span class="text-orange-500 font-black">{{ remainingToNext }} ball</span>
          qoldi — test va mashqlar bilan to'plang!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Coins, CheckCircle2, Gift, Lock, Award, Gem } from "@lucide/vue";
import { useCoinStore } from "../stores/CoinStore";

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
  visibleMilestones.value.some((m) => coinStore.canClaimMilestone(m)),
);

const nextMilestone = computed(() => {
  return (
    visibleMilestones.value.find(
      (m) => !coinStore.claimedMilestones.includes(m) && coinStore.progress < m,
    ) ?? 0
  );
});

const remainingToNext = computed(() =>
  Math.max(0, nextMilestone.value - coinStore.progress),
);

const milestoneCardClass = (m: number) => {
  if (coinStore.claimedMilestones.includes(m))
    return "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800";
  if (coinStore.canClaimMilestone(m))
    return "bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border-orange-300 shadow-md shadow-orange-100 dark:shadow-none scale-[1.03]";
  return "bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700";
};

const milestoneIconBg = (m: number) => {
  if (coinStore.claimedMilestones.includes(m)) return "bg-green-100 dark:bg-green-900/30";
  if (coinStore.canClaimMilestone(m)) return "bg-orange-500";
  return "bg-slate-100 dark:bg-slate-700";
};

// Hozir olish mumkin bo'lgan birinchi milestone (multiplier bilan olish uchun)
const claimableMilestone = computed(() =>
  visibleMilestones.value.find((m) => coinStore.canClaimMilestone(m)),
);

const claim = (multiplier: 1 | 2 | 3) => {
  const m = claimableMilestone.value;
  if (m === undefined) return;
  coinStore.claimMilestone(m, multiplier);
};

onMounted(() => coinStore.fetchCoins());
</script>
