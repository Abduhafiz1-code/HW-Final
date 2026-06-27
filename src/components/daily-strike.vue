<template>
  <div class="relative inline-block font-sans">
    <button @click="isOpen = !isOpen"
      class="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm hover:bg-gray-50 transition-all border border-gray-200 hover:border-orange-200 active:scale-95">
      <span class="text-xl">🔥</span>
      <span class="text-orange-500 font-black text-base">{{ streakCount }}</span>
    </button>
    <transition name="pop">
      <div v-if="isOpen"
        class="absolute top-full left-0 mt-3 z-50 bg-white border border-gray-100 rounded-3xl p-6 w-80 shadow-xl">
        <div class="absolute -top-2 left-5 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45"></div>
        <div class="flex items-center gap-4 mb-6">
          <div :class="streakCount > 0 ? 'bg-orange-50' : 'bg-gray-100'"
            class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
            <span class="text-3xl">🔥</span>
          </div>
          <div>
            <h2 class="text-xl font-black text-gray-800">{{ streakCount }}-kunlik streak!</h2>
            <p class="text-sm text-gray-400 mt-0.5">Har kuni dars bajaring</p>
          </div>
        </div>
        <div class="h-px bg-gray-100 mb-5"></div>
        <div class="flex justify-between items-end">
          <div v-for="(day, index) in weekStatus" :key="index" class="flex flex-col items-center gap-2">
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
              day.isToday && day.isCompleted ? 'bg-orange-500 ring-2 ring-orange-200'
                : day.isCompleted ? 'bg-orange-100'
                  : day.isFuture ? 'bg-gray-50 border border-dashed border-gray-200'
                    : 'bg-gray-100'
            ]">
              <svg v-if="day.isCompleted" viewBox="0 0 16 16"
                :class="['w-4 h-4', day.isToday ? 'text-white' : 'text-orange-500']" fill="none" stroke="currentColor"
                stroke-width="2.5">
                <path d="M3 8l3.5 3.5L13 5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span v-else class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            </div>
            <span
              :class="['text-xs font-bold uppercase', day.isToday ? 'text-orange-500' : 'text-gray-300']">{{ day.name }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import supabase from '../supabase';

const isOpen = ref(false);
const streakCount = ref(0);
const daysNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const weekStatus = ref(daysNames.map(name => ({ name, isCompleted: false, isToday: false, isFuture: false })));

const updateStreak = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const now = new Date();
  const todayStr = now.toDateString();
  let dayIdx = now.getDay() - 1;
  if (dayIdx === -1) dayIdx = 6;

  if (user) {
    // Supabase dan o'qish
    const { data } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    let count = 0; let history: string[] = [];
    if (data) {
      count = data.streak_count || 0;
      history = data.history || [];
      const lastDate = data.last_date || '';
      if (lastDate !== todayStr) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) { count++; }
        else if (!lastDate) { count = 1; }
        else { count = 1; history = []; }
        if (!history.includes(todayStr)) history.push(todayStr);
        await supabase.from('streaks').update({ streak_count: count, last_date: todayStr, history }).eq('user_id', user.id);
      }
    } else {
      count = 1; history = [todayStr];
      await supabase.from('streaks').insert({ user_id: user.id, streak_count: 1, last_date: todayStr, history: [todayStr] });
    }
    streakCount.value = count;
    weekStatus.value = daysNames.map((name, index) => {
      const d = new Date(); const diff = index - dayIdx; d.setDate(now.getDate() + diff);
      return { name, isCompleted: history.includes(d.toDateString()), isToday: index === dayIdx, isFuture: index > dayIdx };
    });
  } else {
    // localStorage fallback
    const stored = localStorage.getItem('streak_data');
    const data = stored ? JSON.parse(stored) : { count: 0, lastDate: '', history: [] };
    let count = data.count; let history: string[] = data.history || [];
    if (data.lastDate !== todayStr) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (data.lastDate === yesterday.toDateString()) count++;
      else if (!data.lastDate) count = 1;
      else { count = 1; history = []; }
      if (!history.includes(todayStr)) history.push(todayStr);
      localStorage.setItem('streak_data', JSON.stringify({ count, lastDate: todayStr, history }));
    }
    streakCount.value = count;
    weekStatus.value = daysNames.map((name, index) => {
      const d = new Date(); const diff = index - dayIdx; d.setDate(now.getDate() + diff);
      return { name, isCompleted: history.includes(d.toDateString()), isToday: index === dayIdx, isFuture: index > dayIdx };
    });
  }
};

onMounted(() => updateStreak());
</script>

<style scoped>
.pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-leave-active {
  animation: pop-in 0.15s ease-in reverse;
}

@keyframes pop-in {
  from {
    transform: scale(0.9) translateY(-8px);
    opacity: 0;
  }

  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>