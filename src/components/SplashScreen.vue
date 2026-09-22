<template>
  <!-- Genshin Impact uslubidagi kirish ekrani: serdecorativ "SOCRATI" logotipi,
       oltin gradient, naqsh bezaklar, zarrachalar va progress bar.
       Har browser sessiyasida bir marta. -->
  <Transition name="splash">
    <div v-if="visible"
      class="fixed inset-0 z-[10000] overflow-hidden select-none"
      :class="night ? 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900' : 'bg-gradient-to-b from-sky-950 via-indigo-900 to-purple-950'">

      <!-- Fon: sekin aylanuvchi nur halolari + yulduzlar -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120vmin] h-[120vmin] rounded-full opacity-25 blur-3xl animate-splash-halo"
          style="background: radial-gradient(circle, rgba(251,191,36,0.45), transparent 60%)"></div>
        <div class="absolute -bottom-1/4 left-1/4 w-[90vmin] h-[90vmin] rounded-full opacity-20 blur-3xl animate-splash-halo-rev"
          style="background: radial-gradient(circle, rgba(139,92,246,0.5), transparent 60%)"></div>
        <span v-for="p in PARTICLES" :key="p.id" class="absolute rounded-full bg-white animate-splash-star"
          :style="{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.dur }"></span>
      </div>

      <!-- Markaziy kontent -->
      <div class="relative z-10 h-full flex flex-col items-center justify-center gap-4 px-8">

        <!-- Yuqori naqsh chizig'i -->
        <div class="flex items-center gap-3 animate-splash-letter" style="animation-delay: 0.35s">
          <span class="block w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent to-amber-300/80"></span>
          <Sparkle :size="18" class="text-amber-300 animate-splash-twinkle" />
          <span class="block w-16 sm:w-24 h-[1.5px] bg-gradient-to-l from-transparent to-amber-300/80"></span>
        </div>

        <!-- SOCRATI: serdecorativ oltin yozuv, harfma-harf ochiladi -->
        <h1 class="splash-logo-font flex items-baseline justify-center leading-none"
          aria-label="Socrati">
          <span v-for="(ch, i) in TITLE" :key="i"
            class="splash-gold-text inline-block animate-splash-letter drop-shadow-[0_4px_24px_rgba(251,191,36,0.35)]"
            :style="{ animationDelay: `${0.5 + i * 0.12}s`, fontSize: 'clamp(3rem, 11vw, 5.5rem)' }">
            {{ ch }}
          </span>
        </h1>

        <!-- Pastki naqsh chizig'i + HOMETASK yozuvi (Genshin'dagi "IMPACT" kabi) -->
        <div class="flex flex-col items-center gap-2 animate-splash-letter" style="animation-delay: 1.6s">
          <div class="flex items-center gap-2.5">
            <span class="block w-10 h-[1px] bg-gradient-to-r from-transparent to-amber-300/70"></span>
            <Diamond :size="10" class="text-amber-300/90" />
            <span class="block w-10 h-[1px] bg-gradient-to-l from-transparent to-amber-300/70"></span>
          </div>
          <p class="splash-sub-font text-white/85 font-bold"
            style="font-size: clamp(0.7rem, 2.6vw, 1rem); letter-spacing: 0.55em; text-indent: 0.55em">
            HOMEWORK HELPER
          </p>
        </div>

        <!-- Progress bar -->
        <div class="w-56 h-1.5 rounded-full bg-white/15 overflow-hidden mt-5 animate-splash-letter"
          style="animation-delay: 1.8s">
          <div class="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 animate-splash-bar"></div>
        </div>

        <!-- Bosing holati: progress tugagach -->
        <Transition name="splash-fade">
          <button v-if="ready" @click="close"
            class="mt-2 flex flex-col items-center gap-1 text-white/90 hover:text-white group">
            <span class="text-sm font-black tracking-widest uppercase group-hover:scale-105 transition-transform">
              Bosing
            </span>
            <span class="w-8 h-[2px] rounded-full bg-white/70 group-hover:w-12 transition-all"></span>
          </button>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Sparkle, Diamond } from "@lucide/vue";
import { playChime } from "../lib/sound";

const emit = defineEmits<{ done: [] }>();

const TITLE = "SOCRATI";
const visible = ref(true);
const ready = ref(false);
let timers: number[] = [];

// Yulduz zarrachalar (deterministik)
const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: `${1.5 + ((i * 13) % 3)}px`,
  delay: `${(i % 10) * 0.35}s`,
  dur: `${2.2 + (i % 5) * 0.5}s`,
}));

const night = new Date().getHours() >= 20 || new Date().getHours() < 6;

const close = () => {
  visible.value = false;
  emit("done");
};

onMounted(() => {
  // 🔊 Kirish qo'ng'irog'i: logo harflari ochilishi bilan sokin chime
  timers.push(window.setTimeout(playChime, 700));
  timers.push(window.setTimeout(() => (ready.value = true), 2400));
  // Avtomatik yopish (user bosmasa ham)
  timers.push(window.setTimeout(close, 5400));
});

onUnmounted(() => timers.forEach(clearTimeout));
</script>

<style scoped>
/* Serdecorativ shrift: Genshin logotipidagi kabi klassik-serif qiyofa */
@import url("https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700&display=swap");

.splash-logo-font {
  font-family: "Cinzel Decorative", "Cinzel", serif;
}

.splash-sub-font {
  font-family: "Cinzel", serif;
  text-transform: uppercase;
}

/* Oltin gradient matn (Genshin oltin-yaltiroq logotipi uslubi) */
.splash-gold-text {
  background: linear-gradient(
    180deg,
    #fff7d6 0%,
    #fde68a 32%,
    #f59e0b 62%,
    #b45309 88%,
    #fbbf24 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 1px rgba(120, 53, 15, 0.35);
  paint-order: stroke fill;
  filter: drop-shadow(0 2px 0 rgba(255, 255, 255, 0.15));
}

@keyframes splashHalo {
  0%, 100% { transform: translate(-50%, 0) scale(1) rotate(0deg); opacity: 0.25; }
  50% { transform: translate(-50%, 0) scale(1.15) rotate(25deg); opacity: 0.4; }
}

.animate-splash-halo { animation: splashHalo 7s ease-in-out infinite; }

@keyframes splashHaloRev {
  0%, 100% { transform: scale(1.1) rotate(0deg); opacity: 0.2; }
  50% { transform: scale(0.95) rotate(-20deg); opacity: 0.35; }
}

.animate-splash-halo-rev { animation: splashHaloRev 9s ease-in-out infinite; }

@keyframes splashStar {
  0%, 100% { opacity: 0.1; transform: scale(0.6); }
  50% { opacity: 0.95; transform: scale(1.4); }
}

.animate-splash-star { animation: splashStar 3s ease-in-out infinite; }

@keyframes splashTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.7) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.25) rotate(25deg); }
}

.animate-splash-twinkle { animation: splashTwinkle 2s ease-in-out infinite; }

@keyframes splashLetter {
  0% { opacity: 0; transform: translateY(18px) scale(0.7); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.animate-splash-letter { animation: splashLetter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

@keyframes splashBar {
  0% { width: 0%; }
  60% { width: 62%; }
  100% { width: 100%; }
}

.animate-splash-bar { animation: splashBar 2.4s ease-in-out both; }

/* Chiqish: nur portlashi bilan yopiladi */
.splash-leave-active { transition: opacity 0.55s ease, transform 0.55s ease; }
.splash-leave-to { opacity: 0; transform: scale(1.08); filter: blur(6px); }

.splash-fade-enter-active { transition: all 0.4s ease; }
.splash-fade-enter-from { opacity: 0; transform: translateY(6px); }

@media (prefers-reduced-motion: reduce) {
  .animate-splash-halo, .animate-splash-halo-rev, .animate-splash-star,
  .animate-splash-twinkle, .animate-splash-letter, .animate-splash-bar {
    animation: none !important;
    opacity: 1;
  }
}
</style>
