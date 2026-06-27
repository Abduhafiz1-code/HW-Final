<template>
  <div class="min-h-screen bg-[#f8f9fb] p-4">
    <div class="mx-auto max-w-2xl bg-white rounded-3xl border border-slate-200 overflow-hidden">
      <!-- HEADER -->
      <div class="px-5 pt-5 pb-4 border-b border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <button @click="goBack"
              class="w-10 h-10 rounded-[14px] border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
              ←
            </button>
            <div>
              <p class="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                System notifications
              </p>
              <h1 class="text-xl font-bold text-slate-900">
                Your activity feed
              </h1>
            </div>
          </div>
          <button @click="markAllRead"
            class="text-xs font-semibold text-indigo-500 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition">
            Hammasini o'qildi ({{ unreadCount }})
          </button>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed">
          Important updates, rewards, and progress alerts from your account.
        </p>
      </div>

      <!-- NOTIFICATIONS -->
      <div class="divide-y divide-slate-100">
        <article v-for="notif in notifications" :key="notif.id"
          class="flex items-start gap-4 px-5 py-4 relative hover:bg-slate-50 transition cursor-pointer"
          :class="{ 'bg-indigo-50/30': notif.unread }">
          <!-- Unread dot -->
          <span v-if="notif.unread" class="absolute top-5 right-4 w-2 h-2 rounded-full bg-indigo-500">
          </span>

          <!-- Icon -->
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" :class="notif.iconBg">
            <span class="text-lg font-semibold" :class="notif.iconColor">
              {{ notif.icon || "•" }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-sm font-semibold text-slate-900">
                {{ notif.title }}
              </h2>
              <span class="text-[11px] text-slate-400">{{ notif.time }}</span>
            </div>
            <p class="text-[13px] text-slate-500 leading-relaxed">
              {{ notif.text }}
            </p>
            <span class="inline-block mt-2 text-[11px] font-semibold text-slate-900 px-3 py-1 rounded-full"
              :class="notif.badgeClass">
              {{ notif.badge }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import supabase from "../supabase";

const router = useRouter();
const goBack = () => window.history.length > 1 ? router.back() : router.push("/");

const notifications = ref<any[]>([]);
const loading = ref(false);

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

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

console.log(markRead);
onMounted(() => fetchNotifications());
</script>
