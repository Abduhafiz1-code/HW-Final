<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white px-4 pt-6 pb-28 transition-colors duration-300">
    <div class="max-w-lg mx-auto">
      <!-- Profile Header (read-only) -->
      <div class="text-center mb-10 mt-4">
        <div class="relative inline-flex justify-center mb-4 w-full">
          <AvatarFrame
            :src="authStore.avatarUrl"
            :initial="
              authStore.displayName
                ? authStore.displayName[0].toUpperCase()
                : 'U'
            "
            :frame="authStore.avatarFrame"
            :size="96"
            class="shadow-xl shadow-orange-500/25" />
        </div>

        <h2 class="text-xl font-black">
          {{ authStore.displayName || "Foydalanuvchi" }}
        </h2>
        <p class="text-sm text-slate-500 dark:text-white/60">
          {{ authStore.user?.email }}
        </p>
        <div
          v-if="isPremium"
          class="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Crown :size="12" /> Premium
        </div>
      </div>

      <!-- Quiz Summary -->
      <div
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 :size="18" class="text-orange-500" /> Test natijalari
        </h3>
        <div class="flex justify-around text-center">
          <div>
            <p class="text-2xl font-black text-slate-900 dark:text-white">
              {{ stats.total }}
            </p>
            <p class="text-xs text-slate-500 dark:text-white/60">
              Jami testlar
            </p>
          </div>
          <div>
            <p class="text-2xl font-black text-green-600 dark:text-green-400">
              {{ stats.best }}%
            </p>
            <p class="text-xs text-slate-500 dark:text-white/60">Eng yaxshi</p>
          </div>
          <div>
            <p class="text-2xl font-black text-orange-500">{{ stats.avg }}%</p>
            <p class="text-xs text-slate-500 dark:text-white/60">O'rtacha</p>
          </div>
        </div>
      </div>

      <!-- Profil ramkalari (olmosga sotib olinadi) -->
      <div
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <div class="flex items-center justify-between mb-4">
          <h3
            class="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles :size="18" class="text-purple-500" /> Profil ramkalari
          </h3>
          <span
            class="flex items-center gap-1 text-cyan-500 font-black text-xs">
            <Gem :size="14" /> {{ coinStore.diamonds }}
          </span>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="f in FRAME_CATALOG"
            :key="f.key"
            @click="selectFrame(f.key)"
            class="flex flex-col items-center gap-1.5 group">
            <AvatarFrame
              :src="authStore.avatarUrl"
              :initial="
                authStore.displayName
                  ? authStore.displayName[0].toUpperCase()
                  : 'U'
              "
              :frame="f.key"
              :size="48"
              :class="
                authStore.avatarFrame === f.key
                  ? 'ring-2 ring-offset-2 ring-orange-400 dark:ring-offset-slate-800 rounded-full'
                  : 'opacity-75 group-hover:opacity-100 transition'
              " />
            <span
              class="text-[9px] font-bold text-slate-400 text-center leading-tight"
              >{{ f.label }}</span
            >
            <span
              v-if="authStore.avatarFrame === f.key"
              class="text-[10px] font-black text-green-500"
              >Faol</span
            >
            <span
              v-else-if="f.cost === 0 || authStore.ownedFrames.includes(f.key)"
              class="text-[10px] font-black text-slate-400"
              >{{ f.cost === 0 ? "Bepul" : "Sizniki" }}</span
            >
            <span
              v-else
              class="text-[10px] font-black text-cyan-500 flex items-center gap-0.5">
              <Gem :size="10" /> {{ f.cost }}
            </span>
          </button>
        </div>
        <p v-if="frameError" class="text-xs text-red-500 mt-3">
          {{ frameError }}
        </p>
      </div>

      <!-- Navigatsiya: Sozlamalar / Premium / Ilova haqida -->
      <div class="space-y-2 mb-6">
        <RouterLink
          to="/settings"
          class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <Settings :size="18" class="text-slate-400" /> Sozlamalar
          </span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>

        <RouterLink
          to="/premium"
          class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/20 hover:shadow-md transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <Crown :size="18" class="text-amber-500" /> Premium
          </span>
          <span
            class="text-amber-500 font-bold text-xs flex items-center gap-1">
            <Crown :size="14" />
          </span>
        </RouterLink>

        <RouterLink
          to="/about"
          class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <Info :size="18" class="text-slate-400" /> Ilova haqida
          </span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>
        <RouterLink
          to="/feedback"
          class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-4 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <MessageSquareText :size="18" class="text-sky-500" /> Fikr bildirish
          </span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>
      </div>
    </div>

    <!-- Onboarding Tooltip -->
    <OnboardingTooltip
      pageId="User"
      title="Profil"
      description="Shaxsiy profil va sozlamalar" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  BarChart3,
  Crown,
  Info,
  ChevronRight,
  Sparkles,
  Gem,
  Settings,
  MessageSquareText,
} from "@lucide/vue";
import { useAuthStore } from "../stores/AuthStore";
import { useCoinStore } from "../stores/CoinStore";
import supabase from "../supabase";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";
import AvatarFrame from "../components/AvatarFrame.vue";
import { FRAME_CATALOG, frameCost } from "../lib/frames";

const authStore = useAuthStore();
const coinStore = useCoinStore();
const isPremium = computed(() => authStore.isPremium);
const stats = ref({ total: 0, best: 0, avg: 0 });

onMounted(() => {
  loadStats();
  coinStore.fetchCoins();
});

// Profil ramkalari — bir marta olmosga sotib olinadi, keyin bepul kiyiladi
const frameError = ref("");

const selectFrame = async (key: string) => {
  frameError.value = "";
  if (authStore.avatarFrame === key) return;

  const alreadyOwned = authStore.ownedFrames.includes(key);
  const cost = frameCost(key);

  if (alreadyOwned || cost === 0) {
    const res = await authStore.setAvatarFrame(key);
    if (!res.ok)
      frameError.value = res.error
        ? `Xatolik: ${res.error}`
        : "Ramkani saqlashda xatolik yuz berdi.";
    return;
  }

  if (coinStore.diamonds < cost) {
    frameError.value = `Bu ramka uchun ${cost} olmos kerak.`;
    return;
  }

  const res = await authStore.unlockFrame(key);
  if (!res.ok) {
    frameError.value = res.error
      ? `Xatolik: ${res.error}`
      : "Ramkani saqlashda xatolik yuz berdi.";
    return;
  }

  const newDiamonds = coinStore.diamonds - cost;
  coinStore.diamonds = newDiamonds;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("coins")
      .update({ diamonds: newDiamonds })
      .eq("user_id", user.id);
  }
};

const loadStats = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("test_results")
    .select("percent")
    .eq("user_id", user.id);
  if (data && data.length > 0) {
    stats.value.total = data.length;
    stats.value.best = Math.max(...data.map((d: any) => d.percent));
    stats.value.avg = Math.round(
      data.reduce((s: number, d: any) => s + d.percent, 0) / data.length,
    );
  }
};
</script>
