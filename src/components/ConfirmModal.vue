<template>
  <Transition name="modal-pop" appear>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" @click.self="!loading && $emit('cancel')">
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2"
        :class="danger ? 'border-red-200 dark:border-red-500/20' : 'border-slate-200 dark:border-white/10'">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            :class="danger ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'">
            <TriangleAlert :size="22" />
          </div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white leading-tight">{{ title }}</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-white/60 leading-relaxed mb-5">{{ description }}</p>
        <div class="flex gap-3">
          <button @click="!loading && $emit('cancel')" :disabled="loading"
            class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50">
            Bekor qilish
          </button>
          <button @click="$emit('confirm')" :disabled="loading"
            class="flex-1 py-3 font-bold rounded-2xl text-sm text-white transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            :class="danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'">
            <Loader v-if="loading" :size="16" class="animate-spin" />
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { TriangleAlert, Loader } from "@lucide/vue";

withDefaults(
  defineProps<{
    title: string;
    description: string;
    confirmLabel: string;
    loading?: boolean;
    danger?: boolean;
  }>(),
  { loading: false, danger: false },
);

defineEmits<{ (e: "cancel"): void; (e: "confirm"): void }>();
</script>

<style scoped>
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: opacity 0.18s ease;
}
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}
</style>
