<template>
  <div class="space-y-3">
    <div class="relative">
      <input ref="inputEl" :value="modelValue" @input="onInput" @keyup.enter="emitSubmit" :disabled="disabled"
        autocomplete="off" :type="type"
        class="w-full px-4 py-3.5 rounded-2xl border-2 text-center font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 transition-all"
        :class="stateClass" placeholder="Javobingizni yozing..." />
      <span v-if="state === 'correct'" class="absolute right-3 top-1/2 -translate-y-1/2">
        <CheckCircle :size="18" class="text-green-500" />
      </span>
      <span v-else-if="state === 'wrong'" class="absolute right-3 top-1/2 -translate-y-1/2">
        <XCircle :size="18" class="text-red-500" />
      </span>
    </div>
    <button v-if="!disabled" @click="emitSubmit" :disabled="!modelValue.trim()"
      class="w-full py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-1.5">
      <Send :size="15" /> {{ submitLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckCircle, Send, XCircle } from '@lucide/vue';

const props = withDefaults(defineProps<{
  modelValue: string;
  disabled?: boolean;
  /** visual result state */
  state?: 'idle' | 'correct' | 'wrong';
  submitLabel?: string;
  type?: string;
}>(), {
  submitLabel: 'Javobni yuborish',
  type: 'text',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'submit'): void;
}>();

const inputEl = ref<HTMLInputElement | null>(null);

const stateClass = computed(() => {
  switch (props.state) {
    case 'correct':
      return 'border-green-400 bg-green-50 dark:bg-green-900/20 focus:ring-green-100 dark:focus:ring-green-900';
    case 'wrong':
      return 'border-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-100 dark:focus:ring-red-900';
    default:
      return 'border-slate-200 dark:border-slate-600 focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-900';
  }
});

const onInput = (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value);
const emitSubmit = () => {
  if (props.disabled || !props.modelValue.trim()) return;
  emit('submit');
};

defineExpose({ focus: () => inputEl.value?.focus() });
</script>
