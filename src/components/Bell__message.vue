<template>
  <div>
    <RouterLink to="/notifications">
      <button
        class="relative flex items-center font-bold gap-2 text-orange-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
        <Bell />
        <!-- Qizil nuqta — faqat o'qilmagan habar bo'lsa -->
        <span v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { Bell } from "@lucide/vue";
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