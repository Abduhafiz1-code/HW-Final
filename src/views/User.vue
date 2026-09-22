<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white px-4 pt-6 pb-28 transition-colors duration-300">
    <div class="max-w-lg mx-auto">
      <!-- Profile Header -->
      <div class="text-center mb-10 mt-4">
        <div
          class="relative w-full rounded-[2rem] overflow-hidden min-h-[180px] mb-4">
          <!-- Orqa fon rasmi (Profilni tahrirlash'da yuklanadi) -->
          <template v-if="authStore.profileBgUrl">
            <img
              :src="authStore.profileBgUrl"
              alt=""
              class="absolute inset-0 w-full h-full object-cover animate-fade-in" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-slate-900 dark:via-slate-900/70"></div>
          </template>
          <div class="relative flex items-end justify-center pt-8 pb-4 w-full">
            <AvatarFrame
              :src="authStore.avatarUrl"
              :initial="
                authStore.displayName
                  ? authStore.displayName[0].toUpperCase()
                  : 'U'
              "
              :frame="authStore.avatarFrame"
              :size="96"
              class="shadow-xl shadow-orange-500/25" />
          </div>
        </div>

        <h2 class="text-xl font-black">
          {{ authStore.displayName || "Foydalanuvchi" }}
        </h2>
        <p class="text-sm text-slate-500 dark:text-white/60">
          {{ authStore.user?.email }}
        </p>
        <div
          v-if="isPremium"
          class="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Crown :size="12" /> Premium
        </div>
      </div>

      <!-- Quiz Summary -->
      <div
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 :size="18" class="text-orange-500" /> Test natijalari
        </h3>
        <div class="flex justify-around text-center">
          <div>
            <p class="text-2xl font-black text-slate-900 dark:text-white">
              {{ stats.total }}
            </p>
            <p class="text-xs text-slate-500 dark:text-white/60">
              Jami testlar
            </p>
          </div>
          <div>
            <p class="text-2xl font-black text-green-600 dark:text-green-400">
              {{ stats.best }}%
            </p>
            <p class="text-xs text-slate-500 dark:text-white/60">Eng yaxshi</p>
          </div>
          <div>
            <p class="text-2xl font-black text-orange-500">{{ stats.avg }}%</p>
            <p class="text-xs text-slate-500 dark:text-white/60">O'rtacha</p>
          </div>
        </div>
        <!-- Tur bo'yicha: AI test / ustoz testi -->
        <div v-if="stats.solo || stats.teacher" class="flex justify-center gap-2 mt-3 flex-wrap">
          <span v-if="stats.solo"
            class="inline-flex items-center gap-1 text-[11px] font-black bg-indigo-50 dark:bg-indigo-500/15 text-indigo-500 px-2.5 py-1 rounded-lg">
            <Brain :size="12" /> AI test: {{ stats.solo }}
          </span>
          <span v-if="stats.teacher"
            class="inline-flex items-center gap-1 text-[11px] font-black bg-orange-50 dark:bg-orange-500/15 text-orange-500 px-2.5 py-1 rounded-lg">
            <User :size="12" /> Ustoz testi: {{ stats.teacher }}
          </span>
        </div>
        <!-- Fanlar bo'yicha ko'rsatkich -->
        <div v-if="stats.subjects.length" class="flex justify-center gap-1.5 mt-2 flex-wrap">
          <span v-for="s in stats.subjects" :key="s.subject"
            class="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-md">
            {{ s.subject }} · {{ s.avg_percent }}%
          </span>
        </div>
        <div
          v-if="stats.total === 0"
          class="mt-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-100 dark:border-orange-900/40 px-4 py-4 text-center animate-fade-in-up">
          <p class="text-2xl mb-1">🚀</p>
          <p class="text-sm font-black text-orange-600 dark:text-orange-400">
            Bu yerdan boshlanadi!
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hali test yechmagansiz — birinchi testni yechedsiz, natija shu yerda
            ko'rinadi va reytingga chiqasiz.
          </p>
          <RouterLink
            to="/solo-quiz"
            class="mt-2.5 inline-block px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-black hover:bg-orange-600 active:scale-95 transition shadow-sm shadow-orange-200 dark:shadow-none">
            Birinchi testni boshlash →
          </RouterLink>
        </div>
      </div>

      <!-- Profil ramkalari do'koni (olmosga sotib olinadi) -->
      <div
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <div class="flex items-center justify-between mb-3">
          <h3
            class="font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles :size="18" class="text-purple-500" /> Ramka do'koni
          </h3>
          <span
            class="flex items-center gap-1 text-cyan-500 font-black text-xs bg-cyan-50 dark:bg-cyan-900/30 rounded-full px-2.5 py-1">
            <Gem :size="13" /> {{ coinStore.diamonds }}
          </span>
        </div>

        <!-- Kategoriya tablari -->
        <div class="flex gap-1.5 mb-2">
          <button
            v-for="(label, cat) in CATEGORY_LABELS"
            :key="cat"
            @click="activeCategory = cat"
            class="flex-1 py-2 rounded-xl text-[11px] font-black transition-all"
            :class="
              activeCategory === cat
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-200 dark:shadow-none scale-[1.02]'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            ">
            {{ label }}
          </button>
        </div>

        <!-- pt-6/pb-3: toj/shlyapa/quloqlar SVG kesilmasligi uchun hoshiya -->
        <div class="grid grid-cols-4 gap-x-1 gap-y-5 px-1 pt-6 pb-3">
          <button
            v-for="f in visibleFrames"
            :key="f.key"
            @click="openFrameModal(f)"
            class="flex flex-col items-center gap-1.5 group overflow-visible">
            <span
              class="relative flex items-center justify-center overflow-visible px-3 py-2 rounded-3xl transition"
              :class="
                authStore.avatarFrame === f.key
                  ? 'bg-orange-50 dark:bg-orange-500/10 ring-2 ring-orange-400'
                  : 'group-hover:bg-slate-50 dark:group-hover:bg-white/5'
              ">
              <!-- Faol ramka: yashil checkmark belgisi -->
              <span
                v-if="authStore.avatarFrame === f.key"
                class="absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center animate-pop">
                <Check :size="12" class="text-white" />
              </span>
              <!-- FOYDALANUVCHINING O'Z AVATARI har ramkada — "menga qanday yarashadi" -->
              <AvatarFrame
                :src="authStore.avatarUrl"
                :initial="
                  authStore.displayName
                    ? authStore.displayName[0].toUpperCase()
                    : 'U'
                "
                :frame="f.key"
                :size="44" />
            </span>
            <span
              class="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight"
              >{{ f.label }}</span
            >
            <!-- Holat: Faol / Sizniki / Yutuq / Narx -->
            <span
              v-if="authStore.avatarFrame === f.key"
              class="text-[9px] font-black text-green-500"
              >Faol</span
            >
            <span
              v-else-if="authStore.ownedFrames.includes(f.key) && f.cost > 0"
              class="text-[9px] font-black text-slate-400"
              >Sizniki</span
            >
            <span
              v-else-if="f.achievement"
              class="text-[9px] font-black text-amber-500 flex items-center gap-0.5">
              <Trophy :size="9" /> Yutuq
            </span>
            <span
              v-else-if="f.cost === 0"
              class="text-[9px] font-black text-slate-400"
              >Bepul</span
            >
            <span
              v-else-if="frameCurrency(f) === 'coin'"
              class="text-[10px] font-black text-amber-500 flex items-center gap-0.5">
              <Coins :size="10" /> {{ f.cost }}
            </span>
            <span
              v-else
              class="text-[10px] font-black text-cyan-500 flex items-center gap-0.5">
              <Gem :size="10" /> {{ f.cost }}
            </span>
          </button>
        </div>
        <p v-if="frameError" class="text-xs text-red-500 mt-3">
          {{ frameError }}
        </p>

        <!-- Ramka xarid/ko'rish modali -->
        <Transition name="fade">
          <div
            v-if="modalFrame"
            class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            @click.self="modalFrame = null">
            <div
              class="bg-white dark:bg-slate-800 rounded-[2rem] p-7 w-full max-w-xs text-center shadow-2xl relative animate-pop">
              <!-- Yopish -->
              <button
                @click="modalFrame = null"
                class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition">
                <X :size="16" />
              </button>

              <p
                class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ramka do'koni
              </p>
              <h3
                class="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {{ modalFrame.label }}
              </h3>
              <span
                class="inline-block mt-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-lg"
                :class="rarityStyle(modalFrame.rarity).chip"
                >{{ rarityStyle(modalFrame.rarity).label }}</span
              >

              <!-- KATTA preview: foydalanuvchining o'z avatari bilan -->
              <div class="flex justify-center py-7">
                <AvatarFrame
                  :src="authStore.avatarUrl"
                  :initial="
                    authStore.displayName
                      ? authStore.displayName[0].toUpperCase()
                      : 'U'
                  "
                  :frame="modalFrame.key"
                  :size="110" />
              </div>

              <!-- Narx / yutuq sharti -->
              <div
                v-if="modalFrame.achievement"
                class="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-3 text-xs font-bold text-amber-600 dark:text-amber-300 flex items-center justify-center gap-1.5">
                <Trophy :size="14" /> {{ modalFrame.achievement.label }} — bepul
                ochiladi!
              </div>
              <!-- Tanga narxi -->
              <div
                v-else-if="
                  modalFrame.cost > 0 &&
                  frameCurrency(modalFrame) === 'coin' &&
                  !authStore.ownedFrames.includes(modalFrame.key)
                "
                class="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-3 text-sm font-black text-amber-600 dark:text-amber-300 flex items-center justify-center gap-1.5">
                <Coins :size="16" /> {{ modalFrame.cost }} tanga
                <span class="text-[10px] font-bold text-slate-400"
                  >(sizda {{ coinStore.coins }})</span
                >
              </div>
              <!-- Olmos narxi -->
              <div
                v-else-if="
                  modalFrame.cost > 0 &&
                  !authStore.ownedFrames.includes(modalFrame.key)
                "
                class="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl px-4 py-3 text-sm font-black text-cyan-600 dark:text-cyan-300 flex items-center justify-center gap-1.5">
                <Gem :size="16" /> {{ modalFrame.cost }} olmos
                <span class="text-[10px] font-bold text-slate-400"
                  >(sizda {{ coinStore.diamonds }})</span
                >
              </div>
              <div
                v-else
                class="bg-green-50 dark:bg-green-900/20 rounded-2xl px-4 py-3 text-sm font-black text-green-600 dark:text-green-300 flex items-center justify-center gap-1.5">
                <Check :size="16" /> Sizda mavjud
              </div>

              <!-- CTA tugmalar -->
              <button
                v-if="
                  authStore.avatarFrame !== modalFrame.key &&
                  (authStore.ownedFrames.includes(modalFrame.key) ||
                    (modalFrame.cost === 0 && !modalFrame.achievement))
                "
                @click="
                  selectFrame(modalFrame.key);
                  modalFrame = null;
                "
                class="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-sm hover:opacity-90 active:scale-[0.98] transition shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2">
                <Check :size="16" /> Kiyish
              </button>
              <button
                v-else-if="
                  modalFrame.achievement && !achievementUnlocked(modalFrame)
                "
                disabled
                class="w-full mt-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <Lock :size="15" /> {{ modalFrame.achievement.label }} kerak
              </button>
              <button
                v-else-if="
                  modalFrame.achievement && achievementUnlocked(modalFrame)
                "
                @click="claimAchievementFrame"
                :disabled="buying"
                class="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm hover:opacity-90 active:scale-[0.98] transition shadow-lg shadow-amber-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2">
                <Trophy :size="15" />
                {{ buying ? "Ochilmoqda..." : "Yutuqni olish" }}
              </button>
              <button
                v-else-if="
                  modalFrame.cost > 0 &&
                  !authStore.ownedFrames.includes(modalFrame.key)
                "
                @click="buyAndWear"
                :disabled="
                  (frameCurrency(modalFrame) === 'coin'
                    ? coinStore.coins
                    : coinStore.diamonds) < modalFrame.cost || buying
                "
                :class="
                  frameCurrency(modalFrame) === 'coin'
                    ? 'from-amber-400 to-orange-500 shadow-amber-200 dark:shadow-none'
                    : 'from-purple-500 to-indigo-600 shadow-purple-200 dark:shadow-none'
                "
                class="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r text-white font-black text-sm hover:opacity-90 active:scale-[0.98] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Loader v-if="buying" :size="15" class="animate-spin" />
                <template v-else>
                  <Coins v-if="frameCurrency(modalFrame) === 'coin'" :size="15" />
                  <Gem v-else :size="15" />
                </template>
                {{ buying ? "Sotib olinmoqda..." : "Sotib olish va kiyish" }}
              </button>
              <p v-if="frameError" class="text-xs text-red-500 mt-3 font-bold">
                {{ frameError }}
              </p>
            </div>

            <!-- Xarid konfeti: ramka sotib olinganda -->
            <CelebrationOverlay
              :show="purchaseCelebrated"
              variant="win"
              title="Ramka sizniki! 🎉"
              :subtitle="`${modalFrameLabel} endi avataringizni bezaydi`"
              primary-label="Chiroyli!"
              @primary="finishPurchase" />
          </div>
        </Transition>
      </div>

      <!-- Menu Items -->
      <div class="space-y-2 mb-6">
        <RouterLink
          to="/settings"
          class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <SettingsIcon :size="18" class="text-slate-400" /> Sozlamalar
          </span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>
        <RouterLink
          to="/about"
          class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <Info :size="18" class="text-slate-400" /> Ilova haqida
          </span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>

        <RouterLink
          to="/history"
          class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <History :size="18" class="text-slate-400" /> Tarix
          </span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>

        <RouterLink
          to="/premium"
          class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/20 hover:shadow-md transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <Crown :size="18" class="text-amber-500" /> Premium
          </span>
          <span
            class="text-amber-500 font-bold text-xs flex items-center gap-1">
            <Crown :size="14" />
          </span>
        </RouterLink>

        <RouterLink
          to="/feedback"
          class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <MessageSquareHeart :size="18" class="text-slate-400" /> Fikr
            bildirish
          </span>
          <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
        </RouterLink>
      </div>

      <!-- Sign Out -->
      <button
        @click="handleSignOut"
        class="w-full py-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition flex items-center justify-center gap-2">
        <LogOut :size="18" /> Chiqish
      </button>
    </div>

    <!-- Onboarding Tooltip -->
    <OnboardingTooltip
      pageId="User"
      title="Profil"
      description="Shaxsiy profil va sozlamalar" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  BarChart3,
  LogOut,
  Crown,
  ChevronRight,
  Sparkles,
  Gem,
  Settings as SettingsIcon,
  History,
  MessageSquareHeart,
  Info,
  Check,
  X,
  Trophy,
  Lock,
  Loader,
  Coins,
  Brain,
  User,
} from "@lucide/vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/AuthStore";
import { useCoinStore } from "../stores/CoinStore";
import supabase from "../supabase";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";
import AvatarFrame from "../components/AvatarFrame.vue";
import CelebrationOverlay from "../components/CelebrationOverlay.vue";
import {
  FRAME_CATALOG,
  frameCost,
  frameCurrency,
  CATEGORY_LABELS,
  rarityStyle,
  type FrameOption,
} from "../lib/frames";

const router = useRouter();
const authStore = useAuthStore();
const coinStore = useCoinStore();
const isPremium = computed(() => authStore.isPremium);
const stats = ref({
  total: 0,
  best: 0,
  avg: 0,
  solo: 0,
  teacher: 0,
  subjects: [] as { subject: string; avg_percent: number }[],
});

onMounted(() => {
  loadStats();
  coinStore.fetchCoins();
  loadAchievementProgress();
});

// Profil ramkalari do'koni — kategoriyalar, modal, konfeti
const frameError = ref("");
type Category = FrameOption["category"];
const activeCategory = ref<Category>("colors");
const visibleFrames = computed(() =>
  FRAME_CATALOG.filter((f) => f.category === activeCategory.value),
);

// Modal holati
const modalFrame = ref<FrameOption | null>(null);
const buying = ref(false);
const purchaseCelebrated = ref(false);
const modalFrameLabel = computed(() => modalFrame.value?.label ?? "");

const openFrameModal = (f: FrameOption) => {
  frameError.value = "";
  modalFrame.value = f;
};

// Yutuq sharti bajarilganini tekshirish
const achievementProgress = ref<{ streak: number; tests: number }>({
  streak: 0,
  tests: 0,
});
const achievementUnlocked = (f: FrameOption) => {
  if (!f.achievement) return false;
  const progress =
    f.achievement.type === "streak"
      ? achievementProgress.value.streak
      : achievementProgress.value.tests;
  return progress >= f.achievement.target;
};

const loadAchievementProgress = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const [streakRes, testsRes] = await Promise.all([
      supabase
        .from("streaks")
        .select("streak_count")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("test_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);
    achievementProgress.value = {
      streak: streakRes.data?.streak_count || 0,
      tests: testsRes.count || 0,
    };
  } catch {
    /* jimgina */
  }
};

const claimAchievementFrame = async () => {
  if (!modalFrame.value?.achievement) return;
  buying.value = true;
  const res = await authStore.unlockFrame(modalFrame.value.key);
  if (res.ok) {
    purchaseCelebrated.value = true;
  } else {
    frameError.value = res.error
      ? `Xatolik: ${res.error}`
      : "Ramkani ochishda xatolik.";
  }
  buying.value = false;
};

const buyAndWear = async () => {
  if (!modalFrame.value) return;
  const key = modalFrame.value.key;
  const cost = modalFrame.value.cost;
  const currency = frameCurrency(modalFrame.value);

  buying.value = true;
  // 1) Avval pulni yechamiz (rollback bilan)
  const paid =
    currency === 'coin'
      ? await coinStore.spendCoins(cost)
      : await coinStore.spendDiamonds(cost);
  if (!paid) {
    frameError.value =
      currency === 'coin'
        ? `Bu ramka uchun ${cost} tanga kerak. Sizda ${coinStore.coins} bor.`
        : `Bu ramka uchun ${cost} olmos kerak. Sizda ${coinStore.diamonds} bor.`;
    buying.value = false;
    return;
  }
  // 2) Ramkani ochamiz
  const res = await authStore.unlockFrame(key);
  if (!res.ok) {
    // pul qaytaramiz
    if (currency === 'coin') await coinStore.addCoins(cost);
    else await coinStore.spendDiamonds(-cost);
    frameError.value = res.error
      ? `Xatolik: ${res.error}`
      : "Sotib olishda xatolik yuz berdi.";
    buying.value = false;
    return;
  }
  // 3) Darhol kiyamiz
  await authStore.setAvatarFrame(key);
  buying.value = false;
  // Xarid konfeti!
  purchaseCelebrated.value = true;
};

const finishPurchase = () => {
  purchaseCelebrated.value = false;
  modalFrame.value = null;
};

const selectFrame = async (key: string) => {
  frameError.value = "";
  if (authStore.avatarFrame === key) return;

  const alreadyOwned = authStore.ownedFrames.includes(key);
  const cost = frameCost(key);

  // Egalik qilingan (yoki bepul) ramkani kiyish — olmos yechilmaydi
  if (alreadyOwned || cost === 0) {
    const res = await authStore.setAvatarFrame(key);
    if (!res.ok)
      frameError.value = res.error
        ? `Xatolik: ${res.error}`
        : "Ramkani saqlashda xatolik yuz berdi.";
    return;
  }

  // Yangi ramka — sotib olish kerak (valyutaga qarab)
  const currency = frameCurrency(
    FRAME_CATALOG.find((f) => f.key === key) || ({ cost } as any),
  );
  const paid =
    currency === 'coin'
      ? await coinStore.spendCoins(cost)
      : await coinStore.spendDiamonds(cost);
  if (!paid) {
    frameError.value =
      currency === 'coin'
        ? `Bu ramka uchun ${cost} tanga kerak. Sizda ${coinStore.coins} bor.`
        : `Bu ramka uchun ${cost} olmos kerak. Sizda ${coinStore.diamonds} bor.`;
    return;
  }

  const res = await authStore.unlockFrame(key);
  if (!res.ok) {
    // pul qaytaramiz
    if (currency === 'coin') await coinStore.addCoins(cost);
    else await coinStore.spendDiamonds(-cost);
    frameError.value = res.error
      ? `Xatolik: ${res.error}`
      : "Ramkani saqlashda xatolik yuz berdi.";
    return;
  }
};

const loadStats = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Yagona statistika: AI test + ustoz testi JAMI (get_user_stats RPC,
  // SUPABASE_UPDATE_13.sql). RPC bo'lmasa — faqat test_results fallback.
  const { data } = await supabase.rpc("get_user_stats", {
    target_user_id: user.id,
  });
  if (data) {
    const s = typeof data === "string" ? JSON.parse(data) : data;
    stats.value.total = s.total_tests || 0;
    stats.value.best = s.best_percent || 0;
    stats.value.avg = s.avg_percent || 0;
    stats.value.solo = s.by_mode?.solo || 0;
    stats.value.teacher = s.by_mode?.teacher || 0;
    stats.value.subjects = s.subjects || [];
    return;
  }

  // Fallback: eski bazada RPC yo'q bo'lsa — faqat ustoz testlari
  const { data: fallback } = await supabase
    .from("test_results")
    .select("percent")
    .eq("user_id", user.id);
  if (fallback && fallback.length > 0) {
    stats.value.total = fallback.length;
    stats.value.best = Math.max(...fallback.map((d: any) => d.percent));
    stats.value.avg = Math.round(
      fallback.reduce((s: number, d: any) => s + d.percent, 0) / fallback.length,
    );
  }
};

const handleSignOut = async () => {
  await authStore.signOut();
  router.push("/login");
};
</script>
