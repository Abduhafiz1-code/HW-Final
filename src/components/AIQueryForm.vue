<template>
  <div class="card bg-white shadow-lg rounded-[28px] p-6 border border-base-200">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Savolingizni yozing</h2>
        <p class="mt-2 text-sm text-slate-700">
          Matematikadan misol, tahlil, tarjima yoki fanlarni tushuntirish uchun
          so‘rov yuboring.
        </p>
      </div>
      <span class="badge badge-outline badge-secondary">AI</span>
    </div>

    <div class="form-control mt-6">
      <label class="label">
        <span class="label-text font-semibold text-slate-900">Topshiriq</span>
      </label>
      <textarea v-model="prompt" class="textarea textarea-bordered h-32 resize-none bg-white"
        placeholder="Misol: "></textarea>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <button v-for="example in examples" :key="example" type="button"
        class="btn btn-sm btn-outline btn-secondary text-left normal-case" @click="selectExample(example)">
        {{ example }}
      </button>
    </div>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1 text-sm text-slate-700">
        <p class="font-semibold text-slate-900">Natija turi</p>
        <p class="text-slate-700">
          Qisqacha javobdan to batafsil tushuntirishgacha.
        </p>
      </div>
      <button class="btn btn-secondary btn-wide" @click="submitPrompt">
        Savolni yuborish
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "submit", value: string): void;
}>();

const prompt = ref("");

const examples = [
  "Matematikadan misol yech",
  "Ingliz tilidagi paragrafni tarjima qil",
  "Fizika formulasini tushuntir",
  "Dasturlashdagi hatolarni tuzatishda yordam ber",
];

const selectExample = (text: string) => {
  prompt.value = text;
};

const submitPrompt = () => {
  const value = prompt.value.trim();

  if (!value) return;

  emit("submit", value);
};
</script>