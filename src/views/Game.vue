<template>
  <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          ←</RouterLink>
        <div>
          <h1 class="text-xl font-black text-slate-900">🃏 So'z O'yini</h1>
          <p class="text-xs text-slate-500">Kartani oching va juftini toping</p>
        </div>
      </div>

      <!-- Setup screen -->
      <div v-if="!gameStarted" class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
        <h2 class="font-black text-lg text-slate-900 mb-2">So'zlar kiriting</h2>
        <p class="text-sm text-slate-500 mb-4">Har bir qatorga: <span class="font-semibold text-orange-500">so'z =
            tarjima</span></p>

        <div class="space-y-2 mb-4">
          <div v-for="(pair, i) in wordPairs" :key="i" class="flex items-center gap-2">
            <input v-model="pair.word" :placeholder="`So'z ${i + 1}`"
              class="flex-1 min-w-0 px-3 py-2 rounded-xl text-slate-800 border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400" />
            <span class="text-slate-400 font-bold flex-shrink-0">=</span>
            <input v-model="pair.translation" :placeholder="`Tarjima ${i + 1}`"
              class="flex-1 min-w-0 px-3 py-2 rounded-xl text-slate-800 border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-indigo-400" />
            <button v-if="wordPairs.length > 3" @click="wordPairs.splice(i, 1)"
              class="w-7 h-7 flex-shrink-0 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition text-xs flex items-center justify-center">✕</button>
          </div>
        </div>

        <button @click="wordPairs.push({ word: '', translation: '' })"
          class="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-orange-300 hover:text-orange-500 transition mb-4">
          + So'z qo'shish
        </button>

        <div class="mb-4">
          <p class="text-sm font-semibold text-slate-700 mb-2">🤖 AI dan so'rash:</p>
          <div class="flex gap-2">
            <input v-model="aiTopic" placeholder="Mavzu: hayvonlar, ranglar..."
              class="flex-1 min-w-0 px-3 py-2 rounded-xl border text-slate-800 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400" />
            <button @click="generateWords" :disabled="aiLoading"
              class="flex-shrink-0 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition disabled:opacity-60">
              {{ aiLoading ? "⏳" : "🤖 AI" }}
            </button>
          </div>
        </div>

        <button @click="startGame" :disabled="validPairs.length < 3"
          class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 transition disabled:opacity-50 active:scale-95">
          🎮 O'yinni boshlash ({{ validPairs.length }} juft)
        </button>
      </div>

      <!-- Game board -->
      <div v-else>
        <div class="flex items-center justify-between mb-4 bg-white rounded-2xl border border-slate-200 px-4 py-3">
          <div class="text-center">
            <p class="text-xs text-slate-500">Juftlar</p>
            <p class="text-lg font-black text-green-500">{{ matchedCount }}/{{ validPairs.length }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">Urinish</p>
            <p class="text-lg font-black text-orange-500">{{ attempts }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500">Vaqt</p>
            <p class="text-lg font-black text-indigo-500">{{ formatTime(elapsed) }}</p>
          </div>
          <button @click="resetGame"
            class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition">↺</button>
        </div>

        <!-- Cards grid - responsive -->
        <div
          :class="validPairs.length <= 4 ? 'grid-cols-4' : validPairs.length <= 6 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-4'"
          class="grid gap-2">
          <div v-for="card in cards" :key="card.id" @click="flipCard(card)" :class="{
            'bg-white border-slate-200': !card.flipped && !card.matched,
            'bg-orange-500 border-orange-400': card.flipped && !card.matched,
            'bg-green-100 border-green-300': card.matched,
            'cursor-not-allowed opacity-60': card.matched,
            'cursor-pointer hover:border-orange-300 hover:shadow-md': !card.matched,
          }"
            class="aspect-square rounded-2xl border-2 flex items-center justify-center text-center p-1.5 transition-all duration-300 select-none">
            <span v-if="card.flipped || card.matched" :class="card.matched ? 'text-green-700' : 'text-white'"
              class="text-[10px] sm:text-xs font-bold leading-tight break-words text-center">{{ card.text }}</span>
            <span v-else class="text-xl sm:text-2xl">{{ card.type === "word" ? "📘" : "🌐" }}</span>
          </div>
        </div>

        <!-- Win screen -->
        <div v-if="gameWon" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div class="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full">
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-2xl font-black text-slate-900">Zo'r!</h2>
            <p class="text-slate-500 mt-2">{{ attempts }} urinishda {{ formatTime(elapsed) }} da yakunladingiz!</p>
            <div class="flex gap-3 mt-6">
              <button @click="resetGame"
                class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition">Qayta
                o'yna</button>
              <button @click="gameStarted = false"
                class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition">Yangi
                so'zlar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { useCoinStore } from "../stores/CoinStore";
import supabase from "../supabase";
import { askAIJson } from "../lib/ai";
import { saveNotification } from '../lib/Notification';
const coinStore = useCoinStore();

interface WordPair { word: string; translation: string; }
interface Card { id: number; text: string; type: "word" | "translation"; pairId: number; flipped: boolean; matched: boolean; }

const wordPairs = ref<WordPair[]>([{ word: "", translation: "" }, { word: "", translation: "" }, { word: "", translation: "" }]);
const aiTopic = ref(""); const aiLoading = ref(false);
const gameStarted = ref(false); const cards = ref<Card[]>([]);
const flippedCards = ref<Card[]>([]); const attempts = ref(0);
const matchedCount = ref(0); const gameWon = ref(false);
const elapsed = ref(0); let timer: any;

const validPairs = computed(() => wordPairs.value.filter((p) => p.word.trim() && p.translation.trim()));

const generateWords = async () => {
  aiLoading.value = true;
  const pairs = await askAIJson<WordPair[]>(
    `"${aiTopic.value}" mavzusida foydalanuvchi so'ragan tilda so'z va o'zbekcha tarjimasini JSON: [{"word":"...","translation":"..."}]. Boshqa hech narsa yozma.`,
    []
  );
  if (pairs.length) wordPairs.value = pairs.slice(0, 6);
  else alert("AI xatosi. Qayta urinib ko'ring.");
  aiLoading.value = false;
};

const startGame = () => {
  const allCards: Card[] = [];
  validPairs.value.forEach((pair, i) => {
    allCards.push({ id: i * 2, text: pair.word, type: "word", pairId: i, flipped: false, matched: false });
    allCards.push({ id: i * 2 + 1, text: pair.translation, type: "translation", pairId: i, flipped: false, matched: false });
  });
  cards.value = allCards.sort(() => Math.random() - 0.5);
  flippedCards.value = []; attempts.value = 0; matchedCount.value = 0;
  gameWon.value = false; elapsed.value = 0; gameStarted.value = true;
  timer = setInterval(() => elapsed.value++, 1000);
};

const flipCard = async (card: Card) => {
  if (card.matched || card.flipped || flippedCards.value.length >= 2) return;
  card.flipped = true; flippedCards.value.push(card);
  if (flippedCards.value.length === 2) {
    attempts.value++;
    const [a, b] = flippedCards.value;
    if (a.pairId === b.pairId && a.type !== b.type) {
      a.matched = b.matched = true; matchedCount.value++;
      if (matchedCount.value === validPairs.value.length) {
        gameWon.value = true; clearInterval(timer);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("game_results").insert({
            user_id: user.id,
            pairs: validPairs.value.length,
            attempts: attempts.value,
            time_seconds: elapsed.value,
          });
        }
        await coinStore.fetchCoins();
        await coinStore.addProgress(100);
        await saveNotification(
          user.id,
          "So'z o'yini yakunlandi! 🃏",
          `${validPairs.value.length} juft so'z — ${attempts.value} urinishda`,
          '🃏', '100% progress', 'bg-purple-50', 'text-purple-500', 'bg-purple-50 text-purple-600'
        );
      }
      flippedCards.value = [];
    } else {
      setTimeout(() => { a.flipped = b.flipped = false; flippedCards.value = []; }, 1000);
    }
  }
};

const resetGame = () => { clearInterval(timer); gameStarted.value = false; startGame(); };
const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
onUnmounted(() => clearInterval(timer));


</script>
