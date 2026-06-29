<template>
    <aside :class="isOpen ? 'w-64' : 'w-20'"
        class="hidden md:flex h-screen sticky top-0  bg-white border-r border-slate-200 shadow-sm flex-col transition-all duration-300 z-50">
        <div class="p-4 flex items-center justify-between text-orange-500">
            <h2 :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'"
                class="font-bold text-xl transition-all duration-300 whitespace-nowrap">
                Homework Helper
            </h2>

            <button @click="isOpen = !isOpen" class="p-2 rounded-lg hover:bg-slate-100 transition">
                <PanelLeftClose v-if="isOpen" :size="20" />
                <PanelLeftOpen v-else :size="20" />
            </button>
        </div>

        <div class="flex-1 px-3">
            <RouterLink v-for="item in desktopItems" :key="item.to" :to="item.to" v-slot="{ isActive }">
                <div class="flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all" :class="isActive
                    ? 'bg-orange-50 text-orange-500'
                    : 'text-slate-600 hover:bg-slate-50'
                    ">
                    <component :is="item.icon" :size="22" class="flex-shrink-0" />

                    <span :class="isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'"
                        class="font-medium whitespace-nowrap transition-all duration-300">
                        {{ item.label }}
                    </span>
                </div>
            </RouterLink>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
    Book,
    Bot,
    Trophy,
    User,
    Users,
    GraduationCap,
    MessagesSquare,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-vue-next";

import { useAuthStore } from "../stores/AuthStore";

const authStore = useAuthStore();
const isOpen = ref(true);

const desktopItems = computed(() => {
    const list = [
        { label: "Home", to: "/", icon: Book },

        { label: "Top", to: "/map", icon: Trophy },
        { label: "Chat", to: "/chat", icon: MessagesSquare },
        { label: "AI", to: "/ai-chat", icon: Bot },
        { label: "Profil", to: "/user", icon: User },
    ];

    if (authStore.isTeacher) {
        list.splice(1, 0, {
            label: "Panel",
            to: "/teacher",
            icon: GraduationCap,
        });
    }
    if (!authStore.isTeacher) {
        list.splice(1, 0, {
            label: "Groups",
            to: "/groups",
            icon: Users,
        });
    }

    return list;
});
</script>