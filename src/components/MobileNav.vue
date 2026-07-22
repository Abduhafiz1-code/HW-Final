<template>
  <nav class="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 shadow-lg z-50">
    <div class="flex items-center justify-around h-16">
      <RouterLink v-for="item in mobileItems" :key="item.to" :to="item.to" v-slot="{ isActive }">
        <div class="flex flex-col items-center justify-center px-2 py-1 transition-all"
          :class="isActive ? 'text-orange-500' : 'text-slate-500'">
          <component :is="item.icon" :size="22" />
          <span class="text-[10px] mt-1 font-semibold">
            {{ item.label }}
          </span>
        </div>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Book,
  Bot,
  Trophy,
  User,

} from '@lucide/vue';




const mobileItems = computed(() => {
  const list = [
    { label: "Home", to: "/", icon: Book },
    { label: "Top", to: "/map", icon: Trophy },
    { label: "AI", to: "/ai-chat", icon: Bot },
    { label: "Profil", to: "/user", icon: User },
  ];



  return list;
});
</script>