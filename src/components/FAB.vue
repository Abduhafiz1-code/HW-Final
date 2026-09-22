<script setup lang="ts">
import { ref } from "vue";
import { Globe, Plus, X, Users, GraduationCap, MessageCircle } from '@lucide/vue';
import Groups from "./Groups.vue";
import Chats from "./Chats.vue";
import Panel from "./Panel.vue";
import { useAuthStore } from "../stores/AuthStore";
import { playClick } from "../lib/sound";

const authStore = useAuthStore();
const open = ref(false);

const toggle = () => {
  open.value = !open.value;
  playClick();
};
</script>

<template>
  <div class="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">

    <!-- FAB ro'yxati: har biri yorliqli (nima ekanligi aniq) -->
    <Transition name="fab-list">
      <div v-show="open" class="flex flex-col items-end gap-3">

        <!-- Tarjimon -->
        <RouterLink to="/translate" class="fab-item group">
          <span class="fab-label">Tarjimon</span>
          <span class="fab-btn bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-300/50 dark:shadow-none">
            <Globe :size="22" />
          </span>
        </RouterLink>

        <!-- Groups (o'quvchi) / Panel (o'qituvchi) -->
        <Groups v-if="!authStore.isTeacher" class="fab-item group">
          <span class="fab-label">Guruhlar</span>
          <span class="fab-btn bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-purple-300/50 dark:shadow-none">
            <Users :size="22" />
          </span>
        </Groups>
        <Panel v-else class="fab-item group">
          <span class="fab-label">O'qituvchi paneli</span>
          <span class="fab-btn bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-purple-300/50 dark:shadow-none">
            <GraduationCap :size="22" />
          </span>
        </Panel>

        <!-- Chats -->
        <Chats class="fab-item group">
          <span class="fab-label">Chat</span>
          <span class="fab-btn bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-300/50 dark:shadow-none">
            <MessageCircle :size="22" />
          </span>
        </Chats>
      </div>
    </Transition>

    <!-- Asosiy FAB tugmasi: gradient + puls halo -->
    <button @click="toggle"
      class="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-300/60 dark:shadow-none
             bg-gradient-to-br from-orange-400 to-orange-600
             hover:scale-105 active:scale-95 transition-transform"
      :class="open ? 'rotate-45' : 'rotate-0'"
      style="transition: transform 0.2s, rotate 0.2s">
      <span v-if="!open" class="absolute inset-0 rounded-full bg-orange-400/40 animate-ping pointer-events-none"></span>
      <Plus v-if="!open" :size="24" />
      <X v-else :size="24" />
    </button>

  </div>
</template>

<style scoped>
/* Yorliq: tugma chap tomonida, hoverda chiqadi */
.fab-label {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  color: #334155;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transform: translateX(6px);
  transition: all 0.2s ease;
  pointer-events: none;
}

:global(.dark) .fab-label {
  background: rgba(30, 41, 59, 0.95);
  color: #e2e8f0;
}

.group:hover .fab-label,
.group:focus-visible .fab-label {
  opacity: 1;
  transform: translateX(0);
}

/* Har bir item: yorliq + dumaloq tugma */
.fab-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.625rem;
}

.fab-btn {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.group:hover .fab-btn {
  transform: scale(1.1);
}

.group:active .fab-btn {
  transform: scale(0.95);
}

/* Ro'yxat ochilishi: pastdan yuqoriga kaskad */
.fab-list-enter-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-list-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.fab-list-enter-from,
.fab-list-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.92);
}

@media (prefers-reduced-motion: reduce) {
  .fab-list-enter-active, .fab-list-leave-active { transition: none; }
}
</style>
