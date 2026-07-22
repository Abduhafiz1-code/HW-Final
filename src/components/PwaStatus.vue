<template>
  <!-- Offline banner -->
  <Transition name="slide-down">
    <div v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-[100] bg-slate-800 text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-2">
      <WifiOff :size="14" /> Internet aloqasi yo'q — ba'zi ma'lumotlar yangilanmasligi mumkin
    </div>
  </Transition>

  <!-- Yangi versiya tayyor bo'lganda -->
  <Transition name="slide-up">
    <div v-if="needRefresh"
      class="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 max-w-[92vw]">
      <RefreshCw :size="16" class="text-cyan-400 flex-shrink-0" />
      <p class="text-xs font-semibold whitespace-nowrap">Yangi versiya mavjud</p>
      <button @click="updateNow"
        class="bg-cyan-500 hover:bg-cyan-600 active:scale-95 transition text-white text-xs font-black px-3 py-1.5 rounded-xl flex-shrink-0">
        Yangilash
      </button>
      <button @click="dismiss" class="text-white/50 hover:text-white/80 transition flex-shrink-0">
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { WifiOff, RefreshCw, X } from '@lucide/vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';

const isOnline = ref(navigator.onLine);
const handleOnline = () => (isOnline.value = true);
const handleOffline = () => (isOnline.value = false);

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});
onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(_url, registration) {
    // Har 60 daqiqada yangi versiya bor-yo'qligini tekshirib turadi
    registration && setInterval(() => registration.update(), 60 * 60 * 1000);
  },
});

const updateNow = () => updateServiceWorker(true);
const dismiss = () => (needRefresh.value = false);
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}
</style>
