<template>
  <Transition name="modal-pop">
    <div v-if="userId" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="$emit('close')">
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[85vh] overflow-y-auto">
        <!-- Gradient header -->
        <div class="bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 px-6 pt-6 pb-12 relative">
          <button @click="$emit('close')"
            class="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition">
            <X :size="16" />
          </button>
          <p class="text-[10px] uppercase tracking-widest text-white/70 font-bold">Foydalanuvchi profili</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center gap-3 py-8 -mt-8">
          <div class="w-9 h-9 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
          <p class="text-sm text-slate-400">Yuklanmoqda...</p>
        </div>

        <!-- Content -->
        <div v-else-if="stats" class="flex flex-col items-center -mt-10 px-6 pb-6 animate-fade-in-up">
          <div class="relative mb-2 ring-4 ring-white dark:ring-slate-800 rounded-full">
            <AvatarFrame :src="stats.avatar_url" :initial="stats.full_name?.charAt(0)?.toUpperCase() || '?'"
              :frame="stats.avatar_frame" :size="88" />
          </div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white text-center">{{ stats.full_name || "Noma'lum" }}</h2>

          <!-- Tanga/olmos -->
          <div class="flex items-center gap-2 mt-2">
            <span class="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 rounded-full px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
              <Coins :size="13" /> {{ stats.coins }}
            </span>
            <span class="inline-flex items-center gap-1 bg-cyan-50 dark:bg-cyan-500/10 rounded-full px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-400">
              <Gem :size="13" /> {{ stats.diamonds }}
            </span>
          </div>

          <!-- Test statistikasi -->
          <div class="grid grid-cols-3 gap-2.5 w-full mt-4">
            <div class="bg-slate-50 dark:bg-slate-700/60 rounded-2xl p-3 text-center">
              <p class="font-black text-lg text-slate-800 dark:text-slate-100">{{ stats.total_tests }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Test</p>
            </div>
            <div class="bg-green-50 dark:bg-green-500/10 rounded-2xl p-3 text-center">
              <p class="font-black text-lg text-green-600 dark:text-green-400">{{ stats.best_percent }}%</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Eng yaxshi</p>
            </div>
            <div class="bg-orange-50 dark:bg-orange-500/10 rounded-2xl p-3 text-center">
              <p class="font-black text-lg text-orange-500">{{ stats.avg_percent }}%</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide">O'rtacha</p>
            </div>
          </div>

          <!-- Tur bo'yicha (AI test / ustoz testi) -->
          <div v-if="modeCounts.solo || modeCounts.teacher" class="flex justify-center gap-2 mt-3 flex-wrap">
            <span v-if="modeCounts.solo"
              class="inline-flex items-center gap-1 text-[11px] font-black bg-indigo-50 dark:bg-indigo-500/15 text-indigo-500 px-2.5 py-1 rounded-lg">
              <Brain :size="12" /> AI test: {{ modeCounts.solo }}
            </span>
            <span v-if="modeCounts.teacher"
              class="inline-flex items-center gap-1 text-[11px] font-black bg-orange-50 dark:bg-orange-500/15 text-orange-500 px-2.5 py-1 rounded-lg">
              <UserRound :size="12" /> Ustoz testi: {{ modeCounts.teacher }}
            </span>
          </div>

          <!-- Fanlar bo'yicha -->
          <div v-if="stats.subjects?.length" class="w-full mt-3">
            <div class="flex flex-wrap gap-1.5 justify-center">
              <span v-for="s in stats.subjects" :key="s.subject"
                class="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-md">
                {{ s.subject }} · {{ s.avg_percent }}%
              </span>
            </div>
          </div>

          <!-- Oxirgi natijalar -->
          <div v-if="stats.recent?.length" class="w-full mt-5">
            <p class="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-2">
              <ClipboardList :size="14" class="text-orange-500" /> Oxirgi natijalar
            </p>
            <div class="space-y-1.5">
              <div v-for="(r, i) in stats.recent" :key="i"
                class="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2">
                <span v-if="r.mode === 'solo'"
                  class="text-[9px] font-black bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded flex-shrink-0">AI</span>
                <span v-else
                  class="text-[9px] font-black bg-orange-100 dark:bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded flex-shrink-0">Ustoz</span>
                <p class="text-[11px] font-bold text-slate-600 dark:text-slate-200 truncate flex-1 min-w-0">
                  {{ r.title }}
                  <span v-if="r.level" class="text-slate-400">· {{ r.level }}</span>
                </p>
                <span class="text-xs font-black flex-shrink-0"
                  :class="r.percent >= 70 ? 'text-green-500' : r.percent >= 40 ? 'text-orange-400' : 'text-red-400'">{{ r.percent }}%</span>
              </div>
            </div>
          </div>

          <!-- Ramka to'plami (foydalanuvchi ko'rsatishga ruxsat bergan bo'lsa) -->
          <div v-if="stats.owned_frames && stats.owned_frames.length" class="w-full mt-5">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles :size="14" class="text-purple-500" /> Ramka to'plami
              </p>
              <span class="text-[11px] font-black text-purple-500">{{ stats.owned_frames.length }} ta</span>
            </div>
            <div class="flex flex-wrap gap-2 justify-center bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-3">
              <AvatarFrame v-for="f in stats.owned_frames" :key="f" :src="stats.avatar_url"
                :initial="stats.full_name?.charAt(0)?.toUpperCase() || '?'" :frame="f" :size="44" />
            </div>
          </div>
          <p v-else class="text-[11px] text-slate-400 mt-4 text-center">
            Ramka to'plami yashirilgan yoki hali bo'sh
          </p>
        </div>

        <!-- Error / not found -->
        <div v-else class="flex flex-col items-center gap-2 py-8 -mt-8 text-slate-400">
          <UserX :size="36" />
          <p class="text-sm">Ma'lumot topilmadi</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Coins, Gem, UserX, Sparkles, Brain, UserRound, ClipboardList } from '@lucide/vue';
import supabase from '../supabase';
import AvatarFrame from './AvatarFrame.vue';

const props = defineProps<{ userId: string | null }>();
defineEmits(['close']);

const loading = ref(false);
const stats = ref<any>(null);

const modeCounts = computed(() => stats.value?.by_mode ?? {});

watch(() => props.userId, async (id) => {
  stats.value = null;
  if (!id) return;
  loading.value = true;
  // SUPABASE_UPDATE_13: yagona statistika (AI + ustoz testlari, fanlar,
  // oxirgi natijalar). Bo'lmasa — eski get_public_profile_stats'ga qaytamiz.
  let { data, error } = await supabase.rpc('get_user_stats', { target_user_id: id });
  if (error || !data) {
    const fallback = await supabase.rpc('get_public_profile_stats', { target_user_id: id });
    if (!fallback.error && fallback.data && fallback.data.length) {
      const s: any = fallback.data[0];
      data = {
        full_name: s.full_name,
        avatar_url: s.avatar_url,
        avatar_frame: s.avatar_frame,
        coins: s.coins,
        diamonds: s.diamonds,
        owned_frames: s.frames || s.owned_frames || [],
        total_tests: s.total_tests,
        best_percent: s.best_percent,
        avg_percent: s.avg_percent,
      };
    }
  }
  // Postgres json-returning functions come back as a JSON string
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { /* jimgina */ }
  }
  stats.value = data || null;
  loading.value = false;
});
</script>

<style scoped>
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: opacity 0.18s ease;
}
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}
.modal-pop-enter-active>div,
.modal-pop-leave-active>div {
  transition: transform 0.18s ease;
}
.modal-pop-enter-from>div,
.modal-pop-leave-to>div {
  transform: scale(0.95);
}
</style>
