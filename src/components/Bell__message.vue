<template>
  <div>
    <RouterLink to="/notifications">
      <button
        class="flex items-center font-bold gap-2 text-orange-500 bg-white px-4 py-2 rounded-2xl shadow-sm hover:bg-slate-50 transition-all border border-slate-200 active:scale-95">
        <Bell />
      </button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { Bell } from "@lucide/vue";
</script>

<style scoped></style>
