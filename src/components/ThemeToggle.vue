<template>
  <button @click="toggleTheme" type="button" role="switch" :aria-checked="isDark"
    :title="isDark ? 'Tonggi theme' : 'Tungi theme'" class="relative inline-flex h-9 w-16 items-center rounded-full border transition-colors duration-300 ease-in-out
           bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200
           dark:from-indigo-950 dark:to-slate-900 dark:border-indigo-800
           focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-indigo-500">
    <!-- Static background icons -->
    <svg class="absolute left-1.5 h-4 w-4 text-orange-400 transition-opacity duration-300"
      :class="isDark ? 'opacity-30' : 'opacity-0'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
    <svg class="absolute right-1.5 h-4 w-4 text-indigo-300 transition-opacity duration-300"
      :class="isDark ? 'opacity-0' : 'opacity-30'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>

    <!-- Sliding knob -->
    <span class="absolute top-1 left-1 flex h-7 w-7 items-center justify-center rounded-full shadow-md
             transition-transform duration-300 ease-in-out
             bg-white dark:bg-slate-800" :class="isDark ? 'translate-x-7' : 'translate-x-0'">
      <svg v-if="!isDark" class="h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      <svg v-else class="h-4 w-4 text-indigo-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const isDark = ref(false);

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme();
};

onMounted(() => {
  isDark.value =
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme();
});
</script>