<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 px-3 sm:px-4 pt-6 pb-28">
    <div class="max-w-3xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div class="min-w-0">
          <h1 class="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate">
            👨‍🏫 O'qituvchi Panel
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ authStore.displayName }}</p>
        </div>
        <button @click="showCreateTest = true"
          class="w-full sm:w-auto px-4 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm hover:bg-orange-600 transition shadow-sm active:scale-95 flex-shrink-0">
          + Test yaratish
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2.5 sm:p-4 text-center shadow-sm min-w-0">
          <p class="text-lg sm:text-2xl font-black text-orange-500">{{ tests.length }}</p>
          <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Testlar</p>
        </div>
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2.5 sm:p-4 text-center shadow-sm min-w-0">
          <p class="text-lg sm:text-2xl font-black text-indigo-500">{{ groups.length }}</p>
          <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Guruhlar</p>
        </div>
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2.5 sm:p-4 text-center shadow-sm min-w-0">
          <p class="text-lg sm:text-2xl font-black text-green-500">{{ totalStudents }}</p>
          <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">O'quvchilar</p>
        </div>
      </div>

      <!-- Tabs: torroq ekranlarda gorizontal scroll bo'ladi, matn siqilib ketmaydi -->
      <div
        class="flex  overflow-x-auto no-scrollbar rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 mb-5 shadow-sm gap-3">
        <button v-for="t in tabs" :key="t.id" @click="activeTab = t.id"
          :class="activeTab === t.id ? 'bg-orange-500 text-white shadow' : 'text-slate-600 dark:text-slate-400'"
          class="flex-shrink-0 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap">
          {{ t.label }}
        </button>
      </div>

      <!-- TESTS tab -->
      <div v-if="activeTab === 'tests'" class="space-y-3">
        <div v-if="loading" class="text-center py-10 text-slate-400">⏳ Yuklanmoqda...</div>
        <div v-else-if="tests.length === 0"
          class="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 px-4">
          <div class="text-5xl mb-3">📋</div>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Hali test yaratmadingiz</p>
          <button @click="showCreateTest = true"
            class="mt-4 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm">
            + Test yaratish
          </button>
        </div>

        <div v-for="test in tests" :key="test.id"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-start gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-black text-slate-900 dark:text-white truncate">{{ test.title }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {{ test.subject }} • {{ test.questions.length }} savol
              </p>
              <div class="flex items-center gap-3 mt-2 flex-wrap">
                <span
                  class="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 font-black px-3 py-1 rounded-xl border border-orange-100 dark:border-orange-800 whitespace-nowrap">
                  Kod: {{ test.code }}
                </span>
                <button @click="copyCode(test.code)"
                  class="text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition whitespace-nowrap">
                  📋 Nusxa
                </button>
              </div>
            </div>
            <!-- Tugmalar mobilda to'liq kenglikda -->
            <div class="grid grid-cols-3 sm:flex sm:flex-col gap-2 sm:gap-1.5 flex-shrink-0">
              <button @click="openAssign(test)"
                class="px-2 sm:px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[11px] sm:text-xs font-bold rounded-xl hover:bg-indigo-100 transition whitespace-nowrap">
                📤 Yuborish
              </button>
              <button @click="viewResults(test)"
                class="px-2 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold rounded-xl hover:bg-slate-200 transition whitespace-nowrap">
                📊 Natija
              </button>
              <button @click="deleteTest(test.id)"
                class="px-2 sm:px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 text-[11px] sm:text-xs font-bold rounded-xl hover:bg-red-100 transition">
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Blocked tab -->
      <TeacherBlockedStudents v-if="activeTab === 'blocked'" />

      <!-- GROUPS tab -->
      <div v-else-if="activeTab === 'groups'" class="space-y-3">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <p class="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3">Yangi guruh yaratish</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input v-model="newGroupName" placeholder="Guruh nomi (9-A)"
              class="flex-1 min-w-0 px-3 text-slate-800 dark:text-white py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:border-orange-400" />
            <button @click="createGroup" :disabled="!newGroupName.trim()"
              class="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition disabled:opacity-50 flex-shrink-0">
              Yaratish
            </button>
          </div>
        </div>
        <div v-for="group in groups" :key="group.id"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="font-black text-slate-900 dark:text-white truncate">{{ group.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Kirish kodi: <span class="font-bold text-orange-500">{{ group.code }}</span>
              </p>
            </div>
            <button @click="deleteGroup(group.id)"
              class="text-xs text-red-400 hover:text-red-600 p-2 flex-shrink-0">🗑</button>
          </div>
          <div
            class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
            <span v-if="group.telegram_status === 'linked'"
              class="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 font-bold px-3 py-1 rounded-xl">
              ✅ Telegramga ulangan
            </span>
            <span v-else class="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-bold px-3 py-1 rounded-xl">
              ⚠️ Ulanmagan
            </span>
            <button @click="openTelegramLink(group)"
              class="text-xs text-indigo-500 font-bold hover:text-indigo-700 transition">
              🔗 {{ group.telegram_status === 'linked' ? "Qayta ulash" : "Ulash" }}
            </button>
          </div>
        </div>
      </div>

      <!-- RESULTS tab -->
      <div v-else-if="activeTab === 'results'" class="space-y-3">
        <div v-if="!selectedTest"
          class="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 px-4">
          <div class="text-5xl mb-3">📊</div>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Testlar tabidan test tanlang</p>
        </div>
        <div v-else>
          <div
            class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 mb-4 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="font-black text-slate-900 dark:text-white truncate">{{ selectedTest.title }}</p>
              <p class="text-xs text-orange-600">Kod: {{ selectedTest.code }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button @click="openSendResults" :disabled="testResults.length === 0"
                class="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl disabled:opacity-40">
                📤 Telegramga
              </button>
              <button @click="selectedTest = null" class="text-xs text-slate-500 p-1">✕</button>
            </div>
          </div>
          <div v-if="testResults.length === 0"
            class="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p class="text-slate-400 text-sm">Hali hech kim yechmagan</p>
          </div>
          <div v-for="r in testResults" :key="r.id"
            class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="font-bold text-sm text-slate-900 dark:text-white truncate">
                {{ r.profiles?.full_name || r.profiles?.email }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ new Date(r.created_at).toLocaleDateString("uz") }}
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="w-14 sm:w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
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
      class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <div
        class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div
          class="sticky top-0 bg-white dark:bg-slate-800 px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between rounded-t-3xl z-10">
          <h2 class="font-black text-lg text-slate-900 dark:text-white">Test yaratish</h2>
          <button @click="showCreateTest = false"
            class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
            ✕
          </button>
        </div>
        <div class="p-4 sm:p-5 space-y-4">
          <div>
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Test nomi *</label>
            <input v-model="newTest.title" placeholder="Algebra — 1-bob"
              class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Fan</label>
            <select v-model="newTest.subject"
              class="w-full px-4 py-3 rounded-2xl text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none">
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
          <div
            class="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 border border-orange-100 dark:border-orange-800">
            <p class="text-sm font-bold text-orange-700 dark:text-orange-400 mb-2">🤖 AI bilan savollar yaratish</p>
            <div class="flex flex-col sm:flex-row gap-2 mb-2">
              <input v-model="aiTestTopic" placeholder="Mavzu: Kvadrat tenglamalar..."
                class="flex-1 min-w-0 px-3 py-2 rounded-xl text-slate-800 dark:text-white border border-orange-200 dark:border-orange-700 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
              <select v-model="aiCount"
                class="px-2 text-slate-800 dark:text-white py-2 rounded-xl border border-orange-200 dark:border-orange-700 bg-white dark:bg-slate-700 text-sm flex-shrink-0">
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
            <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Savollar ({{ newTest.questions.length }} ta):
            </p>
            <div v-for="(q, i) in newTest.questions" :key="i"
              class="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 mb-2 border border-slate-200 dark:border-slate-600">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-semibold text-slate-900 dark:text-white flex-1 min-w-0">
                  {{ i + 1 }}. {{ q.question }}
                </p>
                <button @click="newTest.questions.splice(i, 1)"
                  class="text-red-400 text-xs hover:text-red-600 flex-shrink-0">✕</button>
              </div>
              <p class="text-xs text-green-600 mt-1">✓ {{ q.answer }}</p>
            </div>
          </div>

          <!-- Manual -->
          <div class="border border-slate-200 dark:border-slate-600 rounded-2xl p-4">
            <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">✏️ Qo'lda savol qo'shish</p>
            <input v-model="manualQ.question" placeholder="Savol matni"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none mb-2" />
            <div class="grid grid-cols-2 gap-2 mb-2">
              <input v-for="(_, i) in 4" :key="i" v-model="manualQ.options[i]"
                :placeholder="`Variant ${['A', 'B', 'C', 'D'][i]}`"
                class="px-3 text-slate-800 dark:text-white py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs focus:outline-none min-w-0" />
            </div>
            <select v-model="manualQ.answer"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm mb-2 focus:outline-none">
              <option value="">To'g'ri javobni tanlang</option>
              <option v-for="opt in manualQ.options.filter(o => o)" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <button @click="addManualQ" :disabled="!manualQ.question || !manualQ.answer"
              class="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition disabled:opacity-50">
              + Qo'shish
            </button>
          </div>

          <p v-if="saveError" class="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">
            {{ saveError }}
          </p>
          <button @click="saveTest" :disabled="!newTest.title || newTest.questions.length === 0 || saving"
            class="w-full py-3 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition disabled:opacity-50 active:scale-95">
            {{ saving ? "⏳ Saqlanmoqda..." : "💾 Testni saqlash" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Assign modal -->
    <div v-if="showAssignModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <div
        class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <h2 class="font-black text-lg text-slate-900 dark:text-white mb-1">Guruhga yuborish</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">{{ assigningTest?.title }}</p>
        <div v-if="groups.length === 0" class="text-center py-6">
          <p class="text-slate-400 text-sm">Hali guruh yaratmadingiz</p>
          <button @click="showAssignModal = false; activeTab = 'groups'"
            class="mt-3 px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm">
            Guruh yaratish
          </button>
        </div>
        <div v-else class="space-y-2 mb-4 max-h-60 overflow-y-auto">
          <button v-for="group in groups" :key="group.id" @click="toggleGroup(group.id)"
            :class="selectedGroups.includes(group.id) ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'"
            class="w-full px-4 py-3 rounded-2xl border-2 text-left transition">
            <p class="font-bold text-sm text-slate-900 dark:text-white truncate">{{ group.name }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kod: {{ group.code }}</p>
          </button>
        </div>
        <div class="flex gap-2">
          <button @click="showAssignModal = false"
            class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm">
            Bekor
          </button>
          <button @click="assignTest" :disabled="selectedGroups.length === 0 || assigning"
            class="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-2xl text-sm disabled:opacity-50">
            {{ assigning ? '⏳' : '📤 Yuborish' }}
          </button>
        </div>
      </div>
    </div><!-- Telegram link modal -->
    <div v-if="showTelegramModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <div class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 shadow-2xl">
        <h2 class="font-black text-lg text-slate-900 dark:text-white mb-1">Telegramga ulash</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">{{ linkingGroup?.name }}</p>
        <ol class="text-sm text-slate-700 dark:text-slate-300 space-y-2 mb-4 list-decimal list-inside">
          <li>Botni kanalingizga <b>admin</b> qilib qo'shing</li>
          <li>Kanalga quyidagi kodni xabar qilib yuboring:</li>
        </ol>
        <div class="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-center mb-4">
          <span
            class="text-xl font-black tracking-widest text-orange-500">#{{ linkingGroup?.telegram_link_code }}</span>
        </div>
        <button @click="copyLinkCode" class="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm mb-2">
          📋 Kodni nusxalash
        </button>
        <button @click="showTelegramModal = false"
          class="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm">
          Yopish
        </button>
      </div>
    </div>

    <!-- Send results modal -->
    <div v-if="showSendResultsModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <div
        class="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <h2 class="font-black text-lg text-slate-900 dark:text-white mb-4">Qaysi guruhga yuborilsin?</h2>
        <div v-if="linkedGroups.length === 0" class="text-center py-6">
          <p class="text-slate-400 text-sm">Hech qanday guruh Telegramga ulanmagan</p>
        </div>
        <div v-else class="space-y-2 mb-4">
          <button v-for="g in linkedGroups" :key="g.id" @click="sendResultsToGroup(g.id)" :disabled="sendingResults"
            class="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-left hover:border-indigo-400 transition disabled:opacity-50">
            <p class="font-bold text-sm text-slate-900 dark:text-white">{{ g.name }}</p>
          </button>
        </div>
        <p v-if="sendResultsMsg" class="text-sm text-center mb-3"
          :class="sendResultsError ? 'text-red-500' : 'text-green-600'">
          {{ sendResultsMsg }}
        </p>
        <button @click="showSendResultsModal = false"
          class="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm">
          Yopish
        </button>
      </div>
    </div>
    <!-- Toast -->
    <div v-if="copyToast"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl z-50 whitespace-nowrap max-w-[90vw] truncate">
      ✅ Kod nusxalandi!
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/AuthStore";
import supabase from "../supabase";
import { askAIJson } from "../lib/ai";
import TeacherBlockedStudents from '../components/TeacherBlockedStudents.vue';
const authStore = useAuthStore();
const activeTab = ref("tests");
const tabs = [
  { id: "tests", label: "📋 Testlar" },
  { id: "groups", label: "👥 Guruhlar" },
  { id: "results", label: "📊 Natijalar" },
  { id: "blocked", label: "🚫 Bloklangan" },
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
    `${aiTestTopic.value} mavzusida ${aiCount.value} ta test savol yarat.Mavzuga qarab til tanla. Faqat JSON array: [{"question":"...","options":["A variant","B variant","C variant","D variant"],"answer":"to'g'ri variant (to'liq matn)"}]. Boshqa hech narsa yozma.`,
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
  selectedTest.value = test;
  activeTab.value = "results";
  const { data, error } = await supabase
    .from("test_results")
    .select("*, profiles(full_name, email)")
    .eq("test_id", test.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("test_results yuklashda xato:", error);
  }
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
const showTelegramModal = ref(false);
const linkingGroup = ref<any>(null);
const showSendResultsModal = ref(false);
const sendingResults = ref(false);
const sendResultsMsg = ref("");
const sendResultsError = ref(false);

const linkedGroups = computed(() => groups.value.filter((g: any) => g.telegram_status === "linked"));

const openTelegramLink = (group: any) => {
  linkingGroup.value = group;
  showTelegramModal.value = true;
};

const copyLinkCode = () => {
  navigator.clipboard.writeText(`#${linkingGroup.value.telegram_link_code}`);
  copyToast.value = true;
  setTimeout(() => (copyToast.value = false), 2000);
};

const openSendResults = () => {
  sendResultsMsg.value = "";
  sendResultsError.value = false;
  showSendResultsModal.value = true;
};

const sendResultsToGroup = async (groupId: string) => {
  sendingResults.value = true;
  sendResultsMsg.value = "";
  sendResultsError.value = false;
  const { data: { session } } = await supabase.auth.getSession();
  try {
    const res = await fetch(
      "https://gnuwumkdffpnltrglgxk.supabase.co/functions/v1/send-telegram",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: "send_results",
          testId: selectedTest.value.id,
          groupId,
        }),
      },
    );
    const json = await res.json();
    if (res.ok && json.success) {
      sendResultsMsg.value = `✅ ${json.sent} ta natija yuborildi!`;
      setTimeout(() => (showSendResultsModal.value = false), 1500);
    } else {
      sendResultsError.value = true;
      sendResultsMsg.value = `❌ ${json.error || "Xato yuz berdi"}`;
    }
  } catch (e: any) {
    sendResultsError.value = true;
    sendResultsMsg.value = `❌ ${e.message}`;
  }
  sendingResults.value = false;
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

<style scoped>
/* Scrollbarni yashirish, lekin scroll funksiyasini saqlash (tablar qatori uchun) */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>