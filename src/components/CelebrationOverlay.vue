<template>
  <Transition name="celebration">
    <div v-if="show" class="fixed inset-0 z-[9998] flex items-center justify-center px-4"
      :class="variant === 'lose' ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/60 backdrop-blur-sm'">
      <!-- Confetti / particle layer -->
      <span v-for="p in particles" :key="p.id" class="celebration-particle absolute top-0 pointer-events-none"
        :style="p.style">
        <component :is="p.icon" :size="p.size" :class="p.iconClass" />
      </span>

      <!-- Main card -->
      <div
        class="relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl celebration-card">
        <!-- Pulsing glow behind the badge -->
        <div class="flex justify-center">
          <span class="relative flex items-center justify-center">
            <span class="absolute w-20 h-20 rounded-full animate-ping-slow"
              :class="variant === 'lose' ? 'bg-slate-300/40 dark:bg-slate-600/40' : 'bg-amber-300/50'"></span>
            <span class="relative w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-lg"
              :class="badgeClass">{{ badgeEmoji }}</span>
          </span>
        </div>

        <h2 class="text-2xl font-black text-slate-900 dark:text-white mt-3">{{ title }}</h2>
        <p v-if="subtitle" class="text-slate-500 dark:text-slate-400 text-sm mt-1.5">{{ subtitle }}</p>

        <!-- Count-up animated score -->
        <p v-if="countUpTo !== undefined" class="text-5xl font-black tabular-nums mt-4"
          :class="countColorClass">{{ displayCount }}{{ countSuffix }}</p>

        <!-- Stat chips -->
        <div v-if="stats.length" class="flex justify-center gap-2 mt-4 flex-wrap">
          <div v-for="(s, i) in stats" :key="i" class="celebration-chip rounded-2xl px-4 py-2.5 min-w-[84px]"
            :style="{ animationDelay: `${0.25 + i * 0.09}s` }" :class="s.bgClass || 'bg-slate-50 dark:bg-slate-700/50'">
            <p class="text-lg font-black tabular-nums"
              :class="s.colorClass || 'text-slate-800 dark:text-slate-100'">{{ s.value }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{{ s.label }}</p>
          </div>
        </div>

        <slot name="extra" />

        <!-- Natijani ulashish (Telegram/WhatsApp/copy) -->
        <div v-if="shareText" class="flex justify-center gap-2 mt-5">
          <button @click="shareResult"
            class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white text-xs font-black flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition shadow-md">
            <Share2 :size="14" /> Ulashish
          </button>
          <button v-if="canNativeShare" @click="nativeShare"
            class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
            <Send :size="14" /> Orqali
          </button>
        </div>
        <Transition name="pop">
          <p v-if="copied" class="text-xs text-green-600 font-bold mt-2 animate-pop">✓ Nusxa olindi — do'stlaringizga yuboring!</p>
        </Transition>

        <div class="flex gap-3 mt-6">
          <button v-if="primaryLabel" @click="$emit('primary')"
            class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 active:scale-95 transition shadow-lg shadow-orange-200 dark:shadow-none">
            {{ primaryLabel }}
          </button>
          <button v-if="secondaryLabel" @click="$emit('secondary')"
            class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
            {{ secondaryLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Star, Sparkles, Award, Trophy, Heart, Zap, Share2, Send } from '@lucide/vue';
import { playFanfare } from '../lib/sound';

interface CelebrationStat {
  label: string;
  value: string | number;
  colorClass?: string;
  bgClass?: string;
}

const props = withDefaults(defineProps<{
  show: boolean;
  title: string;
  subtitle?: string;
  variant?: 'win' | 'lose' | 'tie';
  stats?: CelebrationStat[];
  /** Animated count-up value (e.g. percent). Omit to hide. */
  countUpTo?: number;
  countSuffix?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Berilganda "Ulashish" tugmasi ko'rinadi */
  shareText?: string;
}>(), {
  variant: 'win',
  stats: () => [],
  countSuffix: '',
  primaryLabel: "Qayta o'ynash",
  secondaryLabel: 'Bosh menyu',
});

defineEmits<{ (e: 'primary'): void; (e: 'secondary'): void }>();

/* ---------- ulashish ---------- */
const copied = ref(false);
const canNativeShare = computed(() =>
  typeof navigator !== 'undefined' && !!(navigator as any).share,
);

const shareResult = async () => {
  const text = props.shareText || '';
  const url = window.location.origin;
  try {
    // Telegram — O'zbekistonda eng ommabop messenger
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener',
    );
  } catch {
    /* popup bloklandi — pastdagi clipboard fallback */
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2500);
  } catch {
    /* clipboard mavjud emas — jim o'tamiz */
  }
};

const nativeShare = async () => {
  try {
    await (navigator as any).share({
      title: props.title,
      text: `${props.shareText || ''}\n`,
      url: window.location.origin,
    });
  } catch {
    /* foydalanuvchi bekor qildi */
  }
};

/* ---------- badge / colors by variant ---------- */
const badgeEmoji = computed(() =>
  props.variant === 'lose' ? '💪' : props.variant === 'tie' ? '🤝' : '🏆',
);
const badgeClass = computed(() =>
  props.variant === 'lose'
    ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
    : props.variant === 'tie'
      ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white'
      : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
);
const countColorClass = computed(() =>
  props.variant === 'lose'
    ? 'text-slate-500 dark:text-slate-400'
    : props.variant === 'tie'
      ? 'text-indigo-500'
      : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500',
);

/* ---------- count-up animation ---------- */
const displayCount = ref(0);
watch(
  () => [props.show, props.countUpTo] as const,
  ([v]) => {
    if (v) {
      // 🔊 G'alaba fanfarasi (konfeti bilan bir vaqtda); mag'lubiyatda ovoz yo'q
      if (props.variant !== 'lose') playFanfare();
      if (props.countUpTo !== undefined) animateCount();
    } else displayCount.value = 0;
  },
  { immediate: true },
);
const animateCount = () => {
  const target = props.countUpTo ?? 0;
  const dur = 950;
  const start = performance.now();
  const step = (t: number) => {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    displayCount.value = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* ---------- confetti particles ---------- */
const PARTICLE_ICONS = [Star, Sparkles, Award, Trophy, Heart, Zap];
const PARTICLE_COLORS = [
  'text-orange-400',
  'text-amber-400',
  'text-yellow-300',
  'text-indigo-400',
  'text-rose-400',
  'text-green-400',
];
const particles = computed(() => {
  if (!props.show) return [];
  const n = props.variant === 'lose' ? 10 : 26;
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    icon: PARTICLE_ICONS[i % PARTICLE_ICONS.length],
    iconClass: props.variant === 'lose' && i % 2 === 0 ? 'text-slate-400' : PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    size: 14 + (i % 4) * 5,
    style: {
      left: `${(i * 37 + 9) % 100}%`,
      animationDelay: `${(i % 8) * 0.13}s`,
      animationDuration: `${1.9 + (i % 5) * 0.4}s`,
      '--drift': `${(((i % 7) - 3) * 26).toFixed(0)}px`,
    },
  }));
});
</script>

<style scoped>
.celebration-particle {
  animation-name: celebrationFall;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

@keyframes celebrationFall {
  0% {
    transform: translate3d(0, -60px, 0) rotate(0deg);
    opacity: 0;
  }

  8% {
    opacity: 1;
  }

  100% {
    transform: translate3d(var(--drift, 0px), 110vh, 0) rotate(540deg);
    opacity: 0.55;
  }
}

.celebration-card {
  animation: celebrationCardIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes celebrationCardIn {
  from {
    opacity: 0;
    transform: translateY(42px) scale(0.85);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.celebration-chip {
  animation: celebrationChipIn 0.4s ease both;
}

@keyframes celebrationChipIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.9);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pingSlow {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }

  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: pingSlow 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.celebration-enter-active {
  transition: opacity 0.3s ease;
}

.celebration-leave-active {
  transition: opacity 0.25s ease;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}
</style>
