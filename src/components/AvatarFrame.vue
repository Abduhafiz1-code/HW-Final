<template>
  <div class="relative inline-flex items-center justify-center flex-shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- Illyustrativ ramka (mushuk/qurbaqa/qanot va h.k.) -->
    <svg v-if="decorative" viewBox="0 0 100 100" class="absolute pointer-events-none select-none"
      :style="{ width: overlaySize + 'px', height: overlaySize + 'px', left: -overlayOffset + 'px', top: -overlayOffset + 'px' }">

      <!-- ── Mushukcha (pushti) ───────────────────────────── -->
      <g v-if="frame === 'cat-pink'">
        <path d="M22 24 L34 4 L42 30 Z" fill="#f9a8d4" stroke="#f472b6" stroke-width="2" stroke-linejoin="round" />
        <path d="M78 24 L66 4 L58 30 Z" fill="#f9a8d4" stroke="#f472b6" stroke-width="2" stroke-linejoin="round" />
        <path d="M27 20 L34 10 L38 26 Z" fill="#fce7f3" />
        <path d="M73 20 L66 10 L62 26 Z" fill="#fce7f3" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#f472b6" stroke-width="4" />
        <circle cx="50" cy="87" r="5" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" />
      </g>

      <!-- ── Yurak-qanot (pushti) ─────────────────────────── -->
      <g v-else-if="frame === 'wings-pink'">
        <path d="M14 52 C4 46, 2 32, 10 22 C14 34, 18 40, 26 46 Z" fill="#fce7f3" stroke="#f9a8d4" stroke-width="2" />
        <path d="M86 52 C96 46, 98 32, 90 22 C86 34, 82 40, 74 46 Z" fill="#fce7f3" stroke="#f9a8d4" stroke-width="2" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#f472b6" stroke-width="4" />
        <path d="M50 84 C46 80, 40 80, 40 86 C40 91, 50 96, 50 96 C50 96, 60 91, 60 86 C60 80, 54 80, 50 84 Z" fill="#f472b6" />
      </g>

      <!-- ── Binafsha qanot ───────────────────────────────── -->
      <g v-else-if="frame === 'wings-purple'">
        <path d="M12 54 C0 48, -2 30, 8 18 C12 32, 18 40, 28 48 Z" fill="#e9d5ff" stroke="#a855f7" stroke-width="2" />
        <path d="M88 54 C100 48, 102 30, 92 18 C88 32, 82 40, 72 48 Z" fill="#e9d5ff" stroke="#a855f7" stroke-width="2" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#a855f7" stroke-width="4" />
        <path d="M50 84 C46 80, 40 80, 40 86 C40 91, 50 96, 50 96 C50 96, 60 91, 60 86 C60 80, 54 80, 50 84 Z" fill="#a855f7" />
      </g>

      <!-- ── Tulkicha ──────────────────────────────────────── -->
      <g v-else-if="frame === 'fox'">
        <path d="M18 26 L32 2 L44 28 Z" fill="#fb923c" stroke="#ea580c" stroke-width="2" stroke-linejoin="round" />
        <path d="M82 26 L68 2 L56 28 Z" fill="#fb923c" stroke="#ea580c" stroke-width="2" stroke-linejoin="round" />
        <path d="M24 22 L32 8 L37 24 Z" fill="#fff7ed" />
        <path d="M76 22 L68 8 L63 24 Z" fill="#fff7ed" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#fb923c" stroke-width="4" />
      </g>

      <!-- ── Qurbaqa ───────────────────────────────────────── -->
      <g v-else-if="frame === 'frog'">
        <circle cx="50" cy="50" r="34" fill="none" stroke="#4ade80" stroke-width="4" />
        <circle cx="28" cy="16" r="10" fill="#bbf7d0" stroke="#4ade80" stroke-width="2" />
        <circle cx="72" cy="16" r="10" fill="#bbf7d0" stroke="#4ade80" stroke-width="2" />
        <circle cx="28" cy="16" r="4" fill="#166534" />
        <circle cx="72" cy="16" r="4" fill="#166534" />
        <path d="M10 76 C4 82, 4 92, 10 94 C14 88, 16 82, 20 78 Z" fill="#4ade80" />
        <path d="M90 76 C96 82, 96 92, 90 94 C86 88, 84 82, 80 78 Z" fill="#4ade80" />
      </g>

      <!-- ── Tungi mushuk (qora) ──────────────────────────── -->
      <g v-else-if="frame === 'cat-dark'">
        <path d="M22 24 L34 4 L42 30 Z" fill="#312e5b" stroke="#818cf8" stroke-width="2" stroke-linejoin="round" />
        <path d="M78 24 L66 4 L58 30 Z" fill="#312e5b" stroke="#818cf8" stroke-width="2" stroke-linejoin="round" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#4c1d95" stroke-width="4" />
        <circle v-for="i in 10" :key="i" :cx="50 + 34 * Math.cos((i * 36) * Math.PI / 180)"
          :cy="50 + 34 * Math.sin((i * 36) * Math.PI / 180)" r="1.6" fill="#818cf8" />
        <circle cx="50" cy="87" r="5" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" />
      </g>

      <!-- ── Jodugar ───────────────────────────────────────── -->
      <g v-else-if="frame === 'witch'">
        <circle cx="50" cy="50" r="34" fill="none" stroke="#6d28d9" stroke-width="4" />
        <ellipse cx="28" cy="6" rx="12" ry="3" fill="#3b0764" />
        <path d="M22 6 L32 -16 L38 4 Z" fill="#4c1d95" stroke="#8b5cf6" stroke-width="1.5" stroke-linejoin="round" />
        <circle cx="31" cy="-4" r="2" fill="#67e8f9" />
        <line x1="76" y1="90" x2="92" y2="74" stroke="#a16207" stroke-width="3" stroke-linecap="round" />
        <path d="M90 70 L98 78 L90 82 L86 74 Z" fill="#ca8a04" />
      </g>

      <!-- ── Malika ────────────────────────────────────────── -->
      <g v-else-if="frame === 'princess'">
        <path d="M12 56 C0 50, -2 30, 10 16 C14 32, 20 42, 30 50 Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2" />
        <path d="M88 56 C100 50, 102 30, 90 16 C86 32, 80 42, 70 50 Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#38bdf8" stroke-width="4" />
        <path d="M50 78 C40 78, 32 84, 30 92 C44 88, 56 88, 70 92 C68 84, 60 78, 50 78 Z" fill="#c026d3" opacity="0.85" />
        <path d="M34 12 L40 -2 L46 8 L50 -6 L54 8 L60 -2 L66 12 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" stroke-linejoin="round" />
        <circle cx="50" cy="4" r="3" fill="#f472b6" />
      </g>
    </svg>

    <!-- Avatar aylanasi -->
    <div class="rounded-full overflow-hidden flex items-center justify-center text-white font-black relative z-10 bg-gradient-to-br from-orange-400 to-orange-600"
      :class="!decorative && ringClass"
      :style="{ width: size + 'px', height: size + 'px', fontSize: Math.max(12, Math.round(size * 0.32)) + 'px' }">
      <img v-if="src" :src="src" class="w-full h-full object-cover" />
      <span v-else>{{ initial }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isDecorativeFrame, simpleRingClass } from '../lib/frames';

const props = withDefaults(defineProps<{
  src?: string | null;
  initial?: string;
  frame?: string;
  size?: number;
}>(), {
  src: null,
  initial: '?',
  frame: 'none',
  size: 64,
});

const decorative = computed(() => isDecorativeFrame(props.frame));
const ringClass = computed(() => simpleRingClass(props.frame));

// Illyustrativ ramkalar avatardan 60% kattaroq maydonda chiziladi
// (quloq/qanot/qalpoq chetga chiqishi uchun), markazi bir xil qoladi.
const overlaySize = computed(() => Math.round(props.size * 1.6));
const overlayOffset = computed(() => Math.round((overlaySize.value - props.size) / 2));
</script>
