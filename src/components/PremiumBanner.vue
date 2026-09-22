<template>
  <!-- KATTA Premium hero-banner: kichik lenta emas, rasmdagi kabi to'liq banner -->
  <Transition name="banner">
    <div v-if="show"
      class="relative overflow-hidden rounded-[2rem] shadow-xl shadow-orange-200/60 dark:shadow-none animate-fade-in-up">
      <!-- Fon: katta gradient + shakl qatlamlari -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#7c3aed]"></div>
      <!-- Dekorativ organik shakllar (study-banner uslubi) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-amber-400/90 blur-[2px] animate-blob-a"></div>
        <div class="absolute -bottom-20 -right-10 w-56 h-56 rounded-[3rem] bg-amber-400/70 rotate-12 animate-blob-b"></div>
        <span v-for="s in 10" :key="s"
          class="absolute w-1.5 h-1.5 rounded-full bg-white/80 animate-twinkle"
          :style="{ left: `${6 + s * 9}%`, top: `${10 + (s % 5) * 18}%`, animationDelay: `${s * 0.35}s` }"></span>
      </div>

      <button @click="dismiss"
        class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition active:scale-90 z-20"
        title="Yopish">
        <X :size="17" />
      </button>

      <RouterLink to="/premium" class="relative z-10 flex items-center gap-5 px-6 py-6 group">
        <!-- Chap illyustratsiya: toj kartasi (mini-mashkot o'rnida) -->
        <div class="relative flex-shrink-0 hidden sm:flex">
          <span class="absolute -inset-3 rounded-[2rem] bg-amber-400/40 blur-xl animate-splash-glow"></span>
          <span
            class="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-2xl ring-4 ring-white/30 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300">
            <Crown :size="44" class="text-white drop-shadow-lg" />
          </span>
          <span class="absolute -top-1 -right-1 text-lg animate-splash-twinkle">✦</span>
        </div>

        <!-- Matn -->
        <div class="flex-1 min-w-0">
          <p class="text-amber-300 text-[11px] font-black uppercase tracking-[0.25em] mb-1">
            Special Offer
          </p>
          <h2 class="text-white font-black text-xl sm:text-2xl leading-tight drop-shadow-md">
            Premium ochib oling!
          </h2>
          <p class="text-blue-100/90 text-[13px] font-semibold mt-1.5 leading-snug">
            Cheksiz AI yordamchi · cheksiz skaner · tez javob ·
            <span class="text-amber-300 font-black">exsklyuziv ramkalar</span>
          </p>
          <span
            class="inline-flex items-center gap-1.5 mt-3.5 bg-white text-blue-700 rounded-full pl-3 pr-2 py-1.5 text-xs font-black shadow-md group-hover:gap-2.5 group-hover:shadow-lg transition-all">
            Boshlash
            <ChevronRight :size="14" />
          </span>
        </div>
      </RouterLink>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Crown, X, ChevronRight } from "@lucide/vue";
import { useAuthStore } from "../stores/AuthStore";

const authStore = useAuthStore();
const show = ref(false);

onMounted(async () => {
  if (authStore.isPremium) return;
  if (!authStore.user) {
    await new Promise((r) => setTimeout(r, 600));
    if (authStore.isPremium) return;
  }
  show.value = true;
});

const dismiss = () => {
  show.value = false;
};
</script>

<style scoped>
.banner-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.banner-leave-active {
  transition: all 0.22s ease-in;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}

@keyframes blobA {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(18px, 14px) scale(1.12); }
}

@keyframes blobB {
  0%, 100% { transform: translate(0, 0) rotate(12deg) scale(1); }
  50% { transform: translate(-14px, -10px) rotate(20deg) scale(0.94); }
}

.animate-blob-a { animation: blobA 9s ease-in-out infinite; }
.animate-blob-b { animation: blobB 11s ease-in-out infinite; }

@keyframes twinkleK {
  0%, 100% { opacity: 0.2; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.3); }
}

.animate-twinkle { animation: twinkleK 2.6s ease-in-out infinite; }

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.15); }
}

.animate-splash-glow { animation: glowPulse 2.6s ease-in-out infinite; }

@keyframes twinkleStar {
  0%, 100% { opacity: 0.3; transform: scale(0.7) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.25) rotate(25deg); }
}

.animate-splash-twinkle { animation: twinkleStar 2s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .animate-blob-a, .animate-blob-b, .animate-twinkle,
  .animate-splash-glow, .animate-splash-twinkle { animation: none !important; }
}
</style>
