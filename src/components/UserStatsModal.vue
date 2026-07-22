<template>
  <Transition name="modal-pop">
    <div v-if="userId" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="$emit('close')">
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700">
        <div class="flex justify-end">
          <button @click="$emit('close')"
            class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
            <X :size="16" />
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center gap-3 py-8">
          <div class="w-9 h-9 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
          <p class="text-sm text-slate-400">Yuklanmoqda...</p>
        </div>

        <!-- Content -->
        <div v-else-if="stats" class="flex flex-col items-center -mt-2 animate-fade-in-up">
          <div class="relative mb-3">
            <AvatarFrame :src="stats.avatar_url" :initial="stats.full_name?.charAt(0)?.toUpperCase() || '?'"
              :frame="stats.avatar_frame" :size="80" />
          </div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white text-center">{{ stats.full_name || "Noma'lum" }}</h2>

          <div class="grid grid-cols-2 gap-3 w-full mt-5">
            <div class="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-3 text-center">
              <div class="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-black text-lg">
                <Coins :size="16" /> {{ stats.coins }}
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Tanga</p>
            </div>
            <div class="bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl p-3 text-center">
              <div class="flex items-center justify-center gap-1 text-cyan-600 dark:text-cyan-400 font-black text-lg">
                <Gem :size="16" /> {{ stats.diamonds }}
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Olmos</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/60 rounded-2xl p-3 text-center">
              <div class="flex items-center justify-center gap-1 text-slate-700 dark:text-slate-200 font-black text-lg">
                <ClipboardList :size="16" /> {{ stats.total_tests }}
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Yechilgan test</p>
            </div>
            <div class="bg-green-50 dark:bg-green-500/10 rounded-2xl p-3 text-center">
              <div class="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 font-black text-lg">
                <Star :size="16" /> {{ stats.best_percent }}%
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Eng yaxshi</p>
            </div>
          </div>

          <p class="text-xs text-slate-400 mt-4">O'rtacha natija: <span class="font-bold text-slate-600 dark:text-slate-300">{{ stats.avg_percent }}%</span></p>
        </div>

        <!-- Error / not found -->
        <div v-else class="flex flex-col items-center gap-2 py-8 text-slate-400">
          <UserX :size="36" />
          <p class="text-sm">Ma'lumot topilmadi</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Coins, Gem, ClipboardList, Star, UserX } from '@lucide/vue';
import supabase from '../supabase';
import AvatarFrame from './AvatarFrame.vue';

const props = defineProps<{ userId: string | null }>();
defineEmits(['close']);

const loading = ref(false);
const stats = ref<any>(null);

watch(() => props.userId, async (id) => {
  stats.value = null;
  if (!id) return;
  loading.value = true;
  const { data, error } = await supabase.rpc('get_public_profile_stats', { target_user_id: id });
  // Postgres table-returning functions come back as an array
  stats.value = !error && data && data.length ? data[0] : null;
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
.modal-pop-enter-active > div,
.modal-pop-leave-active > div {
  transition: transform 0.18s ease;
}
.modal-pop-enter-from > div,
.modal-pop-leave-to > div {
  transform: scale(0.95);
}
</style>
