<template>
  <div class="min-h-screen bg-[#eef0f7] flex flex-col pb-28 font-nunito">
    <!-- Header -->
    <div class="px-5 pt-12 pb-4">
      <h1 class="text-2xl font-black text-[#1e1040] tracking-tight">
        Leaderboard
      </h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-purple-100 border-t-purple-500 animate-spin"></div>
      <p class="text-gray-400 dark:text-slate-500 text-sm font-semibold">Yuklanmoqda...</p>
    </div>

    <div v-else class="px-4 flex flex-col gap-3">
      <!-- Top 3 Podium -->
      <div class="flex items-end justify-center gap-3 py-6">
        <!-- 2nd -->
        <div class="flex flex-col items-center gap-2" :class="users[1] && 'cursor-pointer'" @click="users[1] && openStats(users[1].user_id)">
          <div class="relative">
            <AvatarFrame :src="users[1]?.profiles?.avatar_url" :initial="users[1]?.profiles?.full_name?.charAt(0) || '?'"
              :frame="users[1]?.profiles?.avatar_frame" :size="64" class="shadow-md" />
            <span
              class="absolute -bottom-1 -right-1 bg-gray-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow z-20">2</span>
          </div>
          <p class="text-xs font-bold text-gray-500 dark:text-slate-400 max-w-[72px] truncate text-center">
            {{ users[1]?.profiles?.full_name?.split(" ")[0] || "—" }}
          </p>
          <div class="bg-white rounded-xl px-3 py-1 shadow-sm">
            <span class="text-gray-500 dark:text-slate-300 text-xs font-black flex items-center gap-1">{{ users[1]?.coins || 0 }}
              <Coins :size="12" />
            </span>
          </div>
          <div class="w-20 h-16 bg-white rounded-t-2xl flex items-center justify-center shadow-sm">
            <span class="text-gray-400 dark:text-slate-500 text-2xl font-black">2</span>
          </div>
        </div>

        <!-- 1st -->
        <div class="flex flex-col items-center gap-2 -mb-2" :class="users[0] && 'cursor-pointer'" @click="users[0] && openStats(users[0].user_id)">
          <Crown :size="24" class="text-amber-400" />
          <div class="relative">
            <AvatarFrame :src="users[0]?.profiles?.avatar_url" :initial="users[0]?.profiles?.full_name?.charAt(0) || '?'"
              :frame="users[0]?.profiles?.avatar_frame" :size="80" class="shadow-lg" />
            <span
              class="absolute -bottom-1 -right-1 bg-cyan-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow z-20">1</span>
          </div>
          <p class="text-sm font-black text-[#1e1040] max-w-[80px] truncate text-center">
            {{ users[0]?.profiles?.full_name?.split(" ")[0] || "—" }}
          </p>
          <div class="bg-cyan-50 dark:bg-cyan-500/10 rounded-xl px-3 py-1 shadow-sm">
            <span class="text-cyan-500 dark:text-cyan-400 text-xs font-black flex items-center gap-1">{{ users[0]?.coins || 0 }}
              <Coins :size="12" />
            </span>
          </div>
          <div
            class="w-20 h-24 bg-gradient-to-b from-cyan-100 to-white rounded-t-2xl flex items-center justify-center shadow-sm">
            <span class="text-cyan-400 text-3xl font-black">1</span>
          </div>
        </div>

        <!-- 3rd -->
        <div class="flex flex-col items-center gap-2" :class="users[2] && 'cursor-pointer'" @click="users[2] && openStats(users[2].user_id)">
          <div class="relative">
            <AvatarFrame :src="users[2]?.profiles?.avatar_url" :initial="users[2]?.profiles?.full_name?.charAt(0) || '?'"
              :frame="users[2]?.profiles?.avatar_frame" :size="64" class="shadow-md" />
            <span
              class="absolute -bottom-1 -right-1 bg-orange-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow z-20">3</span>
          </div>
          <p class="text-xs font-bold text-gray-500 dark:text-slate-400 max-w-[72px] truncate text-center">
            {{ users[2]?.profiles?.full_name?.split(" ")[0] || "—" }}
          </p>
          <div class="bg-orange-50 dark:bg-orange-500/10 rounded-xl px-3 py-1 shadow-sm">
            <span class="text-orange-400 dark:text-orange-300 text-xs font-black flex items-center gap-1">{{ users[2]?.coins || 0 }}
              <Coins :size="12" />
            </span>
          </div>
          <div class="w-20 h-10 bg-white rounded-t-2xl flex items-center justify-center shadow-sm">
            <span class="text-orange-400 text-2xl font-black">3</span>
          </div>
        </div>
      </div>

      <div class="h-px bg-purple-100 mb-1"></div>

      <div v-for="(user, index) in users.slice(3)" :key="user.user_id" @click="openStats(user.user_id)"
        class="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 shadow-sm shadow-purple-50 dark:shadow-none card-hover cursor-pointer">
        <span class="text-gray-400 dark:text-slate-500 text-sm font-black w-5 text-center">{{
          index + 4
        }}</span>

        <AvatarFrame :src="user.profiles?.avatar_url" :initial="user.profiles?.full_name?.charAt(0) || '?'"
          :frame="user.profiles?.avatar_frame" :size="40" />

        <div class="flex-1 min-w-0">
          <p class="text-[#1e1040] font-bold text-sm truncate">
            {{ user.profiles?.full_name || "Noma'lum" }}
          </p>
        </div>

        <div class="bg-purple-50 dark:bg-purple-500/10 rounded-xl px-3 py-1">
          <span class="text-purple-500 dark:text-purple-300 text-xs font-black flex items-center gap-1">{{ user.coins }}
            <Coins :size="12" />
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="users.length === 0" class="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in-up">
        <Trophy :size="48" class="text-slate-300 dark:text-slate-600" />
        <p class="text-gray-400 dark:text-slate-500 font-semibold text-sm">Hali hech kim yo'q</p>
      </div>
    </div>

    <UserStatsModal :user-id="selectedUserId" @close="selectedUserId = null" />
  </div>
</template>

<script setup lang="ts">
import { Crown, Trophy, Coins } from '@lucide/vue';
import { onMounted, ref } from "vue";
import { useLeaderboardStore } from "../stores/LeaderboardStore";
import { storeToRefs } from "pinia";
import UserStatsModal from './UserStatsModal.vue';
import AvatarFrame from './AvatarFrame.vue';

const store = useLeaderboardStore();
const { users, loading } = storeToRefs(store);

const selectedUserId = ref<string | null>(null);
const openStats = (userId: string) => {
  selectedUserId.value = userId;
};

onMounted(() => {
  store.fetchLeaderboard();
});
</script>
