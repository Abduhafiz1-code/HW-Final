<script setup lang="ts">
import MobileNav from "./components/MobileNav.vue";
import DesktopSidebar from "./components/DesktopSidebar.vue";
import { RouterView, useRoute } from "vue-router";
import { computed, ref, onMounted } from "vue";
import FAB from './components/FAB.vue';
import supabase from './supabase';

const route = useRoute();
const appReady = ref(false);

onMounted(async () => {
  await supabase.auth.getSession();
  appReady.value = true;
});

const showMobileNav = computed(() => !route.meta.hideMobileNav);
const showSidebar = computed(() => !route.meta.hideSidebar);
</script>

<template>
  <!-- Loading screen -->
  <Transition name="fade">
    <div v-if="!appReady"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div class="flex flex-col items-center gap-6">
        <!-- Logo / branding -->
        <div
          class="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl shadow-xl">
          🤖
        </div>
        <div class="flex flex-col items-center gap-1">
          <p class="text-xl font-black text-slate-900 dark:text-white">Yuklanmoqda...</p>
          <p class="text-sm text-slate-400">Iltimos kuting</p>
        </div>
        <!-- Spinner -->
        <div class="flex gap-2">
          <div v-for="i in 3" :key="i" class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce"
            :style="`animation-delay: ${(i - 1) * 150}ms`" />
        </div>
      </div>
    </div>
  </Transition>

  <!-- App -->
  <div v-if="appReady">
    <div class="flex w-screen">
      <DesktopSidebar v-if="showSidebar" class="hidden md:flex" />
      <FAB v-if="showMobileNav" class="md:hidden" />
      <RouterView class="w-full" />
    </div>
    <MobileNav v-if="showMobileNav" class="md:hidden" />
  </div>
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
</style>