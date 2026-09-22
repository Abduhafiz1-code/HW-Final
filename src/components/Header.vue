<template>
  <!-- Uzluksiz gradient fon: kunning vaqtiga qarab rang o'zgaradi -->
  <div class="relative overflow-hidden rounded-[1.75rem] shadow-lg shadow-black/10 mt-4 flex items-center gap-4"
    :class="timeTheme.bg">
    <!-- Yumshoq dekorativ qatlamlar -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-30 animate-blob-a"
        :class="timeTheme.glow"></div>
      <div class="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full blur-3xl opacity-20 animate-blob-b"
        :class="timeTheme.glow"></div>
      <span v-for="s in 6" :key="s"
        class="absolute w-1 h-1 rounded-full bg-white/70 animate-twinkle"
        :style="{ left: `${8 + s * 13}%`, top: `${18 + (s % 4) * 20}%`, animationDelay: `${s * 0.4}s` }"></span>
    </div>

    <!-- Profil avatar (chapda) -->
    <RouterLink to="/user"
      class="relative z-10 flex-shrink-0 ml-5 hover:scale-105 active:scale-95 transition-transform duration-200"
      title="Profilingiz">
      <AvatarFrame v-if="hasDecorativeFrame"
        :src="authStore.avatarUrl" :initial="authStore.displayInitial"
        :frame="authStore.avatarFrame" :size="56" />
      <span v-else
        class="relative flex w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/25 backdrop-blur-sm ring-2 ring-white/50 overflow-hidden items-center justify-center shadow-lg">
        <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="Profil" class="w-full h-full object-cover" />
        <span v-else class="text-white font-black text-xl">{{ authStore.displayInitial }}</span>
      </span>
      <!-- O'qilmagan bildirishnoma: avatar ustida -->
      <span v-if="hasUnread"
        class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white/40 animate-pulse z-20"
        :title="`${unreadCount} ta o'qilmagan bildirishnoma`">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </RouterLink>

    <!-- Matn (o'rtada): ism + streak/maqsad qatori -->
    <div class="relative z-10 flex-1 min-w-0 py-4 pr-2 flex flex-col justify-center gap-1.5">
      <div class="flex items-center gap-2 text-white min-w-0">
        <component :is="timeTheme.icon" :size="18" class="flex-shrink-0 opacity-90" />
        <span class="text-[15px] md:text-xl font-black leading-tight truncate">
          {{ greeting }}, {{ authStore.displayName }}!
        </span>
      </div>

      <!-- Streak + maqsad bitta qatorda -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <div class="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-black text-white">
          <Flame :size="12" class="text-orange-300" /> {{ streakDays }}
        </div>
        <div class="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[11px] font-black text-white">
          <Target :size="12" class="text-cyan-300" /> {{ tasksDone }}/{{ tasksGoal }}
          <span class="w-10 h-1 rounded-full bg-white/25 overflow-hidden">
            <span class="block h-full rounded-full bg-cyan-300 transition-all duration-500"
              :style="{ width: `${Math.min(100, (tasksDone / tasksGoal) * 100)}%` }"></span>
          </span>
        </div>
      </div>
    </div>

    <!-- Premium (o'ngda) -->
    <div class="relative z-10 flex-shrink-0 pr-5">
      <RouterLink v-if="!authStore.isPremium" to="/premium"
        class="flex items-center gap-1.5 bg-white text-orange-600 rounded-full px-3.5 py-1.5 text-xs font-black shadow-md hover:scale-105 active:scale-95 transition">
        <Crown :size="14" /> Premium
      </RouterLink>
      <span v-else
        class="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-xs font-black text-amber-200">
        <Crown :size="14" /> Premium
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue';
import { Flame, Target, Sunrise, Sun, Sunset, Moon, Crown } from '@lucide/vue';
import { useAuthStore } from '../stores/AuthStore';
import { useCoinStore } from '../stores/CoinStore';
import AvatarFrame from './AvatarFrame.vue';
import { isDecorativeFrame } from '../lib/frames';
import supabase from '../supabase';

const authStore = useAuthStore();
const coinStore = useCoinStore();
const hasDecorativeFrame = computed(() => isDecorativeFrame(authStore.avatarFrame));

/* ---- Kunning vaqtiga qarab tema va salomlashuv ---- */
const now = ref(new Date());
let clockTimer: any = null;

const hour = computed(() => now.value.getHours());
const greeting = computed(() => {
  const h = hour.value;
  if (h >= 5 && h < 12) return 'Xayrli tong';
  if (h >= 12 && h < 17) return 'Xayrli kun';
  if (h >= 17 && h < 22) return 'Xayrli kech';
  return 'Xayrli tun';
});

const timeTheme = computed<{ emoji?: string; icon: Component; bg: string; glow: string }>(() => {
  const h = hour.value;
  if (h >= 5 && h < 12)
    return {
      icon: Sunrise,
      bg: 'bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500',
      glow: 'bg-yellow-200',
    };
  if (h >= 12 && h < 17)
    return {
      icon: Sun,
      bg: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500',
      glow: 'bg-cyan-200',
    };
  if (h >= 17 && h < 22)
    return {
      icon: Sunset,
      bg: 'bg-gradient-to-r from-rose-400 via-purple-500 to-indigo-600',
      glow: 'bg-fuchsia-300',
    };
  return {
    icon: Moon,
    bg: 'bg-gradient-to-r from-slate-700 via-indigo-900 to-slate-900',
    glow: 'bg-indigo-400',
  };
});

/* ---- Streak va maqsad ---- */
const streakDays = computed(() => (coinStore as any).streakDays ?? 0);
const tasksDone = ref(0);
const tasksGoal = ref(5);

const loadDailyGoal = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [practice, tests] = await Promise.all([
      supabase.from('practice_results').select('id').eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
      supabase.from('test_results').select('id').eq('user_id', user.id).gte('created_at', todayStart.toISOString()),
    ]);
    tasksDone.value = (practice.data?.length || 0) + (tests.data?.length || 0);
  } catch {
    /* jimgina o'tkazib yuboramiz */
  }
};

/* ---- Bildirishnomalar ---- */
const unreadCount = ref(0);
const hasUnread = computed(() => unreadCount.value > 0);

const loadUnread = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    unreadCount.value = count || 0;
  } catch {
    /* jimgina */
  }
};

onMounted(() => {
  clockTimer = setInterval(() => (now.value = new Date()), 60 * 1000);
  coinStore.fetchCoins();
  loadDailyGoal();
  loadUnread();
});

onUnmounted(() => {
  clearInterval(clockTimer);
});
</script>

<style scoped>
@keyframes blobA {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-26px, 16px) scale(1.15); }
}

@keyframes blobB {
  0%, 100% { transform: translate(0, 0) scale(1.1); }
  50% { transform: translate(22px, -14px) scale(0.95); }
}

.animate-blob-a { animation: blobA 8s ease-in-out infinite; }
.animate-blob-b { animation: blobB 10s ease-in-out infinite; }

@keyframes twinkleK {
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 0.9; transform: scale(1.3); }
}

.animate-twinkle { animation: twinkleK 2.4s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .animate-blob-a, .animate-blob-b, .animate-twinkle {
    animation: none !important;
  }
}
</style>
