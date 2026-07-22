<template>
    <div
        class="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 py-6 px-4">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
                <RouterLink to="/" class="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center
                 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 active:scale-90 transition">
                    ←
                </RouterLink>
                <div>
                    <h1 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span
                            class="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-300">
                            <Globe :size="18" />
                        </span>
                        Tarjimon
                    </h1>
                    <p class="text-xs text-slate-500 dark:text-white/60 ml-9">Matn va so'zlarni tarjima qiling</p>
                </div>
            </div>

            <!-- Source language -->
            <div
                class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-3 shadow-sm transition-shadow hover:shadow-md">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-slate-500 dark:text-white/60">Tarjima qilish</span>
                    <button @click="speak(sourceText, sourceLang)" :disabled="!sourceText"
                        class="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed">
                        <Volume2 :size="14" /> O'qish
                    </button>
                </div>
                <div class="flex gap-2 mb-3 flex-wrap">
                    <button v-for="l in languages" :key="l.code" @click="sourceLang = l.code"
                        :class="sourceLang === l.code ? 'border-orange-400 bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/50 scale-105' : 'border-slate-200 text-slate-500 dark:border-white/10 dark:text-white/50'"
                        class="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                        {{ l.flag }} {{ l.name }}
                    </button>
                </div>
                <textarea v-model="sourceText" @keydown.enter.meta.prevent="translateText"
                    @keydown.enter.ctrl.prevent="translateText" placeholder="Matn yoki so'zni kiriting..."
                    class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20
                 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm resize-none
                 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/10 transition h-20"></textarea>
            </div>

            <!-- Swap button -->
            <div class="flex justify-center my-2">
                <button @click="swapLanguages"
                    class="w-10 h-10 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10
               flex items-center justify-center text-slate-500 dark:text-white/50 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-white/20 active:scale-90 transition-all shadow-sm">
                    <ArrowLeftRight :size="18" class="transition-transform duration-300"
                        :class="{ 'rotate-180': swapped }" />
                </button>
            </div>

            <!-- Target language -->
            <div
                class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm transition-shadow hover:shadow-md">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-slate-500 dark:text-white/60">Tarjima</span>
                    <button v-if="translatedText && !translating" @click="speak(translatedText, targetLang)"
                        class="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition">
                        <Volume2 :size="14" /> O'qish
                    </button>
                </div>
                <div class="flex gap-2 mb-3 flex-wrap">
                    <button v-for="l in languages" :key="l.code" @click="targetLang = l.code"
                        :class="targetLang === l.code ? 'border-orange-400 bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/50 scale-105' : 'border-slate-200 text-slate-500 dark:border-white/10 dark:text-white/50'"
                        class="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                        {{ l.flag }} {{ l.name }}
                    </button>
                </div>

                <div class="min-h-12 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 p-4 text-sm
               text-slate-800 dark:text-white">
                    <span v-if="translating" class="text-slate-400 flex items-center gap-2">
                        <Loader :size="16" class="animate-spin" /> Tarjima qilinmoqda...
                    </span>
                    <div v-else-if="translatedText" :key="resultKey" class="animate-pop">
                        <p class="leading-relaxed">{{ translatedText }}</p>
                    </div>
                    <span v-else class="text-slate-400">Tarjima shu yerda paydo bo'ladi</span>
                </div>

                <!-- CEFR level badge -->
                <Transition name="pop">
                    <div v-if="currentLevel && !translating" class="mt-3 flex items-center gap-3">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border"
                            :class="levelStyle(currentLevel).badge">
                            <BarChart3 :size="12" /> {{ currentLevel }} — {{ levelStyle(currentLevel).label }}
                        </span>
                        <div class="flex-1 flex gap-1">
                            <span v-for="(seg, i) in cefrOrder" :key="seg"
                                class="h-1.5 flex-1 rounded-full transition-all duration-500"
                                :class="i <= cefrOrder.indexOf(currentLevel) ? levelStyle(currentLevel).bar : 'bg-slate-200 dark:bg-white/10'"
                                :style="{ transitionDelay: `${i * 60}ms` }" />
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- Translate button -->
            <button @click="translateText" :disabled="translating || !sourceText.trim()"
                class="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-lg
               hover:opacity-90 transition disabled:opacity-60 active:scale-95 shadow-lg shadow-orange-200 dark:shadow-orange-800/30">
                <span v-if="translating" class="flex items-center justify-center gap-2">
                    <Loader :size="18" class="animate-spin" /> Tarjima qilinmoqda...
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                    <Globe :size="18" /> Tarjima qilish
                </span>
            </button>
            <p v-if="errorMsg" class="text-xs text-red-400 text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle :size="13" /> {{ errorMsg }}
            </p>

            <!-- Save to Word List -->
            <div v-if="translatedText && sourceText.trim() && !translating" class="mt-4 text-center animate-pop">
                <button @click="saveWord"
                    class="px-5 py-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm
                 text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/20 active:scale-95 transition flex items-center gap-2 mx-auto">
                    <BookOpen :size="16" class="text-orange-500" /> So'zlar ro'yxatiga qo'shish
                </button>
                <p v-if="wordSaved"
                    class="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1 animate-pop">
                    <CheckCircle :size="14" /> Saqlandi!
                </p>
            </div>

            <!-- Recent Translations -->
            <div v-if="recentTranslations.length > 0"
                class="mt-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                <h2 class="font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen :size="16" class="text-orange-500" /> So'nggi tarjimalar
                </h2>
                <TransitionGroup name="row">
                    <button v-for="(item, idx) in recentTranslations" :key="item.source + idx" @click="reuse(item)"
                        class="w-full flex items-center justify-between gap-2 py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0 text-left hover:bg-slate-50 dark:hover:bg-white/5 -mx-1 px-1 rounded-lg transition">
                        <div class="min-w-0">
                            <p class="text-sm font-bold text-slate-800 dark:text-white truncate">{{ item.source }}</p>
                            <p class="text-xs text-slate-400 truncate">{{ item.translated }}</p>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span v-if="item.level" class="px-1.5 py-0.5 rounded text-[10px] font-black border"
                                :class="levelStyle(item.level).badge">{{ item.level }}</span>
                            <span @click.stop="speak(item.translated, targetLang)"
                                class="text-slate-400 hover:text-orange-500 transition">
                                <Volume2 :size="14" />
                            </span>
                        </div>
                    </button>
                </TransitionGroup>
            </div>
        </div>
        <OnboardingTooltip pageId="Translate" title="Tarjimon"
            description="Matnlarni tez va oson tarjima qiling, so'zning qiyinlik darajasini ko'ring" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Globe, ArrowLeftRight, Loader, BookOpen, CheckCircle, Volume2, BarChart3, AlertCircle } from '@lucide/vue';
import supabase from '../supabase';
import { askAIJson } from '../lib/ai';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';

const languages = [
    { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const cefrMeta: Record<string, { label: string; badge: string; bar: string }> = {
    A1: { label: "Boshlang'ich", badge: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30', bar: 'bg-green-400' },
    A2: { label: "Oddiy", badge: 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30', bar: 'bg-teal-400' },
    B1: { label: "O'rta", badge: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30', bar: 'bg-blue-400' },
    B2: { label: "O'rta-yuqori", badge: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30', bar: 'bg-indigo-400' },
    C1: { label: "Yuqori", badge: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30', bar: 'bg-purple-400' },
    C2: { label: "Mukammal", badge: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30', bar: 'bg-red-400' },
};
const levelStyle = (lvl: string) => cefrMeta[lvl] || cefrMeta.B1;

const sourceLang = ref('uz');
const targetLang = ref('en');
const sourceText = ref('');
const translatedText = ref('');
const translating = ref(false);
const wordSaved = ref(false);
const errorMsg = ref('');
const currentLevel = ref('');
const swapped = ref(false);
const resultKey = ref(0);
const recentTranslations = ref<{ source: string; translated: string; level: string }[]>([]);

const normalizeLevel = (lvl: string) => {
    const clean = (lvl || '').trim().toUpperCase();
    return cefrOrder.includes(clean) ? clean : 'B1';
};

const translateText = async () => {
    if (!sourceText.value.trim() || translating.value) return;
    translating.value = true;
    wordSaved.value = false;
    errorMsg.value = '';
    translatedText.value = '';
    currentLevel.value = '';

    const fromName = languages.find(l => l.code === sourceLang.value)?.name || sourceLang.value;
    const toName = languages.find(l => l.code === targetLang.value)?.name || targetLang.value;
    const text = sourceText.value.trim();

    try {
        const result = await askAIJson<{ translated: string; level: string }>(
            `Sen tarjimonsan. "${text}" matnini/so'zini ${fromName} tilidan ${toName} tiliga tarjima qil. Shuningdek, asl so'z yoki matnning CEFR qiyinlik darajasini (A1, A2, B1, B2, C1, C2 dan biri) aniqla. Faqat quyidagi JSON formatda javob ber, boshqa hech qanday matn yozma: {"translated":"tarjima matni","level":"A1"}`,
            { translated: '', level: '' }
        );

        if (!result?.translated?.trim()) {
            errorMsg.value = "Tarjima topilmadi. Qayta urinib ko'ring.";
        } else {
            translatedText.value = result.translated.trim();
            currentLevel.value = normalizeLevel(result.level);
            resultKey.value++;
            recentTranslations.value.unshift({
                source: text,
                translated: translatedText.value,
                level: currentLevel.value,
            });
            if (recentTranslations.value.length > 6) recentTranslations.value.pop();
        }
    } catch (e) {
        console.error('translate error:', e);
        errorMsg.value = "Xatolik yuz berdi. Qayta urinib ko'ring.";
    }
    translating.value = false;
};

const swapLanguages = () => {
    swapped.value = !swapped.value;
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
    sourceText.value = translatedText.value;
    translatedText.value = '';
    currentLevel.value = '';
    errorMsg.value = '';
};

const reuse = (item: { source: string; translated: string; level: string }) => {
    sourceText.value = item.source;
    translatedText.value = item.translated;
    currentLevel.value = item.level;
    resultKey.value++;
};

const speak = (text: string, lang: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : lang === 'ar' ? 'ar-SA' : lang === 'tr' ? 'tr-TR' : lang === 'es' ? 'es-ES' : 'en-US';
    speechSynthesis.speak(utterance);
};

const saveWord = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('word_list').insert({
            user_id: user.id,
            word: sourceText.value.trim(),
            translation: translatedText.value,
        });
        wordSaved.value = true;
        setTimeout(() => { wordSaved.value = false; }, 2000);
    } catch (e) {
        console.error('saveWord error:', e);
    }
};
</script>

<style scoped>
@keyframes pop {
    0% {
        opacity: 0;
        transform: scale(0.94) translateY(2px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.animate-pop {
    animation: pop 0.25s ease-out;
}

.pop-enter-active {
    transition: all 0.25s ease-out;
}

.pop-leave-active {
    transition: all 0.15s ease-in;
}

.pop-enter-from {
    opacity: 0;
    transform: translateY(-4px);
}

.pop-leave-to {
    opacity: 0;
}

.row-enter-active,
.row-leave-active {
    transition: all 0.25s ease;
}

.row-enter-from {
    opacity: 0;
    transform: translateX(-8px);
}

.row-leave-to {
    opacity: 0;
    transform: translateX(8px);
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
</style>