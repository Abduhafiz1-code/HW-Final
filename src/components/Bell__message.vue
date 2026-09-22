<template>
  <div class="flex-1 max-w-[180px]">
    <RouterLink to="/notifications">
      <button
        class="relative w-full flex items-center gap-2.5 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 hover:border-orange-300 active:scale-95">
        <span class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/15 flex items-center justify-center flex-shrink-0">
          <Bell :size="18" class="text-sky-500" />
        </span>
        <span class="text-left leading-none">
          <span class="block text-slate-700 dark:text-slate-200 font-black text-sm">Xabarlar</span>
          <span class="block text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
            {{ unreadCount > 0 ? `${unreadCount} ta yangi` : 'Hammasi o\u2019qilgan' }}
          </span>
        </span>
        <!-- Qizil nuqta — faqat o'qilmagan habar bo'lsa -->
        <span v-if="unreadCount > 0"
          class="absolute top-2 right-2.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { Bell } from '@lucide/vue';
import { ref, onMounted, watch } from "vue";
import supabase from "../supabase";
import { useRoute } from "vue-router";
// import { ref, onMounted, watch } from "vue";
const unreadCount = ref(0);
const route = useRoute();

const fetchUnread = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  unreadCount.value = count || 0;
};

// Notification sahifasiga kirsa nuqta o'chadi
watch(() => route.path, (path) => {
  if (path === "/notifications") unreadCount.value = 0;
});

onMounted(() => fetchUnread());
</script>
