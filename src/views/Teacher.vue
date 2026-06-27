<template>
  <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-slate-900">
            👨‍🏫 O'qituvchi Panel
          </h1>
          <p class="text-sm text-slate-500">{{ authStore.displayName }}</p>
        </div>
        <button @click="showCreateTest = true"
          class="px-4 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm hover:bg-orange-600 transition shadow-sm active:scale-95">
          + Test yaratish
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
          <p class="text-2xl font-black text-orange-500">{{ tests.length }}</p>
          <p class="text-xs text-slate-500 mt-1">Testlar</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
          <p class="text-2xl font-black text-indigo-500">{{ groups.length }}</p>
          <p class="text-xs text-slate-500 mt-1">Guruhlar</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
          <p class="text-2xl font-black text-green-500">{{ totalStudents }}</p>
          <p class="text-xs text-slate-500 mt-1">O'quvchilar</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex rounded-2xl bg-white border border-slate-200 p-1 mb-5 shadow-sm">
        <button v-for="t in tabs" :key="t.id" @click="activeTab = t.id" :class="activeTab === t.id
          ? 'bg-orange-500 text-white shadow'
          : 'text-slate-600'
          " class="flex-1 py-2 rounded-xl text-xs font-bold transition">
          {{ t.label }}
        </button>
      </div>

      <!-- TESTS tab -->
      <div v-if="activeTab === 'tests'" class="space-y-3">
        <div v-if="loading" class="text-center py-10 text-slate-400">
          ⏳ Yuklanmoqda...
        </div>
        <div v-else-if="tests.length === 0" class="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <div class="text-5xl mb-3">📋</div>
          <p class="text-slate-500 text-sm">Hali test yaratmadingiz</p>
          <button @click="showCreateTest = true"
            class="mt-4 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">
            + Test yaratish
          </button>
        </div>
        <div v-for="test in tests" :key="test.id" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="font-black text-slate-900">{{ test.title }}</p>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ test.subject }} • {{ test.questions.length }} savol
              </p>
              <div class="flex items-center gap-3 mt-2 flex-wrap">
                <span
                  class="text-xs bg-orange-50 text-orange-600 font-black px-3 py-1 rounded-xl border border-orange-100">Kod:
                  {{ test.code }}</span>
                <button @click="copyCode(test.code)"
                  class="text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition">
                  📋 Nusxa
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="openAssign(test)" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100
                transition">
                📤 Yuborish
              </button>
              <button @click="viewResults(test)"
                class="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition">
                📊 Natijalar
              </button>
              <button @click="deleteTest(test.id)"
                class="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition">
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- GROUPS tab -->
      <div v-else-if="activeTab === 'groups'" class="space-y-3">
        <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p class="font-bold text-sm text-slate-700 mb-3">
            Yangi guruh yaratish
          </p>
          <div class="flex gap-2">
            <input v-model="newGroupName" placeholder="Guruh nomi (9-A)"
              class="flex-1 px-3 text-slate-800 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400" />
            <button @click="createGroup" :disabled="!newGroupName.trim()"
              class="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition disabled:opacity-50">
              Yaratish
            </button>
          </div>
        </div>
        <div v-for="group in groups" :key="group.id" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div>
              <p class="font-black text-slate-900">{{ group.name }}</p>
              <p class="text-xs text-slate-500">
                Kirish kodi:
                <span class="font-bold text-orange-500">{{ group.code }}</span>
              </p>
            </div>
            <button @click="deleteGroup(group.id)""
              class=" text-xs text-red-400 hover:text-red-600">
              🗑
            </button>
          </div>
        </div>
      </div>

      <!-- RESULTS tab -->
      <div v-else class="space-y-3">
        <div v-if="!selectedTest" class="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <div class="text-5xl mb-3">📊</div>
          <p class="text-slate-500 text-sm">Testlar tabidan test tanlang</p>
        </div>
        <div v-else>
          <div class="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p class="font-black text-slate-900">{{ selectedTest.title }}</p>
              <p class="text-xs text-orange-600">
                Kod: {{ selectedTest.code }}
              </p>
            </div>
            <button @click="selectedTest = null" class="text-xs text-slate-500">
              ✕
            </button>
          </div>
          <div v-if="testResults.length === 0" class="text-center py-8 bg-white rounded-2xl border border-slate-200">
            <p class="text-slate-400 text-sm">Hali hech kim yechmagan</p>
          </div>
          <div v-for="r in testResults" :key="r.id"
            class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <p class="font-bold text-sm text-slate-900">
                {{ r.profiles?.full_name || r.profiles?.email }}
              </p>
              <p class="text-xs text-slate-500">
                {{ new Date(r.created_at).toLocaleDateString("uz") }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-20 bg-slate-100 rounded-full h-2">
                <div :class="r.percent >= 70 ? 'bg-green-500' : 'bg-red-400'" class="h-2 rounded-full"
                  :style="{ width: `${r.percent}%` }"></div>
              </div>
              <span :class="r.percent >= 70 ? 'text-green-600' : 'text-red-500'"
                class="text-sm font-black w-10 text-right">{{ r.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create test modal -->
    <div v-if="showCreateTest"
      class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      <div class="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div
          class="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
          <h2 class="font-black text-lg text-slate-900">Test yaratish</h2>
          <button @click="showCreateTest = false"
            class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            ✕
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Test nomi *</label>
            <input v-model="newTest.title" placeholder="Algebra — 1-bob"
              class="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Fan</label>
            <select v-model="newTest.subject"
              class="w-full px-4 py-3 rounded-2xl text-slate-800 border border-slate-200 bg-slate-50 text-sm focus:outline-none">
              <option>Matematika</option>
              <option>Fizika</option>
              <option>Kimyo</option>
              <option>Biologiya</option>
              <option>Ingliz tili</option>
              <option>Tarix</option>
              <option>Geografiya</option>
              <option>O'zbek tili</option>
            </select>
          </div>

          <!-- AI generate -->
          <div class="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <p class="text-sm font-bold text-orange-700 mb-2">
              🤖 AI bilan savollar yaratish
            </p>
            <div class="flex gap-2 mb-2">
              <input v-model="aiTestTopic" placeholder="Mavzu: Kvadrat tenglamalar..."
                class="flex-1 px-3 py-2 rounded-xl text-slate-800 border border-orange-200 bg-white text-sm focus:outline-none" />
              <select v-model="aiCount"
                class="px-2 text-slate-800 py-2 rounded-xl border border-orange-200 bg-white text-sm">
                <option value="5">5 ta</option>
                <option value="10">10 ta</option>
                <option value="15">15 ta</option>
              </select>
            </div>
            <button @click="generateQuestions" :disabled="aiTestLoading || !aiTestTopic"
              class="w-full py-2 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition disabled:opacity-60">
              {{ aiTestLoading ? "⏳ Yaratilmoqda..." : "🤖 AI dan yaratish" }}
            </button>
          </div>

          <!-- Questions list -->
          <div v-if="newTest.questions.length > 0">
            <p class="text-sm font-bold text-slate-700 mb-2">
              Savollar ({{ newTest.questions.length }} ta):
            </p>
            <div v-for="(q, i) in newTest.questions" :key="i"
              class="bg-slate-50 rounded-xl p-3 mb-2 border border-slate-200">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-semibold text-slate-900 flex-1">
                  {{ i + 1 }}. {{ q.question }}
                </p>
                <button @click="newTest.questions.splice(i, 1)"
                  class="text-red-400 text-xs hover:text-red-600 flex-shrink-0">
                  ✕
                </button>
              </div>
              <p class="text-xs text-green-600 mt-1">✓ {{ q.answer }}</p>
            </div>
          </div>

          <!-- Manual -->
          <div class="border border-slate-200 rounded-2xl p-4">
            <p class="text-sm font-bold text-slate-700 mb-3">
              ✏️ Qo'lda savol qo'shish
            </p>
            <input v-model="manualQ.question" placeholder="Savol matni"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none mb-2" />
            <div class="grid grid-cols-2 gap-2 mb-2">
              <input v-for="(_, i) in 4" :key="i" v-model="manualQ.options[i]"
                :placeholder="`Variant ${['A', 'B', 'C', 'D'][i]}`"
                class="px-3 text-slate-800 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none" />
            </div>
            <select v-model="manualQ.answer"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm mb-2 focus:outline-none">
              <option value="">To'g'ri javobni tanlang</option>
              <option v-for="opt in manualQ.options.filter((o) => o)" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <button @click="addManualQ" :disabled="!manualQ.question || !manualQ.answer"
              class="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition disabled:opacity-50">
              + Qo'shish
            </button>
          </div>

          <p v-if="saveError" class="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">
            {{ saveError }}
          </p>
          <button @click="saveTest" :disabled="!newTest.title || newTest.questions.length === 0 || saving
            "
            class="w-full py-3 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition disabled:opacity-50 active:scale-95">
            {{ saving ? "⏳ Saqlanmoqda..." : "💾 Testni saqlash" }}
          </button>
        </div>
      </div>
    </div>
    <!-- Assign modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <h2 class="font-black text-lg text-slate-900 mb-1">Guruhga yuborish</h2>
        <p class="text-xs text-slate-500 mb-4">{{ assigningTest?.title }}</p>
        <div v-if="groups.length === 0" class="text-center py-6">
          <p class="text-slate-400 text-sm">Hali guruh yaratmadingiz</p>
          <button @click="showAssignModal = false; activeTab = 'groups'"
            class="mt-3 px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm">
            Guruh yaratish
          </button>
        </div>
        <div v-else class="space-y-2 mb-4">
          <button v-for="group in groups" :key="group.id" @click="toggleGroup(group.id)"
            :class="selectedGroups.includes(group.id) ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50'"
            class="w-full px-4 py-3 rounded-2xl border-2 text-left transition">
            <p class="font-bold text-sm text-slate-900">{{ group.name }}</p>
            <p class="text-xs text-slate-500">Kod: {{ group.code }}</p>
          </button>
        </div>
        <div class="flex gap-2">
          <button @click="showAssignModal = false"
            class="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm">
            Bekor
          </button>
          <button @click="assignTest" :disabled="selectedGroups.length === 0 || assigning"
            class="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm disabled:opacity-50">
            {{ assigning ? '⏳' : '📤 Yuborish' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Copy toast -->
    <div v-if="copyToast"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl z-50">
      ✅ Kod nusxalandi!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/AuthStore";
import supabase from "../supabase";
import { askAIJson } from "../lib/ai";

const authStore = useAuthStore();
const activeTab = ref("tests");
const tabs = [
  { id: "tests", label: "📋 Testlar" },
  { id: "groups", label: "👥 Guruhlar" },
  { id: "results", label: "📊 Natijalar" },
];
const showCreateTest = ref(false);
const loading = ref(false); const saving = ref(false); const saveError = ref("");
const selectedTest = ref<any>(null); const testResults = ref<any[]>([]);
const newGroupName = ref(""); const aiTestTopic = ref("");
const aiTestLoading = ref(false); const aiCount = ref("5");
const copyToast = ref(false);

interface Question { question: string; options: string[]; answer: string; }
const tests = ref<any[]>([]);
const groups = ref<any[]>([]);
const totalStudents = computed(() => groups.value.reduce((s: number, g: any) => s + (g.students?.length || 0), 0));
const newTest = ref<{ title: string; subject: string; questions: Question[] }>({ title: "", subject: "Matematika", questions: [] });
const manualQ = ref({ question: "", options: ["", "", "", ""], answer: "" });

onMounted(() => fetchTests());

const fetchTests = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: testsData } = await supabase.from("tests").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false });
  const { data: groupsData } = await supabase.from("groups").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false });
  tests.value = testsData || [];
  groups.value = (groupsData || []).map((g: any) => ({ ...g, students: [] }));
  loading.value = false;
};

const generateQuestions = async () => {
  aiTestLoading.value = true;
  const parsed = await askAIJson<Question[]>(
    `${aiTestTopic.value} mavzusida ${aiCount.value} ta test savol yarat. Faqat JSON array: [{"question":"...","options":["A variant","B variant","C variant","D variant"],"answer":"to'g'ri variant (to'liq matn)"}]. Boshqa hech narsa yozma.`,
    []
  );
  if (parsed.length) newTest.value.questions.push(...parsed);
  else saveError.value = "AI xatosi. Qayta urinib ko'ring.";
  aiTestLoading.value = false;
};

const addManualQ = () => {
  newTest.value.questions.push({
    question: manualQ.value.question,
    options: manualQ.value.options.filter((o) => o),
    answer: manualQ.value.answer,
  });
  manualQ.value = { question: "", options: ["", "", "", ""], answer: "" };
};

const saveTest = async () => {
  saving.value = true; saveError.value = "";
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const code = Math.random().toString(36).slice(2, 6).toUpperCase();
  const { error } = await supabase.from("tests").insert({
    teacher_id: user.id,
    title: newTest.value.title,
    subject: newTest.value.subject,
    questions: newTest.value.questions,
    code,
  });
  if (error) { saveError.value = error.message; }
  else {
    await fetchTests();
    newTest.value = { title: "", subject: "Matematika", questions: [] };
    showCreateTest.value = false;
  }
  saving.value = false;
};

const deleteTest = async (id: string) => {
  await supabase.from("tests").delete().eq("id", id);
  tests.value = tests.value.filter((t) => t.id !== id);
};

const viewResults = async (test: any) => {
  selectedTest.value = test; activeTab.value = "results";
  const { data } = await supabase.from("test_results").select("*, profiles(full_name, email)").eq("test_id", test.id).order("created_at", { ascending: false });
  testResults.value = data || [];
};

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code);
  copyToast.value = true;
  setTimeout(() => (copyToast.value = false), 2000);
};

const createGroup = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !newGroupName.value.trim()) return;
  const code = Math.random().toString(36).slice(2, 6).toUpperCase();
  const { data, error } = await supabase.from("groups").insert({
    teacher_id: user.id,
    name: newGroupName.value.trim(),
    code,
  }).select().single();
  if (!error && data) groups.value.push({ ...data, students: [] });
  newGroupName.value = "";
};



const deleteGroup = async (id: string) => {
  await supabase.from("groups").delete().eq("id", id);
  groups.value = groups.value.filter((g: any) => g.id !== id);
};
const showAssignModal = ref(false);
const assigningTest = ref<any>(null);
const selectedGroups = ref<string[]>([]);
const assigning = ref(false);

const openAssign = (test: any) => {
  assigningTest.value = test;
  selectedGroups.value = [];
  showAssignModal.value = true;
};

const toggleGroup = (groupId: string) => {
  if (selectedGroups.value.includes(groupId)) {
    selectedGroups.value = selectedGroups.value.filter(id => id !== groupId);
  } else {
    selectedGroups.value.push(groupId);
  }
};

const assignTest = async () => {
  if (!assigningTest.value) return;
  assigning.value = true;
  const inserts = selectedGroups.value.map(groupId => ({
    test_id: assigningTest.value.id,
    group_id: groupId,
  }));
  const { error } = await supabase
    .from('test_assignments')
    .upsert(inserts, { onConflict: 'test_id,group_id' });
  if (!error) {
    showAssignModal.value = false;
    copyToast.value = true;
    setTimeout(() => copyToast.value = false, 2000);
  }
  assigning.value = false;
};
</script>
