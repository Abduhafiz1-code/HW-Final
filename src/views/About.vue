<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white px-4 pt-6 pb-28 transition-colors duration-300">
    <div class="max-w-lg mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6 mt-2">
        <button
          @click="router.back()"
          class="w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 transition">
          <ArrowLeft :size="18" />
        </button>
        <h1 class="text-xl font-black">Ilova haqida</h1>
      </div>

      <!-- Hero -->
      <div class="text-center mb-6">
        <div
          class="w-20 h-20 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/25">
          <GraduationCap :size="36" class="text-white" />
        </div>
        <h2 class="text-2xl font-black">Socrati</h2>
        <p class="text-sm text-slate-500 dark:text-white/60">Versiya 2.0.5</p>
        <p
          class="text-sm text-slate-600 dark:text-white/70 mt-2 max-w-xs mx-auto leading-relaxed">
          O'quvchilarga uy vazifasi, testlar va o'yinlar orqali bilim olishda
          yordam beruvchi ilova
        </p>
      </div>

      <!-- Nima qila oladi -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles :size="18" class="text-orange-500" /> Ilova nima qila oladi
        </h3>
        <div class="space-y-3">
          <div
            v-for="f in features"
            :key="f.title"
            class="flex items-start gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :class="f.bg">
              <component :is="f.icon" :size="16" :class="f.color" />
            </div>
            <div>
              <p class="font-bold text-sm text-slate-800 dark:text-white/90">
                {{ f.title }}
              </p>
              <p class="text-xs text-slate-500 dark:text-white/50">
                {{ f.desc }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- So'nggi yangilanishlar -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles :size="18" class="text-orange-500" /> So'nggi yangilanishlar
        </h3>
        <div class="space-y-3">
          <div
            v-for="update in updates"
            :key="update.title"
            class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
              <component :is="update.icon" :size="15" />
            </div>
            <div>
              <p class="font-bold text-sm text-slate-800 dark:text-white/90">
                {{ update.title }}
              </p>
              <p class="text-xs text-slate-500 dark:text-white/50">
                {{ update.desc }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Qanday foydalanish -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen :size="18" class="text-sky-500" /> Qanday foydalanish
        </h3>
        <div class="space-y-3">
          <div
            v-for="(step, i) in steps"
            :key="i"
            class="flex items-start gap-3">
            <span
              class="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-500 text-xs font-black flex items-center justify-center shrink-0"
              >{{ i + 1 }}</span
            >
            <p class="text-sm text-slate-600 dark:text-white/70 pt-0.5">
              {{ step }}
            </p>
          </div>
        </div>
      </section>

      <!-- Ulashish -->
      <section
        class="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-500/10 dark:to-sky-500/10 rounded-3xl border border-cyan-200 dark:border-cyan-500/20 p-5 mb-4">
        <h3
          class="font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Share2 :size="18" class="text-cyan-500" /> Do'stlaringizga ulashing
        </h3>
        <p class="text-xs text-slate-500 dark:text-white/60 mb-4">
          Ilovani ulashing va har bir platforma uchun
          <span class="font-bold text-cyan-600 dark:text-cyan-400"
            >+10 olmos</span
          >
          yutib oling!
        </p>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="p in shareOptions"
            :key="p.key"
            @click="shareApp(p.key)"
            class="flex flex-col items-center gap-1.5 group">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-active:scale-90 transition"
              :class="p.bg">
              <component :is="p.icon" :size="20" class="text-white" />
            </div>
            <span
              class="text-[10px] font-bold text-slate-500 dark:text-white/50"
              >{{ p.label }}</span
            >
            <span
              v-if="shared[p.key]"
              class="text-[9px] font-black text-green-500 flex items-center gap-0.5">
              <Check :size="9" /> +10
            </span>
          </button>
        </div>
        <p
          v-if="shareMessage"
          class="text-xs text-cyan-600 dark:text-cyan-400 font-bold mt-3 flex items-center gap-1">
          <Gem :size="12" /> {{ shareMessage }}
        </p>
      </section>

      <!-- Dasturchi -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Code2 :size="18" class="text-purple-500" /> Dasturchi
        </h3>
        <p class="font-bold text-slate-900 dark:text-white">
          Abduhafiz Qodirov
        </p>
        <p class="text-xs text-slate-500 dark:text-white/60">
          Qo'qon, O'zbekiston
        </p>
        <p class="text-xs text-slate-500 dark:text-white/60 mb-4">
          Full-stack dasturchi & AI muhandisi
        </p>
        <a
          href="mailto:qodirovabduhafiz1@gmail.com"
          class="block w-full py-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl text-orange-600 dark:text-orange-400 font-bold text-sm text-center hover:bg-orange-100 dark:hover:bg-orange-500/20 transition flex items-center justify-center gap-2">
          <Mail :size="16" /> qodirovabduhafiz1@gmail.com
        </a>
      </section>

      <RouterLink
        to="/feedback"
        class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-4 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
        <span
          class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
          <MessageSquareText :size="18" class="text-sky-500" /> Fikr bildirish
        </span>
        <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, markRaw } from "vue";
import { useRouter, RouterLink } from "vue-router";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  Share2,
  Code2,
  Mail,
  Check,
  Gem,
  ChevronRight,
  MessageSquareText,
  Users,
  Gamepad2,
  Languages,
  Bot,
  Trophy,
  TrendingUp,
  Send,
  RotateCcw,
  Zap,
  ShieldCheck,
} from "@lucide/vue";
import { useCoinStore } from "../stores/CoinStore";
import supabase from "../supabase";

const router = useRouter();
const coinStore = useCoinStore();

const features = [
  {
    title: "Testlar va o'yinlar",
    desc: "Fanlar bo'yicha testlar yeching, bilimingizni sinang",
    icon: markRaw(Trophy),
    bg: "bg-amber-100 dark:bg-amber-500/20",
    color: "text-amber-500",
  },
  {
    title: "Do'stlar bilan chat",
    desc: "Do'stlaringiz bilan real vaqtda yozishing",
    icon: markRaw(Users),
    bg: "bg-sky-100 dark:bg-sky-500/20",
    color: "text-sky-500",
  },
  {
    title: "Birgalikda test (Co-op)",
    desc: "Do'stlaringiz bilan bir vaqtda test yeching",
    icon: markRaw(Gamepad2),
    bg: "bg-green-100 dark:bg-green-500/20",
    color: "text-green-500",
  },
  {
    title: "AI yordamchi",
    desc: "Uy vazifalarida sun'iy intellektdan yordam oling",
    icon: markRaw(Bot),
    bg: "bg-purple-100 dark:bg-purple-500/20",
    color: "text-purple-500",
  },
  {
    title: "Tarjimon",
    desc: "Matnlarni tez va aniq tarjima qiling",
    icon: markRaw(Languages),
    bg: "bg-cyan-100 dark:bg-cyan-500/20",
    color: "text-cyan-500",
  },
  {
    title: "Reyting jadvali",
    desc: "Boshqa foydalanuvchilar orasida o'rningizni ko'ring",
    icon: markRaw(TrendingUp),
    bg: "bg-orange-100 dark:bg-orange-500/20",
    color: "text-orange-500",
  },
];

const updates = [
  {
    title: "Hisob va mukofotlar yangilandi",
    desc: "Tangalar, olmoslar, streak va ramkalar yanada tartibli boshqariladi.",
    icon: markRaw(Zap),
  },
  {
    title: "Global Blitz reytingi",
    desc: "Blitz o'yinidagi eng yaxshi natijalar umumiy reytingda ko'rinadi.",
    icon: markRaw(Trophy),
  },
  {
    title: "Eventlar qayta o'ynashga tayyor",
    desc: "Eventlar natijalari va mukofotlari yangi mavsum uchun yangilanadi.",
    icon: markRaw(RotateCcw),
  },
  {
    title: "Xavfsizlik yaxshilandi",
    desc: "Profil, guruh va reyting ma'lumotlariga kirish qoidalari mustahkamlandi.",
    icon: markRaw(ShieldCheck),
  },
  {
    title: "FAB tugmalari to'g'rilandi",
    desc: "Tarjimon, guruhlar, chat va o'qituvchi paneli tugmalari to'liq ishlaydi.",
    icon: markRaw(Users),
  },
];

const steps = [
  "Ro'yxatdan o'ting yoki tizimga kiring",
  "Bosh sahifadan fan yoki mavzu tanlang",
  "Test yeching yoki AI yordamchidan savolingizga javob oling",
  "Do'stlaringizni chaqiring va birgalikda test (Co-op) yeching",
  "Reyting jadvalida o'z o'rningizni kuzatib boring va olmos to'plang",
];

const shareOptions = [
  { key: "telegram", label: "Telegram", icon: markRaw(Send), bg: "bg-sky-500" },
  {
    key: "instagram",
    label: "Instagram",
    icon: markRaw(Share2),
    bg: "bg-gradient-to-br from-pink-500 to-amber-400",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: markRaw(Send),
    bg: "bg-green-500",
  },
  { key: "other", label: "Boshqa", icon: markRaw(Share2), bg: "bg-slate-500" },
];

const shared = reactive<Record<string, boolean>>({
  telegram: localStorage.getItem("shared_telegram") === "1",
  instagram: localStorage.getItem("shared_instagram") === "1",
  whatsapp: localStorage.getItem("shared_whatsapp") === "1",
  other: localStorage.getItem("shared_other") === "1",
});

const shareMessage = ref("");

const shareApp = async (platform: string) => {
  const appUrl = window.location.origin;
  const text =
    "Socrati - bilim olish ilovasi! Uy vazifalari, testlar va o'yinlar bir joyda.";

  if (platform === "telegram") {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`,
      "_blank",
    );
  } else if (platform === "whatsapp") {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + appUrl)}`,
      "_blank",
    );
  } else if (platform === "instagram") {
    await navigator.clipboard.writeText(`${text} ${appUrl}`);
    shareMessage.value =
      "Havola nusxalandi — Instagram story yoki bio'ga joylashtiring!";
  } else {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Socrati", text, url: appUrl });
      } catch {
        return; // foydalanuvchi bekor qildi — olmos berilmaydi
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${appUrl}`);
      shareMessage.value = "Havola nusxalandi!";
    }
  }

  // Har bir platforma uchun faqat bir marta olmos beriladi
  if (!shared[platform]) {
    shared[platform] = true;
    localStorage.setItem(`shared_${platform}`, "1");
    await awardShareDiamonds();
  }
};

const awardShareDiamonds = async () => {
  const newDiamonds = coinStore.diamonds + 10;
  coinStore.diamonds = newDiamonds;
  shareMessage.value = "+10 olmos qo'shildi! Rahmat, ulashganingiz uchun 🎉";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("coins")
      .update({ diamonds: newDiamonds })
      .eq("user_id", user.id);
  }
  setTimeout(() => (shareMessage.value = ""), 4000);
};
</script>
