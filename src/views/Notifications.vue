<template>
  <div class="min-h-screen bg-[#f8f9fb] dark:bg-slate-900 p-4">
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
          <button @click="markAllRead"
            class="text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
            Hammasini o'qildi ({{ unreadCount }})
          </button>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Important updates, rewards, and progress alerts from your account.
        </p>
      </div>

      <!-- NOTIFICATIONS -->
      <div v-if="!loading && notifications.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-slate-300 dark:text-slate-600">
        <BellOff :size="40" />
        <p class="text-sm text-slate-400 dark:text-slate-500 font-medium">Hozircha bildirishnomalar yo'q</p>
      </div>
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
        <article v-for="notif in notifications" :key="notif.id" @click="markRead(notif.id)"
          class="flex items-start gap-4 px-5 py-4 relative hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer animate-fade-in-up"
          :class="{ 'bg-indigo-50/30 dark:bg-indigo-900/10': !notif.is_read }">
          <!-- Unread dot -->
          <span v-if="!notif.is_read" class="absolute top-5 right-4 w-2 h-2 rounded-full bg-indigo-500"></span>

          <!-- Icon -->
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" :class="notif.icon_bg">
            <component :is="iconFor(notif.icon)" :size="22" :class="notif.icon_color" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ notif.title }}
              </h2>
              <span class="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">{{ formatTime(notif.created_at) }}</span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ notif.text }}
            </p>
            <span v-if="notif.badge"
              class="inline-block mt-2 text-[11px] font-semibold text-slate-900 dark:text-white px-3 py-1 rounded-full"
              :class="notif.badge_class">
              {{ notif.badge }}
            </span>
          </div>
        </article>
      </div>
    </div>
    <OnboardingTooltip pageId="Notifications" title="Bildirishnomalar" description="Yangi xabarlar va muhim bildirishnomalar" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import supabase from "../supabase";
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
import {
  ArrowLeft, BellOff, Bell, Coins, PartyPopper, Target, FileText,
  Gamepad2, Frown,
} from '@lucide/vue';

// Notifications store their icon as a @lucide/vue component name
// (see src/lib/Notification.ts). Map that name to the actual component here
// so every notification renders a real icon — never raw emoji or plain text.
const ICONS: Record<string, any> = {
  Bell, Coins, PartyPopper, Target, FileText, Gamepad2, Frown,
};
const iconFor = (name?: string) => (name && ICONS[name]) || Bell;

const router = useRouter();
const goBack = () => window.history.length > 1 ? router.back() : router.push("/");

const notifications = ref<any[]>([]);
const loading = ref(false);

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

const formatTime = (t: string) => {
  if (!t) return "";
  return new Date(t).toLocaleString("uz", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
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
};

const markAllRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  notifications.value = notifications.value.map(n => ({ ...n, is_read: true }));
};

const markRead = async (id: string) => {
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  const n = notifications.value.find(n => n.id === id);
  if (n) n.is_read = true;
};

onMounted(() => fetchNotifications());
</script>