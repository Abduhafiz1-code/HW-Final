<script setup lang="ts">
import { Globe, Plus, X } from '@lucide/vue';
import Groups from "./Groups.vue";
import Chats from "./Chats.vue";
import Panel from "./Panel.vue";
import { useAuthStore } from "../stores/AuthStore";
const authStore = useAuthStore();
</script>

<template>
    <div class="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">

        <!-- FAB items -->
        <Transition name="fab-list">
            <div v-show="open" class="flex flex-col items-end gap-3">

                <!-- Tarjimon -->
                <RouterLink to="/translate" class="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               text-slate-600 dark:text-slate-300
               hover:scale-110 active:scale-95 transition-transform">
                    <Globe :size="22" />
                </RouterLink>

                <!-- Groups (o'quvchi) / Panel (o'qituvchi) -->
                <Groups v-if="!authStore.isTeacher" class="w-12 h-12 rounded-full shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               text-slate-600 dark:text-slate-300
               hover:scale-110 active:scale-95 transition-transform" />
                <Panel v-else class="w-12 h-12 rounded-full shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               text-slate-600 dark:text-slate-300
               hover:scale-110 active:scale-95 transition-transform" />

                <!-- Chats -->
                <Chats class="w-12 h-12 rounded-full shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               text-slate-600 dark:text-slate-300
               hover:scale-110 active:scale-95 transition-transform" />
            </div>
        </Transition>

        <!-- Asosiy FAB tugmasi -->
        <button @click="open = !open" class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl
             bg-gradient-to-br from-orange-400 to-orange-600
             hover:scale-105 active:scale-95 transition-transform" :class="open ? 'rotate-45' : 'rotate-0'"
            style="transition: transform 0.2s, rotate 0.2s">
            <Plus v-if="!open" :size="24" />
            <X v-else :size="24" />
        </button>

    </div>
</template>

<script lang="ts">
export default {
    data() {
        return { open: false }
    }
}
</script>

<style scoped>
.fab-list-enter-active,
.fab-list-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fab-list-enter-from,
.fab-list-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
}
</style>
