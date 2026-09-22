<template>
  <!-- AI javobi: uy vazifasi yechimidek rang-barang, tushunarli bloklar -->
  <div class="flex gap-3">
    <div
      class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
      <Bot :size="16" class="text-white" />
    </div>
    <div class="max-w-[85%] group min-w-0">
      <div
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl rounded-bl-sm shadow-sm overflow-hidden">
        <SolutionRenderer :text="content" />
      </div>
      <div class="flex items-center gap-2 mt-1 ml-1">
        <p class="text-[10px] text-slate-400">{{ time }}</p>
        <button
          @click="$emit('copy')"
          class="text-[10px] text-slate-400 hover:text-orange-500 flex items-center gap-0.5 transition">
          <Copy :size="11" />
          {{ copied ? "Nusxalandi" : "Nusxa" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot, Copy } from "@lucide/vue";
import SolutionRenderer from "./SolutionRenderer.vue";

defineProps<{ content: string; time?: string; copied?: boolean }>();
defineEmits<{ copy: [] }>();
</script>
