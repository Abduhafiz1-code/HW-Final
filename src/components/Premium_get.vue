<script setup lang="ts">
import { Gift } from '@lucide/vue';
import { useAuthStore } from '../stores/AuthStore';
const authStore = useAuthStore();
</script>
<template>
  <RouterLink v-if="!authStore.isPremium" to="/premium">
    <div
      class="w-full bg-gradient-to-r from-orange-500 to-amber-500 h-18 mt-4 flex items-center justify-center text-2xl font-bold gap-4 rounded-2xl shadow-lg hover:opacity-90 transition active:scale-95 cursor-pointer py-4">
      <div>
        <Gift :size="32" />
      </div>
      <div>👑 Get Premium</div>
    </div>
  </RouterLink>
</template>
