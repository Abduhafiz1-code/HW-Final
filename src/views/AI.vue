<template>
  <div class="min-h-screen bg-[#F8FAFF] px-4 py-6 md:px-10 pb-28 text-black">
    <AIHeader />
    <div class="mt-6 grid gap-6 lg:grid-cols-[1.7fr,1fr]">
      <div class="space-y-6">
        <AIQueryForm @submit="handleSubmit" />
        <div class="grid gap-4 sm:grid-cols-2">
          <AIQuickAction @click="
            router.push('/ai-chat') // tezlik va tezlanish farqini misollar bilan tushuntir')
            " icon="🧠" badge="Analiz" title="Matn tahlili"
            description="Ingliz tili, tarix yoki fan matnlarini oson tushunish uchun yuboring." />
          <AIQuickAction @click="
            setPrompt('2x + 5 = 15 tenglamani yech va bosqichlarni ko\'rsat')
            " icon="📘" badge="Yechim" title="Matematik misol"
            description="Formulalar, yechim bosqichlari va tekshiruv javoblarini oling." />
          <AIQuickAction @click="router.push('/ai-chat')" icon="📝" badge="Tarjima" title="Tarjima va izoh"
            description="Matnni tarjima qiling yoki grammatika va yozuv xatolarini tuzating." />
          <AIQuickAction @click="
            setPrompt(
              'Kimyo fanidan atom tuzilishi haqida 5 ta test savol beri',
            )
            " icon="💡" badge="Test" title="Imtihon tayyorgarligi"
            description="Savol-javob tarzida mashq qiling va bilimlaringizni mustahkamlang." />
        </div>
      </div>
      <div class="space-y-6">
        <AIResponsePanel :query="lastQuery" :response="aiResponse" :loading="loading" />
        <div class="rounded-[28px] border border-base-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                Qisqacha maslahat
              </h2>
              <p class="text-sm text-slate-700">
                Yaxshi natija olish uchun savolingizga fan, mavzu va
                o'zgarishlarni yozing.
              </p>
            </div>
            <span class="badge badge-secondary">Foydali</span>
          </div>
          <div class="mt-5 grid gap-3">
            <div class="rounded-3xl bg-slate-100 p-4">
              <p class="text-sm font-semibold text-slate-900">
                Yaxshi so'rov namunasi
              </p>
              <p class="mt-2 text-sm text-slate-700">
                "Fizikadan tezlik va tezlanish farqini misollar bilan
                tushuntirish"
              </p>
            </div>
            <div class="rounded-3xl bg-slate-100 p-4">
              <p class="text-sm font-semibold text-slate-900">
                Nimani aniqlang
              </p>
              <p class="mt-2 text-sm text-slate-700">
                Dars mavzusi, fan nomi, savol turi va agar kerak bo'lsa raqam
                yoki formulani qo'shing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import AIHeader from "../components/AIHeader.vue";
import AIQueryForm from "../components/AIQueryForm.vue";
import AIResponsePanel from "../components/AIResponsePanel.vue";
import AIQuickAction from "../components/AIQuickAction.vue";
import { askAI } from "../lib/ai";

const router = useRouter();

const lastQuery = ref("");
const aiResponse = ref("");
const loading = ref(false);

const handleSubmit = async (prompt: string) => {
  if (!prompt.trim()) return;

  lastQuery.value = prompt;
  loading.value = true;
  aiResponse.value = "";

  try {
    aiResponse.value = await askAI(
      `O'zbek tilida qisqa, aniq va o'quvchiga tushunarli javob ber:\n\n${prompt}`,
    );
  } catch (err) {
    console.error(err);
    aiResponse.value = "❌ Xatolik yuz berdi.";
  } finally {
    loading.value = false;
  }
};

const setPrompt = async (prompt: string) => {
  await handleSubmit(prompt);
};
</script>
<style scoped></style>
