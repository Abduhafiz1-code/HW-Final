<template>
  <div
    class="h-24 bg-[url('/src/images/Header_bg_img.png')] overflow-hidden bg-center shadow-xs shadow-black flex justify-between items-center mt-4 rounded-xl px-5">
    <div>
      <div class="flex flex-col text-sm md:text-xl text-left font-bold leading-tight text-white">
        <span>Xush kelibsiz!</span>
        <span class="flex gap-2">{{ authStore.displayName }}

        </span>
      </div>
    </div>
    <div>
      <span class="flex items-end">

        <img :src="Header_img" alt="Header Image" class="w-44  rounded-full ml-2" />
      </span>
    </div>

  </div>
</template>
<script setup lang="ts">
import Header_img from '../images/Header-img.png'
// import { GraduationCap } from '@lucide/vue';
import { useAuthStore } from '../stores/AuthStore';
const authStore = useAuthStore();
</script>
