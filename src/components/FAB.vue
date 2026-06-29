<script setup lang="ts">
import Groups from "./Groups.vue";
import Chats from "./Chats.vue";
// import Bell from "../components/Bell__message.vue";
import Panel from "./Panel.vue";
import { useAuthStore } from "../stores/AuthStore";
const authStore = useAuthStore();
</script>

<template>
    <div class="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">

        <!-- FAB items — DaisyUI dropdown o'rniga oddiy v-show -->
        <div v-show="open" class="flex flex-col items-end gap-3">

            <!-- Tarjimon -->
            <RouterLink to="/translate" class="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               hover:scale-110 transition-transform">
                🌐
            </RouterLink>

            <!-- Groups -->
            <button v-if="!authStore.isTeacher" class="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               hover:scale-110 transition-transform">
                <Groups />
            </button>
            <button v-if="authStore.isTeacher" class="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               hover:scale-110 transition-transform">
                <Panel />
            </button>
            <!-- Chats -->
            <button class="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg
               bg-white dark:bg-slate-800
               border border-slate-200 dark:border-slate-700
               hover:scale-110 transition-transform">
                <Chats />
            </button>



        </div>

        <!-- Asosiy FAB tugmasi -->
        <button @click="open = !open" class="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white shadow-xl
             bg-gradient-to-br from-orange-400 to-orange-600
             hover:scale-105 active:scale-95 transition-transform" :class="open ? 'rotate-45' : 'rotate-0'"
            style="transition: transform 0.2s, rotate 0.2s">
            ✦
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