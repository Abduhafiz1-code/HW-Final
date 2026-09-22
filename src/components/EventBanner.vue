<template>
  <!-- KATTA Event hero-banner: o'ynamagan faol eventni katta banner bilan taklif qiladi -->
  <Transition name="banner">
    <div v-if="show && event"
      class="relative overflow-hidden rounded-[2rem] shadow-xl shadow-cyan-200/60 dark:shadow-none animate-fade-in-up">
      <!-- Fon gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#0e7490] via-[#0891b2] to-[#7c3aed]"></div>
      <!-- Dekorativ shakllar -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute -top-14 right-1/4 w-52 h-52 rounded-full bg-cyan-300/40 blur-2xl animate-blob-a"></div>
        <div class="absolute -bottom-16 -left-8 w-48 h-48 rounded-[3rem] bg-purple-400/50 -rotate-6 animate-blob-b"></div>
        <span v-for="s in 8" :key="s"
          class="absolute w-1.5 h-1.5 rounded-full bg-white/80 animate-twinkle"
          :style="{ left: `${8 + s * 10}%`, top: `${14 + (s % 4) * 20}%`, animationDelay: `${s * 0.4}s` }"></span>
      </div>

      <button @click="dismiss"
        class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition active:scale-90 z-20"
        title="Yopish">
        <X :size="17" />
      </button>

      <RouterLink :to="eventPath" class="relative z-10 flex items-center gap-5 px-6 py-6 group">
        <!-- Chap illyustratsiya -->
        <div class="relative flex-shrink-0 hidden sm:flex">
          <span class="absolute -inset-3 rounded-[2rem] bg-cyan-300/40 blur-xl animate-splash-glow"></span>
          <span
            class="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center shadow-2xl ring-4 ring-white/30 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
            <component :is="eventIcon" :size="42" class="text-white drop-shadow-lg" />
          </span>
          <span class="absolute -top-1 -right-1 text-lg animate-splash-twinkle">✦</span>
        </div>

        <!-- Matn -->
        <div class="flex-1 min-w-0">
          <p class="text-cyan-200 text-[11px] font-black uppercase tracking-[0.25em] mb-1">
            Faol Event
          </p>
          <h2 class="text-white font-black text-xl sm:text-2xl leading-tight drop-shadow-md truncate">
            {{ event.title || "Yangi event!" }}
          </h2>
          <p class="text-cyan-50/90 text-[13px] font-semibold mt-1.5 leading-snug">
            Siz hali ishtirok etmagansiz —
            <span class="text-amber-300 font-black">olmos va tangalar</span> kutib turadi!
          </p>
          <span
            class="inline-flex items-center gap-1.5 mt-3.5 bg-white text-cyan-700 rounded-full pl-3 pr-2 py-1.5 text-xs font-black shadow-md group-hover:gap-2.5 group-hover:shadow-lg transition-all">
            Qatnashish
            <ChevronRight :size="14" />
          </span>
        </div>
      </RouterLink>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { X, ChevronRight, Timer, BookOpenText, Zap, Layers } from "@lucide/vue";
import { useEventStore } from "../stores/EventStore";

const emit = defineEmits<{ closed: [] }>();

const store = useEventStore();
const show = ref(false);

const event = computed(() => {
  const active = store.events || [];
  return active.find((e: any) => !store.myParticipation[e.id]?.reward_claimed) || null;
});

const EVENT_META: Record<string, { path: string; icon: any }> = {
  math_sprint: { path: "/events/math-sprint", icon: Timer },
  idioms: { path: "/events/idioms", icon: BookOpenText },
  vocab: { path: "/events/vocab", icon: BookOpenText },
  subjects: { path: "/events/subjects", icon: Layers },
  marathon: { path: "/events/marathon", icon: Zap },
};

const eventPath = computed(() => EVENT_META[event.value?.type]?.path || "/events");
const eventIcon = computed(() => EVENT_META[event.value?.type]?.icon || Zap);

onMounted(async () => {
  try {
    await store.fetchEvents();
    if (event.value) show.value = true;
  } catch {
    /* event banner muhim emas */
  }
});

const dismiss = () => {
  show.value = false;
  emit("closed");
};
</script>

<style scoped>
.banner-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.banner-leave-active {
  transition: all 0.22s ease-in;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}

@keyframes blobA {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(16px, -12px) scale(1.12); }
}

@keyframes blobB {
  0%, 100% { transform: translate(0, 0) rotate(-6deg) scale(1); }
  50% { transform: translate(12px, 10px) rotate(4deg) scale(0.94); }
}

.animate-blob-a { animation: blobA 9s ease-in-out infinite; }
.animate-blob-b { animation: blobB 11s ease-in-out infinite; }

@keyframes twinkleK {
  0%, 100% { opacity: 0.2; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.3); }
}

.animate-twinkle { animation: twinkleK 2.6s ease-in-out infinite; }

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.15); }
}

.animate-splash-glow { animation: glowPulse 2.6s ease-in-out infinite; }

@keyframes twinkleStar {
  0%, 100% { opacity: 0.3; transform: scale(0.7) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.25) rotate(25deg); }
}

.animate-splash-twinkle { animation: twinkleStar 2s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .animate-blob-a, .animate-blob-b, .animate-twinkle,
  .animate-splash-glow, .animate-splash-twinkle { animation: none !important; }
}
</style>
