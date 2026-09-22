<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4">
      <Header class="animate-fade-in-up" />

      <!-- Streak + bildirishnomalar: bir xil oq panel uslubida, yonma-yon -->
      <div
        class="mt-3 flex items-center justify-between gap-3 animate-fade-in-up"
        style="animation-delay: 60ms">
        <Strike />
        <Bell />
      </div>

      <!-- Taklif bannerlari: Premium (premium bo'lmasa) va Event (o'ynamagan bo'lsa).
           X bilan yopilsa shu sessiyada yashirinadi; chiqib-kirsangiz yana chiqadi. -->
      <PremiumBanner class="mt-3" />
      <EventBanner class="mt-3" />

      <div class="mt-6 animate-fade-in-up" style="animation-delay: 120ms">
        <Main />
      </div>

      <!-- Nafas olish joyi: neytral oq fon bo'limi (ikkita rangli blok orasida) -->
      <div
        class="mt-6 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 animate-fade-in-up"
        style="animation-delay: 180ms">
        <div
          class="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <Target :size="22" class="text-purple-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-black text-slate-900 dark:text-white text-sm">
            Bugungi maqsad
          </p>
          <p class="text-xs text-slate-400 font-semibold">
            1 test + 1 mashq + 15 daqiqa o'yin — streak davom etsin!
          </p>
        </div>
      </div>

      <div
        class="mt-6 grid grid-cols-1 gap-6 animate-fade-in-up"
        style="animation-delay: 220ms">
        <div class="rounded-[2rem] bg-white/70 p-1 shadow-sm">
          <CoinProgress />
        </div>

        <RouterLink
          to="/events"
          class="flex items-center gap-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl px-5 py-4 shadow-sm active:scale-[0.98] transition">
          <div
            class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles :size="24" class="text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white font-black text-sm">Event'lar</p>
            <p class="text-cyan-50 text-xs font-semibold">
              Ishtirok eting va olmos qo'lga kiriting
            </p>
          </div>
          <ChevronRight :size="20" class="text-white/80 flex-shrink-0" />
        </RouterLink>
      </div>

      <OnboardingTooltip
        pageId="Home"
        title="Bosh sahifa"
        description="Bu yerda asosiy statistika va tezkor kirish tugmalari joylashgan" />
    </div>
  </div>
</template>
<script setup lang="ts">
import Header from "../components/Header.vue";
import Main from "../components/HeaderMain.vue";
import Strike from "../components/daily-strike.vue";
import Bell from "../components/Bell__message.vue";

import CoinProgress from "../components/CoinProgress.vue";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";
import PremiumBanner from "../components/PremiumBanner.vue";
import EventBanner from "../components/EventBanner.vue";
import { Sparkles, ChevronRight, Target } from "@lucide/vue";
</script>
