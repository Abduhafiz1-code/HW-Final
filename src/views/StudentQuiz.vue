<template>
  <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          ←</RouterLink>
        <div>
          <h1 class="text-xl font-black text-slate-900">📋 Test yechish</h1>
          <p class="text-xs text-slate-500">O'qituvchi kodi bilan kirish</p>
        </div>
      </div>

      <!-- Code entry -->
      <div v-if="!test && !loading">
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">🔑</div>
            <h2 class="text-lg font-black text-slate-900">
              Test kodini kiriting
            </h2>
            <p class="text-sm text-slate-500 mt-1">
              O'qituvchingiz bergan kodni kiriting
            </p>
          </div>
          <input v-model="codeInput" @input="codeInput = codeInput.toUpperCase()" @keyup.enter="findTest" maxlength="4"
            placeholder="AB3X"
            class="w-full text-center text-3xl text-slate-800 font-black tracking-[0.5em] px-4 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-400 transition uppercase mb-4" />
          <p v-if="notFound" class="text-red-500 text-sm text-center bg-red-50 rounded-xl px-4 py-2 mb-3">
            ❌ Bunday kodli test topilmadi
          </p>
          <button @click="findTest" :disabled="codeInput.length < 4 || searching"
            class="w-full py-3 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition disabled:opacity-50 active:scale-95">
            {{ searching ? "🔍 Qidirilmoqda..." : "Testni topish →" }}
          </button>
        </div>

        <!-- Recent tests -->
        <div v-if="myResults.length > 0" class="mt-5">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Oxirgi natijalarim
          </p>
          <div v-for="r in myResults" :key="r.id"
            class="bg-white rounded-2xl border border-slate-200 p-4 mb-2 shadow-sm flex items-center justify-between">
            <div>
              <p class="font-bold text-sm text-slate-900">
                {{ r.tests?.title }}
              </p>
              <p class="text-xs text-slate-500">
                {{ r.tests?.subject }} •
                {{ new Date(r.created_at).toLocaleDateString("uz") }}
              </p>
            </div>
            <span :class="r.percent >= 70
                ? 'bg-green-100 text-green-700'
                : 'bg-red-50 text-red-600'
              " class="text-sm font-black px-3 py-1 rounded-xl">{{ r.percent }}%</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="text-center py-20">
        <div class="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-4">
        </div>
        <p class="text-slate-500">Yuklanmoqda...</p>
      </div>

      <!-- Test found, not started -->
      <div v-else-if="test && !started && !finished">
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center">
          <div class="text-5xl mb-4">📝</div>
          <h2 class="text-xl font-black text-slate-900">{{ test.title }}</h2>
          <p class="text-slate-500 text-sm mt-1">{{ test.subject }}</p>
          <div class="flex justify-center gap-6 mt-5 mb-6">
            <div class="text-center">
              <p class="text-2xl font-black text-orange-500">
                {{ test.questions.length }}
              </p>
              <p class="text-xs text-slate-500">savol</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-black text-indigo-500">
                ~{{ test.questions.length * 1 }}
              </p>
              <p class="text-xs text-slate-500">daqiqa</p>
            </div>
          </div>
          <button @click="startTest"
            class="w-full py-3 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition active:scale-95">
            🚀 Testni boshlash
          </button>
          <button @click="
            test = null;
          codeInput = '';
          " class="w-full py-2 mt-2 text-slate-400 text-sm hover:text-slate-600 transition">
            ← Orqaga
          </button>
        </div>
      </div>

      <!-- Active test -->
      <div v-else-if="started && !finished">
        <!-- Progress bar -->
        <div class="bg-white rounded-2xl border border-slate-200 px-5 py-3 mb-4 flex items-center gap-4 shadow-sm">
          <div class="flex-1 bg-slate-100 rounded-full h-3">
            <div class="bg-orange-500 h-3 rounded-full transition-all" :style="{
              width: `${(currentIdx / test.questions.length) * 100}%`,
            }"></div>
          </div>
          <span
            class="text-sm font-bold text-slate-600 flex-shrink-0">{{ currentIdx }}/{{ test.questions.length }}</span>
          <span class="text-sm font-bold text-green-600 flex-shrink-0">✓ {{ score }}</span>
        </div>

        <!-- Question card -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">
            Savol {{ currentIdx + 1 }}
          </p>
          <p class="text-lg font-black text-slate-900 mb-6 leading-snug">
            {{ currentQ.question }}
          </p>
          <div class="space-y-3">
            <button v-for="opt in currentQ.options" :key="opt" @click="selectAnswer(opt)" :disabled="!!selectedAnswer"
              :class="{
                'border-green-400 bg-green-50 text-green-700':
                  selectedAnswer && opt === currentQ.answer,
                'border-red-400 bg-red-50 text-red-600':
                  selectedAnswer === opt && opt !== currentQ.answer,
                'border-slate-200 hover:border-orange-300 hover:bg-orange-50':
                  !selectedAnswer,
              }"
              class="w-full px-5 py-3.5 rounded-2xl border-2 text-left font-semibold text-sm text-slate-800 transition disabled:cursor-default">
              {{ opt }}
            </button>
          </div>
          <div v-if="selectedAnswer" class="mt-5">
            <p class="text-sm font-bold" :class="selectedAnswer === currentQ.answer
                ? 'text-green-600'
                : 'text-red-500'
              ">
              {{
                selectedAnswer === currentQ.answer
                  ? "✅ To'g'ri! Barakalla!"
                  : `❌ Noto'g'ri. To'g'ri: ${currentQ.answer}`
              }}
            </p>
            <button @click="nextQuestion"
              class="mt-3 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition active:scale-95">
              {{
                currentIdx + 1 >= test.questions.length
                  ? "🏁 Yakunlash"
                  : "Keyingi →"
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- Finished -->
      <div v-else-if="finished">
        <div class="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
          <div class="text-6xl mb-4">
            {{
              percent >= 90
                ? "🏆"
                : percent >= 70
                  ? "🌟"
                  : percent >= 50
                    ? "👍"
                    : "💪"
            }}
          </div>
          <h2 class="text-2xl font-black text-slate-900">Test yakunlandi!</h2>
          <p class="text-slate-500 mt-1 text-sm">{{ test.title }}</p>

          <div class="mt-6 bg-slate-50 rounded-2xl p-5">
            <p class="text-4xl font-black" :class="percent >= 70 ? 'text-green-600' : 'text-orange-500'">
              {{ percent }}%
            </p>
            <p class="text-sm text-slate-500 mt-1">
              {{ score }} / {{ test.questions.length }} to'g'ri javob
            </p>
            <div class="w-full bg-slate-200 rounded-full h-3 mt-3">
              <div :class="percent >= 70 ? 'bg-green-500' : 'bg-orange-400'" class="h-3 rounded-full transition-all"
                :style="{ width: `${percent}%` }"></div>
            </div>
          </div>

          <p class="mt-4 font-bold text-slate-700">
            {{
              percent >= 90
                ? "Ajoyib natija! Siz zo'rsiz!"
                : percent >= 70
                  ? "Yaxshi natija! Davom eting!"
                  : percent >= 50
                    ? "Yaxshi harakat! Ko'proq o'qing!"
                    : "Tushkunlikka tushmang! Qayta urinib ko'ring!"
            }}
          </p>

          <div v-if="saving" class="mt-3 text-xs text-slate-400">
            ⏳ Natija saqlanmoqda...
          </div>
          <div v-else class="mt-3 text-xs text-green-500">
            ✅ Natija o'qituvchiga yuborildi
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="retakeTest"
              class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition">
              Qayta yechish
            </button>
            <RouterLink to="/"
              class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition text-center">
              Bosh sahifa</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import supabase from "../supabase";
import { useCoinStore } from "../stores/CoinStore";
import { saveNotification } from '../lib/Notification';



const coinStore = useCoinStore();
const codeInput = ref("");
const test = ref<any>(null);
const loading = ref(false);
const searching = ref(false);
const notFound = ref(false);
const started = ref(false);
const finished = ref(false);
const saving = ref(false);
const currentIdx = ref(0);
const score = ref(0);
const selectedAnswer = ref("");
const myResults = ref<any[]>([]);

const currentQ = computed(() => test.value?.questions[currentIdx.value]);
const percent = computed(() =>
  test.value
    ? Math.round((score.value / test.value.questions.length) * 100)
    : 0,
);

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase
    .from("test_results")
    .select("*, tests(title, subject)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  myResults.value = data || [];
});

const findTest = async () => {
  if (codeInput.value.length < 4) return;
  searching.value = true;
  notFound.value = false;
  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("code", codeInput.value)
    .single();
  if (data) {
    test.value = data;
  } else {
    notFound.value = true;
  }
  searching.value = false;
};

const startTest = () => {
  currentIdx.value = 0;
  score.value = 0;
  selectedAnswer.value = "";
  started.value = true;
  finished.value = false;
};

const selectAnswer = (opt: string) => {
  if (selectedAnswer.value) return;
  selectedAnswer.value = opt;
  if (opt === currentQ.value.answer) score.value++;
};

const nextQuestion = () => {
  if (currentIdx.value + 1 >= test.value.questions.length) {
    finished.value = true;
    started.value = false;
    saveResult();
  } else {
    currentIdx.value++;
    selectedAnswer.value = "";
  }
};

const saveResult = async () => {
  saving.value = true;
  // import qo'shing

  // saveResult funksiyasi ichida supabase insert dan keyin:
  await coinStore.fetchCoins();
  await coinStore.addProgress(percent.value); // test natijasi %
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("test_results").insert({
    user_id: user.id,
    test_id: test.value.id,
    score: score.value,
    total: test.value.questions.length,
    percent: percent.value,
  });
  saving.value = false;
  // Refresh my results
  const { data } = await supabase
    .from("test_results")
    .select("*, tests(title, subject)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  myResults.value = data || [];


  // supabase insert dan keyin:
  await saveNotification(
    user.id,
    'Test yakunlandi! 🎯',
    `${test.value.title} — ${percent.value}% natija`,
    '🎯', `${score.value}/${test.value.questions.length}`, 'bg-orange-50', 'text-orange-500', 'bg-orange-50 text-orange-600'
  );
};

const retakeTest = () => {
  startTest();
};
</script>
