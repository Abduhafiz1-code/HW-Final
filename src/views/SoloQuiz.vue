<template>
  <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          ←</RouterLink>
        <div>
          <h1 class="text-xl font-black text-slate-900">🧠 Yolg'iz Quiz</h1>
          <p class="text-xs text-slate-500">AI bilan o'z testingni yech</p>
        </div>
      </div>

      <!-- Setup -->
      <div v-if="!session" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-2">Fan</label>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="s in subjects" :key="s.id" @click="selectedSubject = s.id" :class="selectedSubject === s.id
              ? 'border-orange-400 bg-orange-50'
              : 'border-slate-200'
              " class="p-3 rounded-2xl border-2 text-left transition hover:border-orange-300">
              <span class="text-xl">{{ s.icon }}</span>
              <p class="text-sm font-bold text-slate-900 mt-1">{{ s.name }}</p>
            </button>
          </div>
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-2">Daraja</label>
          <div class="flex gap-2 flex-wrap">
            <button v-for="l in levels" :key="l" @click="selectedLevel = l" :class="selectedLevel === l
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700'
              " class="px-4 py-2 rounded-xl font-bold text-sm transition">
              {{ l }}
            </button>
          </div>
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-2">Savol soni</label>
          <div class="flex gap-2">
            <button v-for="n in [5, 10, 15]" :key="n" @click="questionCount = n" :class="questionCount === n
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-700'
              " class="flex-1 py-2 rounded-xl font-bold text-sm transition">
              {{ n }}
            </button>
          </div>
        </div>
        <button @click="startQuiz" :disabled="loading"
          class="w-full py-3 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition disabled:opacity-60 active:scale-95">
          {{ loading ? "⏳ Tayyorlanmoqda..." : "🚀 Boshlash" }}
        </button>
      </div>

      <!-- Quiz -->
      <div v-else>
        <div class="bg-white rounded-2xl border border-slate-200 px-5 py-3 mb-4 flex items-center gap-4">
          <div class="flex-1 bg-slate-100 rounded-full h-3">
            <div class="bg-orange-500 h-3 rounded-full transition-all" :style="{
              width: `${(currentIdx / session.length) * 100}%`,
            }"></div>
          </div>
          <span class="text-sm font-bold text-slate-600">{{ currentIdx }}/{{ session.length }}</span>
          <span class="text-sm font-bold text-green-600">✓ {{ score }}</span>
        </div>

        <!-- Finished -->
        <div v-if="currentIdx >= session.length"
          class="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
          <div class="text-6xl mb-4">{{ percent >= 70 ? "🌟" : "💪" }}</div>
          <h2 class="text-2xl font-black text-slate-900">Yakunlandi!</h2>
          <p class="text-slate-500 mt-1">
            {{ score }}/{{ session.length }} to'g'ri
          </p>
          <p class="text-3xl font-black mt-3" :class="percent >= 70 ? 'text-green-600' : 'text-orange-500'">
            {{ percent }}%
          </p>
          <div v-if="saving" class="mt-3 text-xs text-slate-400">
            ⏳ Saqlanmoqda...
          </div>
          <div v-else class="mt-3 text-xs text-green-500">
            ✅ Natija saqlandi!
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="session = null" class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl">
              Qayta
            </button>
            <RouterLink to="/" class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-center">Home
            </RouterLink>
          </div>
        </div>

        <!-- Question -->
        <div v-else class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">
            Savol {{ currentIdx + 1 }} • {{ selectedLevel }}
          </p>
          <p class="text-lg font-black text-slate-900 mb-6">
            {{ current.question }}
          </p>
          <div class="space-y-3">
            <button v-for="opt in current.options" :key="opt" @click="selectAnswer(opt)" :disabled="!!selected" :class="{
              'border-green-400 bg-green-50 text-green-700':
                selected && opt === current.answer,
              'border-red-400 bg-red-50 text-red-600':
                selected === opt && opt !== current.answer,
              'border-slate-200 hover:border-orange-300 hover:bg-orange-50':
                !selected,
            }"
              class="w-full px-5 py-3 text-slate-800 dark:text-white dark:hover:text-black rounded-2xl border-2 text-left font-semibold text-sm transition disabled:cursor-default">
              {{ opt }}
            </button>
          </div>
          <div v-if="selected" class="mt-4">
            <p class="text-sm font-bold" :class="selected === current.answer ? 'text-green-600' : 'text-red-500'
              ">
              {{
                selected === current.answer
                  ? "✅ To'g'ri!"
                  : `❌ To'g'ri: ${current.answer}`
              }}
            </p>
            <p v-if="current.explanation" class="text-xs text-slate-500 mt-1">
              {{ current.explanation }}
            </p>
            <button @click="nextQ"
              class="mt-3 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition">
              {{
                currentIdx + 1 >= session.length ? "🏁 Yakunla" : "Keyingi →"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import supabase from "../supabase";
import { useCoinStore } from "../stores/CoinStore";
import { askAIJson } from "../lib/ai";

const coinStore = useCoinStore();

const subjects = [
  { id: "math", icon: "🔢", name: "Matematika" },
  { id: "english", icon: "🇬🇧", name: "Ingliz tili" },
  { id: "science", icon: "🔬", name: "Fanlar" },
  { id: "history", icon: "📜", name: "Tarix" },
  { id: "geography", icon: "🌍", name: "Geografiya" },
  { id: "uzbek", icon: "🇺🇿", name: "O'zbek tili" },
];
const levels = ["A1", "A2", "B1", "B2", "C1"];

const selectedSubject = ref("math");
const selectedLevel = ref("A1");
const questionCount = ref(5);
const loading = ref(false);
const saving = ref(false);
const session = ref<any[] | null>(null);
const currentIdx = ref(0);
const score = ref(0);
const selected = ref("");

const current = computed(() => session.value?.[currentIdx.value]);
const percent = computed(() =>
  session.value ? Math.round((score.value / session.value.length) * 100) : 0,
);

const startQuiz = async () => {
  loading.value = true;
  const subjectName =
    subjects.find((s) => s.id === selectedSubject.value)?.name || "";
  try {
    session.value = await askAIJson<any[]>(
      `${subjectName} fanidan ${selectedLevel.value} darajasida ${questionCount.value} ta test savol yarat boshqa mavzularni aralshtirmasdan. Savollar uchun qaysi fanadan eknalgigga qarab til tanla va foydalanuvchi so'ragan darajadan bir o'z kuchliroq darajadagi savollar ber,  Faqat JSON array: [{"question":"...","options":["...","...","...","..."],"answer":"to'g'ri javob (to'liq matn)","explanation":"qisqa tushuntirish"}]. Boshqa hech narsa yozma.`,
      [],
    );
    if (!session.value.length) throw new Error("empty");
    currentIdx.value = 0;
    score.value = 0;
    selected.value = "";
  } catch {
    alert("Xatolik! Qayta urinib ko'ring.");
  }
  loading.value = false;
};

const selectAnswer = (opt: string) => {
  if (selected.value) return;
  selected.value = opt;
  if (current.value && opt === current.value.answer) score.value++;
};

const nextQ = async () => {
  if (currentIdx.value + 1 >= (session.value?.length || 0)) {
    currentIdx.value++;
    await saveResult();
  } else {
    currentIdx.value++;
    selected.value = "";
  }
};

const saveResult = async () => {
  if (!session.value) return;
  saving.value = true;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    saving.value = false;
    return;
  }
  await supabase.from("practice_results").insert({
    user_id: user.id,
    topic: `${subjects.find((s) => s.id === selectedSubject.value)?.name} — ${selectedLevel.value}`,
    correct: score.value,
    question_count: session.value.length,
    percent: percent.value,
  });
  await coinStore.fetchCoins();
  await coinStore.addProgress(percent.value);
  saving.value = false;
};
</script>
