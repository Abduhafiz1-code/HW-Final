<template>
  <div
    class="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#eef0f7] flex flex-col pb-28 font-nunito">
    <!-- Header -->
    <div class="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-4">
      <h1
        class="text-2xl font-black text-[#1e1040] dark:text-white tracking-tight">
        Leaderboard
      </h1>

      <!-- Davr filtri: Haftalik / Oylik / Umumiy -->
      <div
        class="mt-4 inline-flex bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-sm border border-purple-100 dark:border-slate-700">
        <button
          v-for="p in PERIODS"
          :key="p.key"
          @click="setPeriod(p.key)"
          class="px-4 py-2 rounded-xl text-xs font-black transition-all"
          :class="
            store.period === p.key
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-200 dark:shadow-none scale-[1.03]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          ">
          {{ p.label }}
        </button>
      </div>
      <p v-if="store.period !== 'all'" class="mt-2 text-[11px] font-semibold text-purple-400 dark:text-purple-300/70">
        {{ store.period === "week" ? "Oxirgi 7 kun ichida yig'ilgan ballar" : "Oxirgi 30 kun ichida yig'ilgan ballar" }}
      </p>
    </div>

    <!-- Error + retry -->
    <div
      v-if="store.error && !loading"
      class="w-full max-w-3xl mx-auto px-4 sm:px-6 mb-2">
      <div
        class="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 px-4 py-3 flex items-center gap-3">
        <span class="text-red-500 text-lg">!</span>
        <p class="text-xs font-bold text-red-600 flex-1">
          Reyting yuklanmadi — qayta urinib ko'ring.
        </p>
        <button
          @click="store.fetchLeaderboard()"
          class="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-black hover:bg-red-600 active:scale-95 transition">
          Yangilash
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center flex-1 gap-3">
      <div
        class="w-10 h-10 rounded-full border-4 border-purple-100 border-t-purple-500 animate-spin"></div>
      <p class="text-gray-400 dark:text-slate-500 text-sm font-semibold">
        Yuklanmoqda...
      </p>
    </div>

    <div
      v-else
      class="w-full max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-3">
      <!-- Top 3 Podium -->
      <div class="flex items-end justify-center gap-3 py-6">
        <!-- 2nd -->
        <div
          class="flex flex-col items-center gap-2"
          :class="users[1] && 'cursor-pointer'"
          @click="users[1] && openStats(users[1].user_id)">
          <div class="relative">
            <AvatarFrame
              :src="users[1]?.profiles?.avatar_url"
              :initial="users[1]?.profiles?.full_name?.charAt(0) || '?'"
              :frame="users[1]?.profiles?.avatar_frame"
              :size="64"
              class="shadow-md" />
            <span
              class="absolute -bottom-1 -right-1 bg-gray-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow z-20"
              >2</span
            >
          </div>
          <p
            class="text-xs font-bold text-gray-500 dark:text-slate-400 max-w-[72px] truncate text-center">
            {{ users[1]?.profiles?.full_name?.split(" ")[0] || "—" }}
          </p>
          <div class="flex flex-col items-center gap-0.5">
            <div class="bg-white rounded-xl px-3 py-1 shadow-sm">
              <span
                class="text-gray-500 dark:text-slate-300 text-xs font-black flex items-center gap-1"
                >{{ users[1]?.coins || 0 }}
                <Coins :size="12" />
              </span>
            </div>
            <span v-if="store.period !== 'all'" class="text-[10px] font-bold text-slate-400">+{{ users[1]?.period_points || 0 }} ball</span>
          </div>
          <div
            class="w-20 h-16 bg-white rounded-t-2xl flex items-center justify-center shadow-sm">
            <span class="text-gray-400 dark:text-slate-500 text-2xl font-black"
              >2</span
            >
          </div>
        </div>

        <!-- 1st -->
        <div
          class="flex flex-col items-center gap-2 -mb-2"
          :class="users[0] && 'cursor-pointer'"
          @click="users[0] && openStats(users[0].user_id)">
          <Crown :size="24" class="text-amber-400" />
          <div class="relative">
            <AvatarFrame
              :src="users[0]?.profiles?.avatar_url"
              :initial="users[0]?.profiles?.full_name?.charAt(0) || '?'"
              :frame="users[0]?.profiles?.avatar_frame"
              :size="80"
              class="shadow-lg" />
            <span
              class="absolute -bottom-1 -right-1 bg-cyan-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow z-20"
              >1</span
            >
          </div>
          <p
            class="text-sm font-black text-[#1e1040] max-w-[80px] truncate text-center">
            {{ users[0]?.profiles?.full_name?.split(" ")[0] || "—" }}
          </p>          <div class="flex flex-col items-center gap-0.5">
            <div class="bg-cyan-50 dark:bg-cyan-500/10 rounded-xl px-3 py-1 shadow-sm">
              <span
                class="text-cyan-500 dark:text-cyan-400 text-xs font-black flex items-center gap-1"
                >{{ users[0]?.coins || 0 }}
                <Coins :size="12" />
              </span>
            </div>
            <span v-if="store.period !== 'all'" class="text-[10px] font-bold text-purple-500">+{{ users[0]?.period_points || 0 }} ball</span>
          </div>
          <div
            class="w-20 h-24 bg-gradient-to-b from-cyan-100 to-white rounded-t-2xl flex items-center justify-center shadow-sm">
            <span class="text-cyan-400 text-3xl font-black">1</span>
          </div>
        </div>

        <!-- 3rd -->
        <div
          class="flex flex-col items-center gap-2"
          :class="users[2] && 'cursor-pointer'"
          @click="users[2] && openStats(users[2].user_id)">
          <div class="relative">
            <AvatarFrame
              :src="users[2]?.profiles?.avatar_url"
              :initial="users[2]?.profiles?.full_name?.charAt(0) || '?'"
              :frame="users[2]?.profiles?.avatar_frame"
              :size="64"
              class="shadow-md" />
            <span
              class="absolute -bottom-1 -right-1 bg-orange-400 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow z-20"
              >3</span
            >
          </div>
          <p
            class="text-xs font-bold text-gray-500 dark:text-slate-400 max-w-[72px] truncate text-center">
            {{ users[2]?.profiles?.full_name?.split(" ")[0] || "—" }}
          </p>
          <div class="flex flex-col items-center gap-0.5">
            <div class="bg-orange-50 dark:bg-orange-500/10 rounded-xl px-3 py-1 shadow-sm">
              <span
                class="text-orange-400 dark:text-orange-300 text-xs font-black flex items-center gap-1"
                >{{ users[2]?.coins || 0 }}
                <Coins :size="12" />
              </span>
            </div>
            <span v-if="store.period !== 'all'" class="text-[10px] font-bold text-orange-400">+{{ users[2]?.period_points || 0 }} ball</span>
          </div>
          <div
            class="w-20 h-10 bg-white rounded-t-2xl flex items-center justify-center shadow-sm">
            <span class="text-orange-400 text-2xl font-black">3</span>
          </div>
        </div>
      </div>

      <!-- Mening o'rnim — top-50 ga kirmasam ham doim ko'rinadi -->
      <Transition name="fade">
        <button
          v-if="store.myRank && !isMeInList"
          @click="openStats(store.myUserId!)"
          class="w-full flex items-center gap-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl px-4 py-3 shadow-lg shadow-purple-200 dark:shadow-none text-white cursor-pointer active:scale-[0.99] transition animate-fade-in-up">
          <span class="text-sm font-black w-10 text-center">#{{ store.myRank }}</span>
          <AvatarFrame
            :src="store.myRow?.avatar_url"
            :initial="(store.myRow?.full_name || '?').charAt(0)"
            :frame="store.myRow?.avatar_frame"
            :size="40" />
          <div class="flex-1 min-w-0 text-left">
            <p class="font-black text-sm truncate">
              {{ store.myRow?.full_name || "Siz" }}
            </p>
            <p class="text-[11px] font-semibold text-white/70">
              Siz {{ store.myTotal }} kishi orasida {{ store.myRank }}-o'rindasiz
            </p>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <div class="bg-white/20 rounded-xl px-3 py-1">
              <span
                class="text-xs font-black flex items-center gap-1"
                >{{ store.myRow?.coins ?? 0 }}
                <Coins :size="12" />
              </span>
            </div>
            <span class="text-[10px] font-bold text-white/70">+{{ store.myRow?.period_points ?? 0 }} ball</span>
          </div>
        </button>
      </Transition>

      <div class="h-px bg-purple-100 mb-1"></div>

      <div
        v-for="(user, index) in users.slice(3)"
        :key="user.user_id"
        @click="openStats(user.user_id)"
        class="flex items-center gap-4 rounded-2xl px-4 py-3 shadow-sm cursor-pointer transition-all"
        :class="
          isMe(user)
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 dark:shadow-none ring-2 ring-purple-300'
            : 'bg-white shadow-purple-50 dark:shadow-none card-hover'
        ">
        <span
          class="text-sm font-black w-5 text-center"
          :class="isMe(user) ? 'text-white' : 'text-gray-400 dark:text-slate-500'"
          >{{ index + 4 }}</span
        >

        <AvatarFrame
          :src="user.profiles?.avatar_url"
          :initial="user.profiles?.full_name?.charAt(0) || '?'"
          :frame="user.profiles?.avatar_frame"
          :size="40" />

        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm truncate" :class="isMe(user) ? 'text-white' : 'text-[#1e1040]'">
            {{ user.profiles?.full_name || "Noma'lum" }}
            <span
              v-if="isMe(user)"
              class="ml-1 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black align-middle"
              >SIZ</span
            >
          </p>
        </div>

        <div class="flex flex-col items-end gap-0.5">
          <div :class="isMe(user) ? 'bg-white/20' : 'bg-purple-50 dark:bg-purple-500/10'" class="rounded-xl px-3 py-1">
            <span
              class="text-xs font-black flex items-center gap-1"
              :class="isMe(user) ? 'text-white' : 'text-purple-500 dark:text-purple-300'"
              >{{ user.coins }}
              <Coins :size="12" />
            </span>
          </div>
          <span v-if="store.period !== 'all'" class="text-[10px] font-bold" :class="isMe(user) ? 'text-white/70' : 'text-slate-400'">+{{ user.period_points || 0 }} ball</span>
          <span v-if="user.total_tests" class="text-[10px] font-bold flex items-center gap-1" :class="isMe(user) ? 'text-white/70' : 'text-slate-400'">
            <ClipboardList :size="10" /> {{ user.total_tests }} test · {{ user.avg_percent || 0 }}%
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="users.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in-up">
        <Trophy :size="48" class="text-slate-300 dark:text-slate-600" />
        <p class="text-gray-400 dark:text-slate-500 font-semibold text-sm">
          Hali hech kim yo'q
        </p>
      </div>
    </div>

    <UserStatsModal :user-id="selectedUserId" @close="selectedUserId = null" />
  </div>
</template>

<script setup lang="ts">
import { Crown, Trophy, Coins, ClipboardList } from "@lucide/vue";
import { computed, onMounted, ref } from "vue";
import { useLeaderboardStore } from "../stores/LeaderboardStore";
import { storeToRefs } from "pinia";
import UserStatsModal from "./UserStatsModal.vue";
import AvatarFrame from "./AvatarFrame.vue";

const store = useLeaderboardStore();
const { users, loading } = storeToRefs(store);

const PERIODS = [
  { key: "week" as const, label: "🔥 Haftalik" },
  { key: "month" as const, label: "📅 Oylik" },
  { key: "all" as const, label: "🏆 Umumiy" },
];

const setPeriod = (p: "week" | "month" | "all") => {
  if (store.period === p) return;
  store.fetchLeaderboard(p);
};

// Tanga hamma davrda ko'rinadi; ball esa qo'shimcha qatorda

const selectedUserId = ref<string | null>(null);
const openStats = (userId: string) => {
  selectedUserId.value = userId;
};

// O'zimni ajratib ko'rsatish (binafsha qator)
const isMe = (user: any) =>
  !!store.myUserId && user.user_id === store.myUserId;
const isMeInList = computed(() =>
  users.value.some((u) => isMe(u)),
);

onMounted(() => {
  store.fetchLeaderboard();
});
</script>
