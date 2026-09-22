<template>
  <div class="space-y-3">
    <template v-for="(b, i) in blocks" :key="i">
      <!-- Katta sarlavha (h1) -->
      <div v-if="b.type === 'title'"
        class="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 shadow-md">
        <BookOpen :size="18" class="text-white flex-shrink-0" />
        <h2 class="text-white font-black text-base leading-snug" v-html="fmt(b.text)"></h2>
      </div>

      <!-- Bo'lim sarlavhasi (h2/h3) -->
      <div v-else-if="b.type === 'h'"
        class="flex items-center gap-2 mt-4 first:mt-0">
        <span class="w-1.5 h-6 rounded-full bg-gradient-to-b from-orange-400 to-rose-500 flex-shrink-0"></span>
        <h3 class="font-black text-slate-900 dark:text-white text-[15px] sm:text-base leading-snug"
          v-html="fmt(b.text)"></h3>
      </div>

      <!-- Qadam (raqamlangan bosqich) — har biri o'z rangida karta -->
      <div v-else-if="b.type === 'step'"
        class="rounded-2xl border-2 p-4 shadow-sm transition-transform hover:scale-[1.005]"
        :class="[pal(b.idx).bg, pal(b.idx).border]">
        <div class="flex items-start gap-3">
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md"
            :class="pal(b.idx).badge">
            {{ b.num }}
          </span>
          <div class="flex-1 min-w-0 space-y-2">
            <p class="font-black text-slate-900 dark:text-white text-[15px] leading-snug"
              v-html="fmt(b.title)"></p>

            <!-- Iqtiboslar (she'r, matn) -->
            <div v-for="(q, qi) in b.quotes" :key="'q' + qi"
              class="flex items-start gap-2 rounded-lg border-l-4 bg-white/70 dark:bg-slate-900/40 px-3 py-2"
              :class="pal(b.idx).accentBorder">
              <Quote :size="12" class="mt-0.5 flex-shrink-0 opacity-60" :class="pal(b.idx).accent" />
              <p class="italic text-[14px] leading-relaxed text-slate-700 dark:text-slate-200"
                v-html="fmt(q)"></p>
            </div>

            <!-- Oddiy paragraflar -->
            <p v-for="(p, pi) in b.paras" :key="'p' + pi"
              class="text-[14px] sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-200"
              v-html="fmt(p)"></p>

            <!-- Bullet ro'yxat -->
            <div v-for="(li, li2) in b.bullets" :key="'b' + li2" class="flex items-start gap-2">
              <span class="w-2 h-2 rounded-full mt-[7px] flex-shrink-0" :class="pal(b.idx).dot"></span>
              <p class="text-[14px] leading-relaxed text-slate-700 dark:text-slate-200" v-html="fmt(li)"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mustaqil iqtibos -->
      <div v-else-if="b.type === 'quote'"
        class="flex items-start gap-2 rounded-2xl border-l-4 border-purple-300 dark:border-purple-500/50 bg-purple-50/60 dark:bg-purple-500/10 px-4 py-2.5">
        <Quote :size="13" class="mt-1 flex-shrink-0 text-purple-400" />
        <p class="italic text-[14px] leading-relaxed text-slate-700 dark:text-slate-200" v-html="fmt(b.text)"></p>
      </div>

      <!-- Mustaqil paragraf -->
      <p v-else-if="b.type === 'p'"
        class="text-[14px] sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-200"
        v-html="fmt(b.text)"></p>

      <!-- JAVOB — katta yashil blok -->
      <div v-else-if="b.type === 'answer'"
        class="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 p-[2px] shadow-lg animate-pop">
        <div class="rounded-[calc(1rem-2px)] bg-emerald-50 dark:bg-slate-900 px-4 py-3.5 flex items-start gap-3">
          <span
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <CheckCircle2 :size="18" class="text-white" />
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Javob
            </p>
            <p class="font-black text-slate-900 dark:text-white text-[15px] sm:text-base leading-relaxed mt-0.5"
              v-html="fmt(b.text)"></p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BookOpen, Quote, CheckCircle2 } from "@lucide/vue";

const props = defineProps<{ text: string }>();

/* ── Rang palitrası: bosqichlar ketma-ket turli ranglarda ── */
const PALETTE = [
  { bg: "bg-sky-50/80 dark:bg-sky-500/10", border: "border-sky-200 dark:border-sky-500/30", badge: "bg-sky-500", accent: "text-sky-500", accentBorder: "border-sky-300 dark:border-sky-500/40", dot: "bg-sky-500" },
  { bg: "bg-violet-50/80 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/30", badge: "bg-violet-500", accent: "text-violet-500", accentBorder: "border-violet-300 dark:border-violet-500/40", dot: "bg-violet-500" },
  { bg: "bg-amber-50/80 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", badge: "bg-amber-500", accent: "text-amber-500", accentBorder: "border-amber-300 dark:border-amber-500/40", dot: "bg-amber-500" },
  { bg: "bg-emerald-50/80 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", badge: "bg-emerald-500", accent: "text-emerald-500", accentBorder: "border-emerald-300 dark:border-emerald-500/40", dot: "bg-emerald-500" },
  { bg: "bg-rose-50/80 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/30", badge: "bg-rose-500", accent: "text-rose-500", accentBorder: "border-rose-300 dark:border-rose-500/40", dot: "bg-rose-500" },
  { bg: "bg-cyan-50/80 dark:bg-cyan-500/10", border: "border-cyan-200 dark:border-cyan-500/30", badge: "bg-cyan-500", accent: "text-cyan-500", accentBorder: "border-cyan-300 dark:border-cyan-500/40", dot: "bg-cyan-500" },
  { bg: "bg-indigo-50/80 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/30", badge: "bg-indigo-500", accent: "text-indigo-500", accentBorder: "border-indigo-300 dark:border-indigo-500/40", dot: "bg-indigo-500" },
  { bg: "bg-fuchsia-50/80 dark:bg-fuchsia-500/10", border: "border-fuchsia-200 dark:border-fuchsia-500/30", badge: "bg-fuchsia-500", accent: "text-fuchsia-500", accentBorder: "border-fuchsia-300 dark:border-fuchsia-500/40", dot: "bg-fuchsia-500" },
];
const pal = (idx: number) => PALETTE[idx % PALETTE.length];

/* ── Blok turlari ── */
type Simple = { type: "title" | "h" | "p" | "quote" | "answer"; text: string; level?: number };
type Step = {
  type: "step";
  num: string;
  title: string;
  idx: number;
  paras: string[];
  quotes: string[];
  bullets: string[];
};
type Block = Simple | Step;

const parse = (raw: string): Block[] => {
  const lines = (raw || "").split(/\r?\n/);
  const blocks: Block[] = [];
  let step: Step | null = null;
  let stepIdx = 0;

  const closeStep = () => {
    if (step && (step.title || step.paras.length || step.quotes.length || step.bullets.length)) {
      blocks.push(step);
      step = null;
    } else if (step) {
      step = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^-{3,}$/.test(line)) { closeStep(); continue; }

    // AI chiqishidagi <u>...</u> teglari matn ichida bo'ladi — fmt tozalaydi.
    const clean = line.replace(/\*{1,2}$/, "").trim(); // "Masala sharti:**" artifact

    // JAVOB bloki
    const answerM = clean.replace(/\*/g, "").match(/^\s*(JAVOB|Javob|javob|YAKUNIY JAVOB|Yakuniy javob)\s*[:：]?\s*(.*)$/);
    if (answerM) {
      closeStep();
      blocks.push({ type: "answer", text: answerM[2] || "" });
      continue;
    }

    // Markdown sarlavha (#, ##, ###)
    const hM = clean.match(/^(#{1,6})\s+(.+)$/);
    if (hM) {
      closeStep();
      const level = hM[1].length;
      const text = hM[2].replace(/:\s*$/, "").replace(/\*+/g, "").trim();
      if (level === 1 && blocks.length === 0) blocks.push({ type: "title", text });
      else blocks.push({ type: "h", text, level });
      continue;
    }

    // Iqtibos (>)
    if (clean.startsWith(">")) {
      const q = clean.replace(/^>\s?/, "").trim();
      if (!q) continue;
      if (step) step.quotes.push(q);
      else blocks.push({ type: "quote", text: q });
      continue;
    }

    // Raqamlangan qadam: "1. **She'r matnini o'qish (OCR):"
    const stepM = clean.match(/^(\d{1,2})[.)]\s+(.+)$/);
    if (stepM) {
      closeStep();
      step = {
        type: "step",
        num: stepM[1],
        title: stepM[2].replace(/:\s*$/, "").trim(),
        idx: stepIdx++,
        paras: [],
        quotes: [],
        bullets: [],
      };
      continue;
    }

    // Bullet
    const bulletM = clean.match(/^[-•*]\s+(.+)$/);
    if (bulletM) {
      const t = bulletM[1].trim();
      if (step) step.bullets.push(t);
      else blocks.push({ type: "p", text: "• " + t });
      continue;
    }

    // Qisqa, ':' bilan tugagan, to'liq qalin yoki shunchaki sarlavha ko'rinishidagi qator
    const fullyBold = /^\*\*(.+)\*\*:?$/.test(clean) || clean.endsWith(":**");
    if (fullyBold || (clean.length < 70 && /[:：]$/.test(clean) && !/\.$/.test(clean))) {
      closeStep();
      const text = clean.replace(/\*+/g, "").replace(/[:：]\s*$/, "").trim();
      if (!text) continue;
      if (blocks.length === 0) blocks.push({ type: "title", text });
      else blocks.push({ type: "h", text, level: 2 });
      continue;
    }

    // Oddiy paragraf
    if (step) step.paras.push(clean);
    else blocks.push({ type: "p", text: clean });
  }
  closeStep();
  return blocks;
};

/* ── Matnni xavfsiz HTML'ga aylantirish: escape → teglarni tozalash → **qalin** → `kod` ── */
const fmt = (t: string): string => {
  let s = String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // AI ba'zan <u>ng</u> kabi teg qoldiradi — tag'ni olib tashlab, matnni qoldiramiz
  s = s.replace(/&lt;\/?u&gt;/gi, "");
  s = s.replace(/&lt;\/?(b|i|em|strong)&gt;/gi, "");
  // **qalin** → <strong>
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>');
  // `kod` → <code>
  s = s.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[13px] font-bold text-orange-600 dark:text-orange-300">$1</code>',
  );
  // Qolgan yolg'iz ** ni tozalash
  s = s.replace(/\*{2,}/g, "");
  return s;
};

const blocks = computed<Block[]>(() => parse(props.text));
</script>
