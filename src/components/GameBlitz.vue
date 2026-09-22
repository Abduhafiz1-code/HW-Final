<template>
  <div class="space-y-4">
    <!-- Sarlavha -->
    <div class="flex items-center gap-3">
      <span class="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none">
        <Zap :size="22" class="text-white" />
      </span>
      <div class="flex-1 min-w-0">
        <h2 class="font-black text-slate-900 dark:text-white text-[15px] flex items-center gap-2">
          Hisob Blitz
          <span class="text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full">Global</span>
        </h2>
        <p class="text-xs text-slate-400 font-semibold">30 soniya — butun dunyo bilan bellashuv</p>
      </div>
    </div>

    <!-- Leaderboard tab -->
    <div v-if="tab === 'board'" class="space-y-4">
      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-sm animate-pop">
        <p class="text-4xl font-black text-slate-900 dark:text-white">{{ best.score }}</p>
        <p class="text-xs text-slate-400 font-bold mt-1">Sizning eng yaxshi natijangiz</p>
        <button @click="startGame"
          class="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-sm shadow-lg shadow-rose-200 dark:shadow-none hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2">
          <Play :size="17" /> O'ynash
        </button>
      </div>

      <!-- Top 20 -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <p class="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Trophy :size="14" class="text-amber-500" /> Global TOP-20
        </p>
        <div v-if="loadingBoard" class="py-8 text-center text-xs text-slate-400 font-semibold">Yuklanmoqda...</div>
        <div v-else-if="board.length === 0" class="py-8 text-center">
          <p class="text-xs text-slate-400 font-semibold">Hali hech kim o'ynamagan — birinchi bo'ling!</p>
        </div>
        <div v-else class="space-y-1.5">
          <div v-for="(row, i) in board" :key="row.user_id"
            class="flex items-center gap-3 rounded-2xl px-3 py-2 transition"
            :class="row.user_id === authStore.user?.id ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 ring-1 ring-orange-200 dark:ring-orange-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'">
            <span class="w-7 text-center font-black text-sm flex-shrink-0"
              :class="i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-400'">
              {{ i + 1 }}
            </span>
            <AvatarFrame :src="row.avatar_url" :initial="row.name?.charAt(0) || '?'" :frame="row.avatar_frame || 'none'" :size="34" />
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">
                {{ row.name || "Anonim" }}
                <span v-if="row.user_id === authStore.user?.id" class="text-[10px] text-orange-500 font-black">(SIZ)</span>
              </p>
            </div>
            <span class="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 flex-shrink-0">
              <Zap :size="13" /> {{ row.score }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Game tab -->
    <div v-else class="space-y-4">
      <!-- HUD -->
      <div class="flex items-center justify-between text-xs font-black">
        <span class="text-slate-400">Hisob: <span class="text-slate-900 dark:text-white">{{ score }}</span></span>
        <span class="flex items-center gap-1"
          :class="timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-rose-500'">
          <Timer :size="14" /> {{ timeLeft }}s
        </span>
        <span :class="streak >= 3 ? 'text-orange-500' : 'text-slate-400'">
          {{ streak >= 3 ? `🔥 x${streak} seriya!` : `Seriya: ${streak}` }}
        </span>
      </div>
      <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
          :style="{ width: `${(timeLeft / TIME) * 100}%` }"></div>
      </div>

      <!-- Savol -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
        <p class="text-xs text-slate-400 font-black uppercase tracking-wider mb-2">Hisoblang</p>
        <p class="text-4xl font-black text-slate-900 dark:text-white">{{ q.text }}</p>
      </div>

      <!-- Javoblar -->
      <div class="grid grid-cols-2 gap-3">
        <button v-for="opt in q.options" :key="opt" @click="answer(opt)"
          class="py-4 rounded-2xl border-2 font-black text-xl transition-all active:scale-95"
          :class="answerCls(opt)">
          {{ opt }}
        </button>
      </div>

      <button @click="tab = 'board'"
        class="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
        Natijalarni ko'rish
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Zap, Timer, Trophy, Play } from "@lucide/vue";
import supabase from "../supabase";
import { useAuthStore } from "../stores/AuthStore";
import { useCoinStore } from "../stores/CoinStore";
import { saveNotification } from "../lib/Notification";
import AvatarFrame from "./AvatarFrame.vue";
import { playDing, playBuzz, playFanfare } from "../lib/sound";

const authStore = useAuthStore();
const coinStore = useCoinStore();

const TIME = 30;
const tab = ref<"board" | "game">("board");
const loadingBoard = ref(true);
const board = ref<any[]>([]);

const score = ref(0);
const streak = ref(0);
const timeLeft = ref(TIME);
const best = ref<{ score: number }>({ score: 0 });
const q = ref<{ text: string; answer: number; options: number[] }>({ text: "", answer: 0, options: [] });
const picked = ref<number | null>(null);
let timerId: number | null = null;
let bestSaved = false;

/* ── Savol generatori: daraja oshgani sari qiyinlashadi ── */
const genQ = () => {
  const lvl = Math.min(5, 1 + Math.floor(score.value / 6));
  const ops = lvl >= 3 ? ["+", "-", "×", "÷"] : lvl >= 2 ? ["+", "-", "×"] : ["+", "-"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, ans: number;
  switch (op) {
    case "+": a = 10 + Math.floor(Math.random() * 20 * lvl); b = 5 + Math.floor(Math.random() * 15 * lvl); ans = a + b; break;
    case "-": a = 20 + Math.floor(Math.random() * 25 * lvl); b = 5 + Math.floor(Math.random() * 18 * lvl); ans = a - Math.min(b, a - 1); break;
    case "×": a = 2 + Math.floor(Math.random() * (4 + lvl)); b = 2 + Math.floor(Math.random() * (3 + lvl)); ans = a * b; break;
    default: b = 2 + Math.floor(Math.random() * (2 + lvl)); ans = 2 + Math.floor(Math.random() * (6 + lvl)); a = b * ans; break;
  }
  const text = `${a} ${op} ${b}`;
  const opts = new Set<number>([ans]);
  while (opts.size < 4) {
    const delta = 1 + Math.floor(Math.random() * Math.max(4, Math.round(Math.abs(ans) * 0.25)));
    const cand = Math.random() < 0.5 ? ans + delta : ans - delta;
    if (cand !== ans && cand >= 0) opts.add(cand);
  }
  q.value = { text, answer: ans, options: [...opts].sort(() => Math.random() - 0.5) };
};

/* ── Global leaderboard: eng yaxshi natijalar (Supabase view/RLS) ── */
const loadBoard = async () => {
  loadingBoard.value = true;
  try {
    const { data, error } = await supabase
      .from("blitz_scores_top")
      .select("*")
      .limit(20);
    if (!error && data) board.value = data;
    else {
      // Fallback: view bo'lmasa to'g'ridan-to'g'ri jadvaldan
      const { data: raw } = await supabase
        .from("blitz_scores")
        .select("user_id, score")
        .order("score", { ascending: false })
        .limit(20);
      board.value = raw || [];
    }
  } catch {
    board.value = [];
  }
  loadingBoard.value = false;
};

/* ── O'yin ── */
const startGame = async () => {
  score.value = 0;
  streak.value = 0;
  timeLeft.value = TIME;
  picked.value = null;
  bestSaved = false;
  tab.value = "game";
  genQ();
  timerId = window.setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) finish();
  }, 1000);
};

const answerCls = (opt: number) => {
  if (picked.value === null)
    return "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-rose-300";
  if (opt === q.value.answer) return "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
  if (opt === picked.value) return "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600";
  return "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400";
};

const answer = (opt: number) => {
  if (picked.value !== null) return;
  picked.value = opt;
  if (opt === q.value.answer) {
    streak.value++;
    score.value += streak.value >= 3 ? 2 : 1; // seriya bonusi
    playDing();
  } else {
    streak.value = 0;
    timeLeft.value = Math.max(1, timeLeft.value - 2); // xato = -2s
    playBuzz();
  }
  setTimeout(() => {
    picked.value = null;
    genQ();
  }, 280);
};

const finish = async () => {
  if (timerId) { clearInterval(timerId); timerId = null; }
  tab.value = "board";
  loadingBoard.value = true;
  // 🔊 Yakunda: yangi rekord bo'lsa fanfara
  const { data: { user } } = await supabase.auth.getUser();
  if (user && score.value > (best.value.score || 0)) playFanfare();
  await saveScore();
  await loadBoard();
};

const saveScore = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || score.value <= 0 || bestSaved) return;
  bestSaved = true;

  // Faqat eng yaxshi natija saqlanadi
  const { data: existing } = await supabase
    .from("blitz_scores")
    .select("score")
    .eq("user_id", user.id)
    .maybeSingle();
  const prev = existing?.score ?? 0;
  if (score.value <= prev) return;

  await supabase.from("blitz_scores").upsert(
    { user_id: user.id, score: score.value, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );

  // Yangi rekord → mukofot: tanga + bildirishnoma
  const gained = Math.min(30, score.value);
  const { data: row } = await supabase.from("coins").select("coins").eq("user_id", user.id).single();
  if (row) {
    const newCoins = (row.coins ?? 0) + gained;
    await supabase.from("coins").update({ coins: newCoins }).eq("user_id", user.id);
    coinStore.coins = newCoins;
  }
  await saveNotification(
    user.id,
    "Yangi blitz rekord!",
    `Hisob Blitz: ${score.value} ball (+${gained} tanga)`,
    "Zap",
    "Rekordni yangiladingiz!",
    "bg-rose-50",
    "text-rose-500",
    "bg-rose-50 text-rose-600",
  );
};

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: my } = await supabase
      .from("blitz_scores")
      .select("score")
      .eq("user_id", user.id)
      .maybeSingle();
    best.value = { score: my?.score ?? 0 };
  }
  await loadBoard();
});

onUnmounted(() => { if (timerId) clearInterval(timerId); });
</script>
