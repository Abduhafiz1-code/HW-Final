<template>
  <!-- overflow-visible: bezak elementlar (toj/qanot/uchqunlar) kesilmasin -->
  <div
    class="relative inline-flex items-center justify-center flex-shrink-0 overflow-visible"
    :style="{ width: size + 'px', height: size + 'px' }">
    <!-- Animatsiyali ramka SVG'lari -->
    <svg
      v-if="decorative"
      viewBox="-14 -14 128 128"
      overflow="visible"
      class="absolute z-20 pointer-events-none select-none overflow-visible"
      :style="{
        width: overlaySize + 'px',
        height: overlaySize + 'px',
        left: -overlayOffset + 'px',
        top: -overlayOffset + 'px',
        maxWidth: 'none',
        maxHeight: 'none',
      }">
      <defs>
        <!-- EPIC Flame: yonuvchi gradient -->
        <radialGradient id="epicFireG" cx="50%" cy="50%">
          <stop offset="55%" stop-color="#f97316" stop-opacity="0" />
          <stop offset="78%" stop-color="#f97316" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#dc2626" stop-opacity="0.6" />
        </radialGradient>
        <!-- EPIC Frost: muz kristalli gradient -->
        <radialGradient id="epicFrostG" cx="50%" cy="50%">
          <stop offset="55%" stop-color="#38bdf8" stop-opacity="0" />
          <stop offset="78%" stop-color="#38bdf8" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.6" />
        </radialGradient>
        <!-- LEGEND Star: oltin nur -->
        <radialGradient id="legendStarG" cx="50%" cy="50%">
          <stop offset="50%" stop-color="#fbbf24" stop-opacity="0" />
          <stop offset="75%" stop-color="#fbbf24" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#d97706" stop-opacity="0.7" />
        </radialGradient>
        <!-- LEGEND Storm: chaqmoq binafsha -->
        <radialGradient id="legendStormG" cx="50%" cy="50%">
          <stop offset="50%" stop-color="#a855f7" stop-opacity="0" />
          <stop offset="75%" stop-color="#a855f7" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.7" />
        </radialGradient>
        <!-- MYTHIC Galaxy: kosmik gradient -->
        <radialGradient id="mythicGalaxyG" cx="50%" cy="50%">
          <stop offset="45%" stop-color="#e879f9" stop-opacity="0" />
          <stop offset="70%" stop-color="#c026d3" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#4c1d95" stop-opacity="0.75" />
        </radialGradient>
        <!-- Hero metallari -->
        <linearGradient id="heroBronzeG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="50%" stop-color="#b45309" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="heroSilverG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e2e8f0" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <linearGradient id="heroGoldenG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="50%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#fde047" />
        </linearGradient>
      </defs>

      <!-- ═══════════ ANIMALS ═══════════ -->
      <g v-if="frame === 'cat-pink'">
        <path
          d="M22 24 L34 4 L42 30 Z"
          fill="#f9a8d4"
          stroke="#f472b6"
          stroke-width="2"
          stroke-linejoin="round" />
        <path
          d="M78 24 L66 4 L58 30 Z"
          fill="#f9a8d4"
          stroke="#f472b6"
          stroke-width="2"
          stroke-linejoin="round" />
        <path d="M27 20 L34 10 L38 26 Z" fill="#fce7f3" />
        <path d="M73 20 L66 10 L62 26 Z" fill="#fce7f3" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#f472b6"
          stroke-width="4" />
        <circle
          cx="50"
          cy="87"
          r="5"
          fill="#fbbf24"
          stroke="#f59e0b"
          stroke-width="1.5" />
      </g>

      <g v-else-if="frame === 'fox'">
        <path
          d="M18 26 L32 2 L44 28 Z"
          fill="#fb923c"
          stroke="#ea580c"
          stroke-width="2"
          stroke-linejoin="round" />
        <path
          d="M82 26 L68 2 L56 28 Z"
          fill="#fb923c"
          stroke="#ea580c"
          stroke-width="2"
          stroke-linejoin="round" />
        <path d="M24 22 L32 8 L37 24 Z" fill="#fff7ed" />
        <path d="M76 22 L68 8 L63 24 Z" fill="#fff7ed" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#fb923c"
          stroke-width="4" />
      </g>

      <g v-else-if="frame === 'frog'">
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#4ade80"
          stroke-width="4" />
        <circle
          cx="28"
          cy="16"
          r="10"
          fill="#bbf7d0"
          stroke="#4ade80"
          stroke-width="2" />
        <circle
          cx="72"
          cy="16"
          r="10"
          fill="#bbf7d0"
          stroke="#4ade80"
          stroke-width="2" />
        <circle cx="28" cy="16" r="4" fill="#166534" />
        <circle cx="72" cy="16" r="4" fill="#166534" />
        <path
          d="M10 76 C4 82, 4 92, 10 94 C14 88, 16 82, 20 78 Z"
          fill="#4ade80" />
        <path
          d="M90 76 C96 82, 96 92, 90 94 C86 88, 84 82, 80 78 Z"
          fill="#4ade80" />
      </g>

      <g v-else-if="frame === 'cat-dark'">
        <path
          d="M22 24 L34 4 L42 30 Z"
          fill="#312e5b"
          stroke="#818cf8"
          stroke-width="2"
          stroke-linejoin="round" />
        <path
          d="M78 24 L66 4 L58 30 Z"
          fill="#312e5b"
          stroke="#818cf8"
          stroke-width="2"
          stroke-linejoin="round" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#4c1d95"
          stroke-width="4" />
        <g class="af-spin-slow">
          <circle
            v-for="i in 10"
            :key="i"
            :cx="50 + 34 * Math.cos((i * 36 * Math.PI) / 180)"
            :cy="50 + 34 * Math.sin((i * 36 * Math.PI) / 180)"
            r="1.6"
            fill="#818cf8" />
        </g>
        <circle
          cx="50"
          cy="87"
          r="5"
          fill="#fbbf24"
          stroke="#f59e0b"
          stroke-width="1.5" />
      </g>

      <!-- ── Yurak-qanot (pushti) ─────────────────────────── -->
      <g v-else-if="frame === 'wings-pink'">
        <path
          d="M14 52 C4 46, 2 32, 10 22 C14 34, 18 40, 26 46 Z"
          fill="#fce7f3"
          stroke="#f9a8d4"
          stroke-width="2" />
        <path
          d="M86 52 C96 46, 98 32, 90 22 C86 34, 82 40, 74 46 Z"
          fill="#fce7f3"
          stroke="#f9a8d4"
          stroke-width="2" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#f472b6"
          stroke-width="4" />
        <path
          d="M50 84 C46 80, 40 80, 40 86 C40 91, 50 96, 50 96 C50 96, 60 91, 60 86 C60 80, 54 80, 50 84 Z"
          fill="#f472b6" />
      </g>

      <!-- ── Binafsha qanot ───────────────────────────────── -->
      <g v-else-if="frame === 'wings-purple'">
        <path
          d="M12 54 C0 48, -2 30, 8 18 C12 32, 18 40, 28 48 Z"
          fill="#e9d5ff"
          stroke="#a855f7"
          stroke-width="2" />
        <path
          d="M88 54 C100 48, 102 30, 92 18 C88 32, 82 40, 72 48 Z"
          fill="#e9d5ff"
          stroke="#a855f7"
          stroke-width="2" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#a855f7"
          stroke-width="4" />
        <path
          d="M50 84 C46 80, 40 80, 40 86 C40 91, 50 96, 50 96 C50 96, 60 91, 60 86 C60 80, 54 80, 50 84 Z"
          fill="#a855f7" />
      </g>

      <!-- ═══════════ EPIC: yonib-so'nib turuvchi halqa ═══════════ -->
      <g v-else-if="frame === 'epic-flame'">
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="url(#epicFireG)"
          class="af-pulse-soft" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#f97316"
          stroke-width="4.5"
          class="af-glow-fire" />
        <!-- Olov tillari -->
        <g class="af-flicker">
          <path d="M50 8 Q55 14 50 19 Q45 14 50 8 Z" fill="#fb923c" />
          <path d="M14 42 Q19 47 14 52 Q9 47 14 42 Z" fill="#f97316" />
          <path d="M86 42 Q91 47 86 52 Q81 47 86 42 Z" fill="#f97316" />
          <path d="M50 82 Q55 87 50 92 Q45 87 50 82 Z" fill="#fb923c" />
        </g>
      </g>

      <g v-else-if="frame === 'epic-frost'">
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="url(#epicFrostG)"
          class="af-pulse-soft" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#38bdf8"
          stroke-width="4.5"
          class="af-glow-frost" />
        <!-- Muz kristallari -->
        <g class="af-flicker">
          <path d="M50 6 L53 12 L50 18 L47 12 Z" fill="#7dd3fc" />
          <path d="M12 44 L18 47 L12 50 L6 47 Z" fill="#38bdf8" />
          <path d="M88 44 L94 47 L88 50 L82 47 Z" fill="#38bdf8" />
        </g>
      </g>

      <!-- ═══════════ LEGEND: aylanuvchi yulduzlar + nur ═══════════ -->
      <g v-else-if="frame === 'legend-star'">
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="url(#legendStarG)"
          class="af-pulse-soft" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#fbbf24"
          stroke-width="5"
          class="af-glow-star" />
        <circle
          cx="50"
          cy="50"
          r="39"
          fill="none"
          stroke="#fcd34d"
          stroke-width="1"
          stroke-dasharray="4 7"
          class="af-spin-slow" />
        <g class="af-orbit">
          <path
            d="M50 4 L52 10 L58 10 L53 14 L55 20 L50 16 L45 20 L47 14 L42 10 L48 10 Z"
            fill="#fde047" />
        </g>
        <g class="af-orbit-rev">
          <path
            d="M50 96 L52 90 L58 90 L53 86 L55 80 L50 84 L45 80 L47 86 L42 90 L48 90 Z"
            fill="#fbbf24" />
        </g>
      </g>

      <g v-else-if="frame === 'legend-storm'">
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="url(#legendStormG)"
          class="af-pulse-soft" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#a855f7"
          stroke-width="5"
          class="af-glow-storm" />
        <circle
          cx="50"
          cy="50"
          r="39"
          fill="none"
          stroke="#c084fc"
          stroke-width="1"
          stroke-dasharray="3 6"
          class="af-spin-rev" />
        <g class="af-orbit-rev">
          <path
            d="M50 2 L53 11 L62 11 L55 16 L58 25 L50 19 L42 25 L45 16 L38 11 L47 11 Z"
            fill="#d8b4fe" />
        </g>
        <g class="af-flash">
          <path
            d="M8 62 L15 52 L12 50 L20 40"
            stroke="#e9d5ff"
            stroke-width="1.6"
            fill="none"
            stroke-linecap="round" />
        </g>
      </g>

      <!-- ═══════════ MYTHIC: toj + kosmik aura ═══════════ -->
      <g v-else-if="frame === 'mythic-crown'">
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="url(#legendStarG)"
          class="af-pulse-soft" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#f59e0b"
          stroke-width="5.5"
          class="af-glow-star" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#fbbf24"
          stroke-width="1.2"
          stroke-dasharray="2 5"
          class="af-spin-slow" />
        <!-- Toj -->
        <path
          d="M32 10 L38 -2 L44 8 L50 -8 L56 8 L62 -2 L68 10 Z"
          fill="#fbbf24"
          stroke="#d97706"
          stroke-width="1.5"
          stroke-linejoin="round" />
        <circle cx="50" cy="-4" r="3.2" fill="#f472b6" class="af-pulse-soft" />
        <g class="af-orbit">
          <path
            d="M50 100 L52.5 93 L59 93 L54 89 L56 82 L50 86 L44 82 L46 89 L41 93 L47.5 93 Z"
            fill="#fde047" />
        </g>
      </g>

      <g v-else-if="frame === 'mythic-galaxy'">
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="url(#mythicGalaxyG)"
          class="af-pulse-soft" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#e879f9"
          stroke-width="5"
          class="af-glow-galaxy" />
        <!-- Kosmik halqalar (aylanadi) -->
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="12"
          fill="none"
          stroke="#f0abfc"
          stroke-width="1.2"
          opacity="0.8"
          class="af-spin-slow" />
        <ellipse
          cx="50"
          cy="50"
          rx="12"
          ry="42"
          fill="none"
          stroke="#c084fc"
          stroke-width="1.2"
          opacity="0.6"
          class="af-spin-rev" />
        <!-- Yulduzlar -->
        <g class="af-twinkle">
          <circle cx="14" cy="20" r="1.8" fill="#fff" />
          <circle cx="88" cy="14" r="1.4" fill="#fff" />
          <circle cx="90" cy="82" r="1.8" fill="#fff" />
          <circle cx="12" cy="86" r="1.4" fill="#fff" />
        </g>
      </g>

      <!-- ── Jodugar ───────────────────────────────────────── -->
      <g v-else-if="frame === 'witch'">
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#6d28d9"
          stroke-width="4" />
        <ellipse cx="28" cy="6" rx="12" ry="3" fill="#3b0764" />
        <path
          d="M22 6 L32 -16 L38 4 Z"
          fill="#4c1d95"
          stroke="#8b5cf6"
          stroke-width="1.5"
          stroke-linejoin="round" />
        <circle cx="31" cy="-4" r="2" fill="#67e8f9" />
        <line
          x1="76"
          y1="90"
          x2="92"
          y2="74"
          stroke="#a16207"
          stroke-width="3"
          stroke-linecap="round" />
        <path d="M90 70 L98 78 L90 82 L86 74 Z" fill="#ca8a04" />
      </g>

      <!-- ── Malika ────────────────────────────────────────── -->
      <g v-else-if="frame === 'princess'">
        <path
          d="M12 56 C0 50, -2 30, 10 16 C14 32, 20 42, 30 50 Z"
          fill="#e0f2fe"
          stroke="#7dd3fc"
          stroke-width="2" />
        <path
          d="M88 56 C100 50, 102 30, 90 16 C86 32, 80 42, 70 50 Z"
          fill="#e0f2fe"
          stroke="#7dd3fc"
          stroke-width="2" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#38bdf8"
          stroke-width="4" />
        <path
          d="M50 78 C40 78, 32 84, 30 92 C44 88, 56 88, 70 92 C68 84, 60 78, 50 78 Z"
          fill="#c026d3"
          opacity="0.85" />
        <path
          d="M34 12 L40 -2 L46 8 L50 -6 L54 8 L60 -2 L66 12 Z"
          fill="#fbbf24"
          stroke="#d97706"
          stroke-width="1.5"
          stroke-linejoin="round" />
        <circle cx="50" cy="4" r="3" fill="#f472b6" />
      </g>

      <!-- ═══════════ HERO darajalari (test yechish bilan) ═══════════ -->
      <g v-else-if="frame === 'hero-bronze'">
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="url(#heroBronzeG)"
          stroke-width="5" />
        <path
          d="M50 78 C42 78 36 84 34 92 C42 88 58 88 66 92 C64 84 58 78 50 78 Z"
          fill="#b45309"
          opacity="0.9" />
        <path
          d="M38 10 L42 2 L47 9 L50 0 L53 9 L58 2 L62 10 Z"
          fill="#b45309" />
      </g>

      <g v-else-if="frame === 'hero-silver'">
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="url(#heroSilverG)"
          stroke-width="5.5"
          class="af-shimmer" />
        <path
          d="M50 76 C40 76 32 84 30 94 C42 89 58 89 70 94 C68 84 60 76 50 76 Z"
          fill="#64748b"
          opacity="0.9" />
        <path
          d="M36 8 L41 -1 L46 8 L50 -2 L54 8 L59 -1 L64 8 Z"
          fill="#94a3b8"
          stroke="#e2e8f0"
          stroke-width="1" />
        <circle cx="50" cy="4" r="2.6" fill="#f472b6" class="af-pulse-soft" />
      </g>

      <g v-else-if="frame === 'hero-golden'">
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="url(#legendStarG)"
          class="af-pulse-soft" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="url(#heroGoldenG)"
          stroke-width="6"
          class="af-glow-star" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#fde047"
          stroke-width="1"
          stroke-dasharray="3 6"
          class="af-spin-slow" />
        <path
          d="M30 10 L36 -4 L43 7 L50 -10 L57 7 L64 -4 L70 10 Z"
          fill="#fde047"
          stroke="#d97706"
          stroke-width="1.5"
          stroke-linejoin="round" />
        <circle cx="50" cy="-6" r="3.2" fill="#f43f5e" class="af-pulse-soft" />
        <g class="af-orbit">
          <path
            d="M50 98 L52.5 92 L58 92 L54 88 L56 82 L50 85 L44 82 L46 88 L42 92 L47.5 92 Z"
            fill="#fef08a" />
        </g>
      </g>
    </svg>

    <!-- Avatar: har doim ANIQ kvadrat (cho'zilmaydi, dumaloq bo'ladi).
         Bezakli ramkalarda avatar halqa ICHIDA, oddiy ramkalarda to'liq katakda. -->
    <div
      class="absolute rounded-full overflow-hidden flex items-center justify-center text-white font-black z-10 bg-gradient-to-br from-orange-400 to-orange-600"
      :class="[!decorative && ringClass]"
      :style="[
        avatarInsetStyle,
        { fontSize: Math.max(12, Math.round(size * 0.32)) + 'px' },
      ]">
      <img v-if="src" :src="src" class="w-full h-full object-cover" />
      <span v-else>{{ initial }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isDecorativeFrame, simpleRingClass } from "../lib/frames";

const props = withDefaults(
  defineProps<{
    src?: string | null;
    initial?: string;
    frame?: string;
    size?: number;
  }>(),
  {
    src: null,
    initial: "?",
    frame: "none",
    size: 64,
  },
);

const decorative = computed(() => isDecorativeFrame(props.frame));
const ringClass = computed(() => simpleRingClass(props.frame));

// Halqa avatar doirasiga mos tushadi; bezaklar viewBox tashqarisida chiqishi mumkin.
const overlaySize = computed(() => Math.round(props.size * 1.8));
const overlayOffset = computed(() =>
  Math.round((overlaySize.value - props.size) / 2),
);

// Avatar qutisi har doim aniq chegaralangan kvadrat bo'ladi:
// - oddiy ramka: to'liq size×size (ringClass bilan dumaloq halqa)
// - bezakli ramka: SVG halqasi ichida, shlyapa/toj esa tashqarida joylashadi
const avatarInsetStyle = computed(() => {
  const inset = decorative.value
    ? Math.max(3, Math.round(props.size * 0.12))
    : 0;
  return {
    top: inset + "px",
    left: inset + "px",
    right: inset + "px",
    bottom: inset + "px",
  };
});
</script>

<style scoped>
/* ════════ Ramka animatsiyalari ════════ */

/* Aylanishlar */
@keyframes afSpin {
  from {
    transform: rotate(0deg);
    transform-origin: 50px 50px;
  }
  to {
    transform: rotate(360deg);
    transform-origin: 50px 50px;
  }
}
@keyframes afSpinRev {
  from {
    transform: rotate(360deg);
    transform-origin: 50px 50px;
  }
  to {
    transform: rotate(0deg);
    transform-origin: 50px 50px;
  }
}

.af-spin-slow {
  animation: afSpin 9s linear infinite;
}
.af-spin-rev {
  animation: afSpinRev 7s linear infinite;
}

/* Orbit: yulduz halo bo'ylab aylanadi */
@keyframes afOrbit {
  from {
    transform: rotate(0deg);
    transform-origin: 50px 50px;
  }
  to {
    transform: rotate(360deg);
    transform-origin: 50px 50px;
  }
}

.af-orbit {
  animation: afOrbit 5s linear infinite;
}
.af-orbit-rev {
  animation: afOrbit 6s linear infinite reverse;
}

/* Yumshoq puls (aura fill) */
@keyframes afPulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.97);
    transform-origin: 50px 50px;
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
    transform-origin: 50px 50px;
  }
}

.af-pulse-soft {
  animation: afPulse 2.6s ease-in-out infinite;
}

/* Olov/muz uchqunlari chaqnashi */
@keyframes afFlicker {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    transform-origin: 50px 50px;
  }
  50% {
    opacity: 0.55;
    transform: scale(0.92);
    transform-origin: 50px 50px;
  }
}

.af-flicker {
  animation: afFlicker 1.8s ease-in-out infinite;
}

/* Chaqmoq (storm) */
@keyframes afFlash {
  0%,
  92%,
  100% {
    opacity: 0;
  }
  94%,
  98% {
    opacity: 1;
  }
}

.af-flash {
  animation: afFlash 4s linear infinite;
}

/* Kosmik yulduzlar miltillashi */
@keyframes afTwinkle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.af-twinkle {
  animation: afTwinkle 2.2s ease-in-out infinite;
}

/* EPIC halqa glow */
@keyframes afGlowFire {
  0%,
  100% {
    filter: drop-shadow(0 0 3px rgba(249, 115, 22, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 9px rgba(239, 68, 68, 0.9));
  }
}

.af-glow-fire {
  animation: afGlowFire 2s ease-in-out infinite;
}

@keyframes afGlowFrost {
  0%,
  100% {
    filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 9px rgba(2, 132, 199, 0.9));
  }
}

.af-glow-frost {
  animation: afGlowFrost 2s ease-in-out infinite;
}

@keyframes afGlowStar {
  0%,
  100% {
    filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 11px rgba(245, 158, 11, 1));
  }
}

.af-glow-star {
  animation: afGlowStar 2.4s ease-in-out infinite;
}

@keyframes afGlowStorm {
  0%,
  100% {
    filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 11px rgba(124, 58, 237, 1));
  }
}

.af-glow-storm {
  animation: afGlowStorm 2.4s ease-in-out infinite;
}

@keyframes afGlowGalaxy {
  0%,
  100% {
    filter: drop-shadow(0 0 5px rgba(232, 121, 249, 0.85));
  }
  50% {
    filter: drop-shadow(0 0 13px rgba(192, 38, 211, 1));
  }
}

.af-glow-galaxy {
  animation: afGlowGalaxy 2.6s ease-in-out infinite;
}

/* Silver shimmer (ko'chib yuruvchi yorug'lik) */
@keyframes afShimmer {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.35);
  }
}

.af-shimmer {
  animation: afShimmer 3s ease-in-out infinite;
}

/* Avatar ramka ichiga singgan ko'rinish: halqadan biroz ichkarida */
.avatar-inset {
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.25);
}

.hero-ring-bronze {
  border: 5px solid #b45309;
  box-shadow: inset 0 0 0 1px #f59e0b;
}

.hero-ring-silver {
  border: 5px solid #94a3b8;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.hero-ring-golden {
  border: 5px solid #d97706;
  box-shadow:
    0 0 0 2px #fde047,
    inset 0 0 0 1px #fef08a;
}

@media (prefers-reduced-motion: reduce) {
  .af-spin-slow,
  .af-spin-rev,
  .af-orbit,
  .af-orbit-rev,
  .af-pulse-soft,
  .af-flicker,
  .af-flash,
  .af-twinkle,
  .af-glow-fire,
  .af-glow-frost,
  .af-glow-star,
  .af-glow-storm,
  .af-glow-galaxy,
  .af-shimmer {
    animation: none !important;
  }
}
</style>
