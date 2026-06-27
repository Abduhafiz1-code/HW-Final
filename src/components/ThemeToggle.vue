<template>
  <button
    @click="toggleTheme"
    class="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    :title="isDark ? 'Tonggi theme' : 'Tungi theme'"
  >
    {{ isDark ? '☀' : '☾' }}
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
