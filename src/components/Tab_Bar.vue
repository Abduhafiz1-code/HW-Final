<template>
  <div
    class="w-full flex justify-around py-2 h-20 z-50 rounded-t-2xl bg-white text-black shadow-xl border-t border-slate-100">
    <RouterLink v-slot="{ isActive }" to="/">
      <div class="flex flex-col items-center text-xs p-2 w-14 h-full rounded-xl transition-all"
        :class="isActive ? 'bg-orange-50 text-orange-500' : 'text-slate-500'">
        <Book :size="22" /><span class="text-[10px] font-bold mt-0.5">Home</span>
      </div>
    </RouterLink>
    <RouterLink v-if="authStore.isTeacher" v-slot="{ isActive }" to="/teacher">
      <div class="flex flex-col items-center text-xs p-2 w-14 h-full rounded-xl transition-all"
        :class="isActive ? 'bg-orange-50 text-orange-500' : 'text-slate-500'">
        <GraduationCap :size="22" /><span class="text-[10px] font-bold mt-0.5">Panel</span>
      </div>
    </RouterLink>
    <RouterLink v-if="!authStore.isTeacher" v-slot="{ isActive }" to="/groups">
      <div class="flex flex-col items-center text-xs p-2 w-14 h-full rounded-xl transition-all"
        :class="isActive ? 'bg-orange-50 text-orange-500' : 'text-slate-500'">
        <Users :size="22" /><span class="text-[10px] font-bold mt-0.5">Groups</span>
      </div>
    </RouterLink>
    <RouterLink v-slot="{ isActive }" to="/map">
      <div class="flex flex-col items-center text-xs p-2 w-14 h-full rounded-xl transition-all"
        :class="isActive ? 'bg-orange-50 text-orange-500' : 'text-slate-500'">
        <Trophy :size="22" /><span class="text-[10px] font-bold mt-0.5">Top</span>
      </div>
    </RouterLink>
    <RouterLink v-slot="{ isActive }" to="/chat">
      <div class="flex flex-col items-center text-xs p-2 w-14 h-full rounded-xl transition-all"
        :class="isActive ? 'bg-orange-50 text-orange-500' : 'text-slate-500'">
        <MessageCircle :size="22" /><span class="text-[10px] font-bold mt-0.5">Chat</span>
      </div>
    </RouterLink>
    <RouterLink v-slot="{ isActive }" to="/ai-chat">
      <div class="flex flex-col items-center text-xs p-2 w-14 h-full rounded-xl transition-all"
        :class="isActive ? 'bg-orange-50 text-orange-500' : 'text-slate-500'">
        <Bot :size="22" /><span class="text-[10px] font-bold mt-0.5">AI</span>
      </div>
    </RouterLink>
    <RouterLink v-slot="{ isActive }" to="/user">
      <div class="flex flex-col items-center text-xs p-2 w-14 h-full rounded-xl transition-all"
        :class="isActive ? 'bg-orange-50 text-orange-500' : 'text-slate-500'">
        <User :size="22" /><span class="text-[10px] font-bold mt-0.5">Profil</span>
      </div>
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { Book, Bot, User, Trophy, MessageCircle, GraduationCap, Users } from 'lucide-vue-next';
import { useAuthStore } from '../stores/AuthStore';
const authStore = useAuthStore();
</script>
