<script setup lang="ts">
import MobileNav from "./components/MobileNav.vue";
import DesktopSidebar from "./components/DesktopSidebar.vue";
import { RouterView, useRoute } from "vue-router";
import { computed, ref, onMounted } from "vue";
import FAB from "./components/FAB.vue";
import PwaStatus from "./components/PwaStatus.vue";
import ErrorBoundary from "./components/ErrorBoundary.vue";
import SplashScreen from "./components/SplashScreen.vue";
import supabase from "./supabase";

const route = useRoute();
const appReady = ref(false);

onMounted(async () => {
  await supabase.auth.getSession();
  appReady.value = true;
});

const showMobileNav = computed(() => !route.meta.hideMobileNav);
const showSidebar = computed(() => !route.meta.hideSidebar);

// Perf: tez-tez qayta ochiladigan sahifalar (home/map/user) KeepAlive'da
// keshlanadi — qayta ochilganda komponent qayta mount bo'lmaydi, darhol
// ko'rinadi va Supabase so'rovlari qayta yuborilmaydi.
const keepAlivePages = new Set(["home", "map", "user"]);
const keepAlive = computed(() => keepAlivePages.has(route.name as string));
</script>

<template>
  <!-- Genshin-uslubidagi kirish animatsiyasi (har sessiyada bir marta) -->
  <SplashScreen />

  <!-- Loading screen -->
  <Transition name="fade">
    <div
      v-if="!appReady"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div class="flex flex-col items-center gap-6">
        <!-- Logo / branding: yangi Socrati logosi -->
        <img src="/favicon.svg" alt="Socrati" class="w-24 h-24 rounded-[1.75rem] shadow-xl" />
        <div class="flex flex-col items-center gap-1">
          <p class="text-xl font-black text-slate-900 dark:text-white">
            Yuklanmoqda...
          </p>
          <p class="text-sm text-slate-400">Iltimos kuting</p>
        </div>
        <!-- Spinner -->
        <div class="flex gap-2">
          <div
            v-for="i in 3"
            :key="i"
            class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce"
            :style="`animation-delay: ${(i - 1) * 150}ms`" />
        </div>
      </div>
    </div>
  </Transition>

  <!-- App -->
  <div v-if="appReady">
    <div class="flex min-h-screen w-full min-w-0">
      <DesktopSidebar v-if="showSidebar" class="hidden md:flex" />
      <FAB v-if="showMobileNav" class="md:hidden" />
      <ErrorBoundary class="min-w-0 flex-1 w-full">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <KeepAlive :max="5">
              <component
                :is="Component"
                v-if="keepAlive"
                :key="route.name"
                class="w-full" />
              <component
                :is="Component"
                v-else
                :key="route.name"
                class="w-full" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </ErrorBoundary>
    </div>
    <MobileNav v-if="showMobileNav" class="md:hidden" />
  </div>

  <PwaStatus />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Smooth page-to-page transition on route change */
.page-enter-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.page-leave-active {
  transition: opacity 0.15s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
}
</style>
