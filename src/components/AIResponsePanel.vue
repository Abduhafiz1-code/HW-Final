<template>
  <div
    class="card bg-white shadow-xl rounded-[28px] p-6 border border-base-200/70">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Javob</h2>
        <p class="text-sm text-slate-700">
          AI sizning so‘rovingizga mos tarzda javob beradi. Kerak bo‘lsa yana
          so‘rashingiz mumkin.
        </p>
      </div>
      <span class="badge badge-secondary">Yangi</span>
    </div>

    <div
      class="mt-5 min-h-[220px] rounded-3xl bg-slate-50 p-5 border border-slate-200">
      <template v-if="loading">
        <div class="flex h-full items-center justify-center text-slate-700">
          Javob tayyorlanmoqda...
        </div>
      </template>
      <template v-else-if="response">
        <div
          class="space-y-4 whitespace-pre-line text-sm leading-6 text-slate-800">
          {{ response }}
        </div>
      </template>
      <template v-else>
        <div class="text-sm leading-6 text-slate-700">
          Savolingizni yuqoridagi maydonga kiriting va &quot;Savolni
          yuborish&quot; tugmasini bosing. AI sizga tez va aniq yordam beradi.
        </div>
      </template>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div class="rounded-3xl bg-slate-100 p-4 border border-slate-200">
        <p class="text-xs uppercase tracking-[0.18em] text-secondary">
          Foydali maslahat
        </p>
        <p class="mt-2 text-sm text-slate-700">
          Aniq kontekst kiriting: fan, dars mavzusi va savol turi.
        </p>
      </div>
      <div class="rounded-3xl bg-slate-100 p-4 border border-slate-200">
        <p class="text-xs uppercase tracking-[0.18em] text-secondary">
          Tavsiyalar
        </p>
        <p class="mt-2 text-sm text-slate-700">
          Matn, kod, rasm tavsifi yoki formula bilan so‘rov yuborishingiz
          mumkin.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  query: string;
  response: string;
  loading: boolean;
}>();
</script>
