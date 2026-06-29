<template>
  <div
    class="h-24 bg-no-repeat bg-cover overflow-hidden bg-center shadow-xs shadow-black flex justify-between items-center mt-4 rounded-xl px-5"
    :style="{ backgroundImage: `url(${bg})` }">
    <div>
      <div class="flex flex-col text-sm md:text-xl text-left font-bold leading-tight">
        <span>Xush kelibsiz!</span>
        <span>{{ authStore.displayName }} 👋</span>
      </div>
    </div>
    <div>
      <span class="flex items-end">
        <img class="w-40" src="../images/Header-img.png" alt="" />
      </span>
    </div>

  </div>
</template>
<script setup lang="ts">
import bg from '../images/Header_bg_img.jpg';
import { useAuthStore } from '../stores/AuthStore';
// import ThemeToggle from './ThemeToggle.vue';/
const authStore = useAuthStore();
</script>
