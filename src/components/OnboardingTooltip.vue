<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 bg-black/30"
    @click.self="dismiss"
  >
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] p-6 w-full max-w-sm animate-slide-up"
    >
      <h3 class="font-black text-lg text-slate-900 dark:text-white mb-2">{{ title }}</h3>
      <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{{ description }}</p>
      <button
        @click="dismiss"
        class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition active:scale-95 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
      >
        Tushundim
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  pageId: string;
  title: string;
  description: string;
}>();

const STORAGE_KEY = 'hw_onboarding_seen';
const visible = ref(false);

onMounted(() => {
  try {
    const seen: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!seen.includes(props.pageId)) {
      visible.value = true;
    }
  } catch {
    visible.value = true;
  }
});

const dismiss = () => {
  visible.value = false;
  try {
    const seen: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!seen.includes(props.pageId)) {
      seen.push(props.pageId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([props.pageId]));
  }
};
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}
</style>