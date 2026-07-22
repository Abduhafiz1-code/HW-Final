<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28">
    <div class="max-w-3xl mx-auto px-4 md:px-8 py-4">
      <!-- Header -->
      <div class="flex items-center gap-3 pt-8 pb-4">
        <button @click="router.back()"
          class="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 active:scale-95 transition">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white">Event'lar</h1>
          <p class="text-xs text-slate-400 font-semibold">Ishtirok eting va olmos qo'lga kiriting</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-10 h-10 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin"></div>
        <p class="text-slate-400 text-sm font-semibold">Yuklanmoqda...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="store.events.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in-up">
        <CalendarX2 :size="48" class="text-slate-300 dark:text-slate-600" />
        <p class="text-slate-400 font-semibold text-sm">Hozircha faol event yo'q</p>
      </div>

      <!-- Events list -->
      <div v-else class="flex flex-col gap-4">
        <div v-for="event in store.events" :key="event.id"
          class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in-up">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <component :is="typeIcon(event.type)" :size="22" class="text-white" />
              </div>
              <div class="min-w-0">
                <h2 class="font-black text-slate-900 dark:text-white text-sm truncate">{{ event.title }}</h2>
                <p class="text-xs text-slate-400 font-semibold mt-0.5">{{ typeLabel(event.type) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl px-2.5 py-1 flex-shrink-0">
              <Gem :size="14" class="text-cyan-500" />
              <span class="text-cyan-600 dark:text-cyan-400 text-xs font-black">5-20</span>
            </div>
          </div>

          <p v-if="event.description" class="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            {{ event.description }}
          </p>

          <p class="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <Info :size="12" /> Natijangizga qarab: 40-59% → 5💎+20🪙, 60-79% → 10💎+30🪙, 80-100% → 20💎+50🪙
          </p>

          <div class="mt-4">
            <div v-if="isCompleted(event.id)"
              class="w-full flex items-center justify-center gap-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-black py-2.5 rounded-xl">
              <CheckCircle2 :size="14" /> Bajarilgan — natija: {{ store.myParticipation[event.id]?.score_percent }}%
            </div>
            <RouterLink v-else :to="linkFor(event)"
              class="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white text-xs font-black py-2.5 rounded-xl">
              Boshlash
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Gem, CalendarX2, CheckCircle2, Info, BookOpen, GraduationCap, Sparkles } from "@lucide/vue";
import { useEventStore } from "../stores/EventStore";

const router = useRouter();
const store = useEventStore();

const isCompleted = (eventId: string) => !!store.myParticipation[eventId]?.reward_claimed;

const linkFor = (event: any) => {
  if (event.type === "vocab_b1") return "/events/vocab";
  if (event.type === "subject_b2") return "/events/subjects";
  return "/events";
};

const typeIcon = (type: string) => {
  if (type === "vocab_b1") return BookOpen;
  if (type === "subject_b2") return GraduationCap;
  return Sparkles;
};

const typeLabel = (type: string) => {
  if (type === "vocab_b1") return "So'z yodlash · B1";
  if (type === "subject_b2") return "Fanlar testi · B2";
  return "Maxsus event";
};

onMounted(() => store.fetchEvents());
</script>
