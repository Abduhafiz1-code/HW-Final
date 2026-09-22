<template>
  <div class="min-h-screen bg-[#f8f9fb] dark:bg-slate-900 p-4 pb-28 md:pb-4">
    <div
      class="mx-auto max-w-2xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <!-- HEADER -->
      <div class="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <button @click="goBack"
              class="w-10 h-10 rounded-[14px] border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition">
              <ArrowLeft :size="18" />
            </button>
            <div>
              <p class="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium">
                System notifications
              </p>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white">
                Your activity feed
              </h1>
            </div>
          </div>
          <button v-if="unreadCount > 0" @click="markAllRead"
            class="text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
            Hammasini o'qildi ({{ unreadCount }})
          </button>
        </div>

        <!-- Push notification permission banner -->
        <button v-if="!pushEnabled && canAskPush" @click="enablePush"
          class="w-full flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl px-4 py-3 mb-3 hover:opacity-95 active:scale-[0.99] transition text-left">
          <span class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <BellRing :size="20" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-bold">Telefonga xabar kelsin!</span>
            <span class="block text-xs text-white/80">Ilovada bo'lmasangiz ham yangi mukofotlardan xabardor bo'ling</span>
          </span>
          <ChevronRight :size="18" class="flex-shrink-0" />
        </button>
        <div v-else-if="pushEnabled"
          class="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-3 px-1">
          <BellRing :size="14" /> Push xabarlar yoqilgan — yangi mukofotlar ekranda ko'rinadi
        </div>
      </div>

      <!-- LOADING SKELETON -->
      <div v-if="loading" class="divide-y divide-slate-100 dark:divide-slate-700">
        <div v-for="i in 4" :key="i" class="flex items-start gap-4 px-5 py-4 animate-pulse">
          <div class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            <div class="h-3 bg-slate-100 dark:bg-slate-700/60 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-else-if="notifications.length === 0"
        class="flex flex-col items-center justify-center py-16 gap-3 text-slate-300 dark:text-slate-600">
        <BellOff :size="40" />
        <p class="text-sm text-slate-400 dark:text-slate-500 font-medium">Hozircha bildirishnomalar yo'q</p>
        <p class="text-xs text-slate-300 dark:text-slate-600">Test yeching — mukofotlar shu yerda paydo bo'ladi</p>
      </div>

      <!-- LIST -->
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
        <article v-for="notif in notifications" :key="notif.id" @click="openDetail(notif)"
          class="flex items-start gap-4 px-5 py-4 relative hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
          :class="{ 'bg-indigo-50/30 dark:bg-indigo-900/10': !notif.is_read }">
          <span v-if="!notif.is_read" class="absolute top-5 right-4 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>

          <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" :class="notif.icon_bg">
            <component :is="iconFor(notif.icon)" :size="22" :class="notif.icon_color" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ notif.title }}
              </h2>
              <span class="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">{{ formatTime(notif.created_at) }}</span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{{ notif.text }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span v-if="notif.badge"
                class="inline-block text-[11px] font-semibold text-slate-900 dark:text-white px-3 py-1 rounded-full"
                :class="notif.badge_class">
                {{ notif.badge }}
              </span>
              <span class="text-[10px] text-slate-300 dark:text-slate-600 font-medium">Batafsil →</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="detail"
          class="fixed inset-0 z-[9997] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
          @click.self="detail = null">
          <div
            class="bg-white dark:bg-slate-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div class="h-28 flex items-center justify-center" :class="detail.icon_bg">
              <div class="w-16 h-16 rounded-3xl bg-white/60 dark:bg-white/10 flex items-center justify-center animate-pop">
                <component :is="iconFor(detail.icon)" :size="32" :class="detail.icon_color" />
              </div>
            </div>
            <div class="p-6 text-center">
              <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">{{ detail.title }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ detail.text }}</p>
              <span v-if="detail.badge"
                class="inline-block mt-4 text-xs font-bold text-slate-900 dark:text-white px-4 py-1.5 rounded-full"
                :class="detail.badge_class">
                {{ detail.badge }}
              </span>
              <div class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500">
                <div class="flex items-center justify-center gap-1.5">
                  <Clock :size="13" />
                  {{ new Date(detail.created_at).toLocaleString("uz", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) }}
                </div>
              </div>
              <button @click="detail = null"
                class="mt-5 w-full py-3 rounded-2xl bg-slate-900/5 dark:bg-white/10 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 active:scale-95 transition">
                Yopish
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <OnboardingTooltip pageId="Notifications" title="Bildirishnomalar" description="Yangi xabarlar va muhim bildirishnomalar" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import supabase from "../supabase";
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
import {
  ArrowLeft, BellOff, Bell, BellRing, ChevronRight, Clock, Coins, PartyPopper, Target, FileText,
  Gamepad2, Frown,
} from '@lucide/vue';

const ICONS: Record<string, any> = {
  Bell, Coins, PartyPopper, Target, FileText, Gamepad2, Frown,
};
const iconFor = (name?: string) => (name && ICONS[name]) || Bell;

const router = useRouter();
const goBack = () => window.history.length > 1 ? router.back() : router.push("/");

const notifications = ref<any[]>([]);
const loading = ref(false);
const detail = ref<any | null>(null);
const pushEnabled = ref(false);
let realtimeChannel: any = null;

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

const hasNotificationAPI = typeof window !== "undefined" && "Notification" in window;
const canAskPush = hasNotificationAPI && Notification.permission !== "denied";

const formatTime = (t: string) => {
  if (!t) return "";
  return new Date(t).toLocaleString("uz", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

// ── Browser push (like an SMS banner on the phone screen) ──────────────
const enablePush = async () => {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    pushEnabled.value = true;
    localStorage.setItem("push_enabled", "1");
    new Notification("Homework Helper", {
      body: "Rahmat! Endi yangi mukofotlar darhol ekranda ko'rinadi 🎉",
      icon: "/favicon.ico",
    });
  }
};

const showBrowserPush = (n: any) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(n.title || "Yangi bildirishnoma", {
      body: n.text || "",
      icon: "/favicon.ico",
      tag: n.id,
    });
  } catch { /* ignore */ }
};

const fetchNotifications = async () => {
  loading.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { loading.value = false; return; }
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  notifications.value = data || [];
  loading.value = false;

  // ── Realtime: yangi bildirishnoma darhol ro'yxatga tushadi ───────────
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  realtimeChannel = supabase
    .channel(`notifications-${user.id}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
      (payload) => {
        const fresh = payload.new as any;
        if (!notifications.value.some((n) => n.id === fresh.id)) {
          notifications.value.unshift(fresh);
          showBrowserPush(fresh);
        }
      }
    )
    .subscribe();
};

const markAllRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  notifications.value = notifications.value.map(n => ({ ...n, is_read: true }));
};

const openDetail = async (notif: any) => {
  detail.value = notif;
  if (!notif.is_read) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    notif.is_read = true;
  }
};

onMounted(async () => {
  pushEnabled.value = localStorage.getItem("push_enabled") === "1" ||
    ("Notification" in window && Notification.permission === "granted");
  await fetchNotifications();
});

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active>div,
.modal-leave-active>div {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from>div,
.modal-leave-to>div {
  transform: translateY(40px) scale(0.96);
}
</style>
