<template>
    <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-50
              dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900
              text-slate-900 dark:text-white px-4 pt-6 pb-28 md:pb-16 transition-colors duration-300">
        <div class="max-w-lg mx-auto">
            <div class="flex items-center gap-3 mb-8">
                <RouterLink to="/" class="w-10 h-10 rounded-xl bg-slate-900/5 dark:bg-white/10 flex items-center justify-center
                 text-slate-700 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 transition">
                    <ArrowLeft :size="18" />
                </RouterLink>
                <h1 class="text-lg font-black">Fikr-mulohaza</h1>
            </div>

            <!-- Success -->
            <div v-if="submitted"
                class="bg-green-500/10 dark:bg-green-500/20 border border-green-400/30 rounded-3xl p-8 text-center animate-pop">
                <div class="flex justify-center mb-4">
                    <CheckCircle :size="48" class="text-green-500" />
                </div>
                <h2 class="text-xl font-black text-green-600 dark:text-green-300">Rahmat!</h2>
                <p class="text-slate-500 dark:text-white/60 text-sm mt-2">
                    Fikringiz yuborildi. Ilovani yaxshilashga yordam berganingiz uchun tashakkur!
                </p>
                <RouterLink to="/" class="mt-5 inline-block px-6 py-3 bg-slate-900/5 dark:bg-white/10 rounded-2xl text-sm font-bold
                 hover:bg-slate-900/10 dark:hover:bg-white/20 transition">
                    Bosh sahifaga
                </RouterLink>
            </div>

            <div v-else>
                <!-- Hero -->
                <div class="text-center mb-6">
                    <div class="flex justify-center mb-3">
                        <span class="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-float">
                            <MessageSquareHeart :size="32" class="text-white" />
                        </span>
                    </div>
                    <h2 class="text-3xl font-black mb-1">Fikringiz muhim!</h2>
                    <p class="text-slate-500 dark:text-white/60 text-sm">
                        30 soniyada yuboring — yozish shart emas
                    </p>
                </div>

                <!-- Step 1: Star rating -->
                <div class="bg-white dark:bg-white/5 rounded-3xl p-5 border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none mb-4">
                    <p class="text-sm font-bold text-center mb-3">Ilovaga qancha baho berasiz?</p>
                    <div class="flex items-center justify-center gap-2">
                        <button v-for="i in 5" :key="i" @click="form.rating = i; pickDefaultTags(i)"
                            class="p-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 active:scale-125 transition-transform"
                            :aria-label="`${i} yulduz`">
                            <Star :size="34" :class="i <= form.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 dark:text-slate-600'" />
                        </button>
                    </div>
                    <p v-if="form.rating" class="text-center text-xs font-bold mt-2"
                        :class="RATING_LABELS[form.rating].cls">
                        {{ RATING_LABELS[form.rating].text }}
                    </p>
                </div>

                <!-- Step 2: Quick tags -->
                <div v-if="form.rating" class="mb-4 animate-fade-in-up">
                    <p class="text-sm font-bold mb-2.5">Nima haqida? <span class="text-slate-400 font-medium">(bitta tanlang — kifoya)</span></p>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="tag in availableTags" :key="tag" @click="toggleTag(tag)"
                            :class="form.tags.includes(tag)
                            ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/25 scale-105'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/15 text-slate-600 dark:text-white/70'"
                            class="px-4 py-2 rounded-full border-2 text-[13px] font-bold transition-all active:scale-95">
                            {{ tag }}
                        </button>
                    </div>
                </div>

                <!-- Step 3: optional details -->
                <div v-if="form.tags.length" class="bg-white dark:bg-white/5 rounded-3xl p-5 border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none space-y-3 animate-fade-in-up">
                    <button v-if="!showDetails" @click="showDetails = true"
                        class="w-full py-2.5 rounded-2xl text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition">
                        + Batafsil yozmoqchiman (ixtiyoriy)
                    </button>

                    <div v-if="showDetails" class="space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs text-slate-400 dark:text-white/50 block mb-1">Ism</label>
                                <input v-model="form.name" placeholder="Ismingiz" class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20
                     text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm
                     focus:outline-none focus:border-orange-400 transition" />
                            </div>
                            <div>
                                <label class="text-xs text-slate-400 dark:text-white/50 block mb-1">Email</label>
                                <input v-model="form.email" type="email" placeholder="email@example.com" class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20
                     text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm
                     focus:outline-none focus:border-orange-400 transition" />
                            </div>
                        </div>
                        <div>
                            <label class="text-xs text-slate-400 dark:text-white/50 block mb-1">Xabar (ixtiyoriy)</label>
                            <textarea v-model="form.message" rows="3" placeholder="Qo'shimcha gaplashmoqchi bo'lsangiz..." class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20
                     text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm resize-none
                     focus:outline-none focus:border-orange-400 transition"></textarea>
                        </div>
                    </div>

                    <p v-if="formError"
                        class="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-400/10 rounded-xl px-3 py-2">
                        {{ formError }}
                    </p>

                    <button @click="submitFeedback" :disabled="sending"
                        class="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-base
                   hover:opacity-90 transition disabled:opacity-60 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
                        <Loader v-if="sending" :size="16" class="animate-spin" />
                        <Send v-else :size="16" />
                        {{ sending ? 'Yuborilmoqda...' : 'Fikrni yuborish' }}
                    </button>
                </div>
            </div>
        </div>
        <OnboardingTooltip pageId="Feedback" title="Fikr-mulohaza" description="Ilova haqida fikringizni qoldiring" />
    </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue';
import { ArrowLeft, CheckCircle, Star, Loader, Send, MessageSquareHeart } from '@lucide/vue';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
import { useAuthStore } from '../stores/AuthStore';
import supabase from '../supabase';

const authStore = useAuthStore();
const sending = ref(false);
const submitted = ref(false);
const formError = ref('');
const showDetails = ref(false);

const RATING_LABELS: Record<number, { text: string; cls: string }> = {
    1: { text: 'Juda yoqmadi 😕', cls: 'text-red-500' },
    2: { text: 'Yoqmadi', cls: 'text-orange-500' },
    3: { text: 'O\'rtacha', cls: 'text-amber-500' },
    4: { text: 'Yoqdi!', cls: 'text-lime-600' },
    5: { text: 'Juda yoqdi! 🎉', cls: 'text-green-600' },
};

const POSITIVE_TAGS = ['Dizayn chiroyli', 'AI kuchli', 'Tez ishlaydi', 'O\'qishga yordam beradi', 'O\'yinlar qiziqarli'];
const NEGATIVE_TAGS = ['Sekin ishlaydi', 'Dizayn chatoq', 'AI noto\'g\'ri javob beradi', 'Funksiya yetishmaydi', 'Xatolar ko\'p'];

const availableTags = computed(() => (form.value.rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS));

const form = ref({
    name: authStore.displayName || '',
    email: authStore.user?.email || '',
    rating: 0,
    tags: [] as string[],
    message: '',
});

// rating tanlanganda mos teglarni avtomatik taklif qilamiz
const pickDefaultTags = (rating: number) => {
    form.value.tags = [];
    // 1 tagni avtomatik belgilaymiz — user bir bosishda yubora oladi
    form.value.tags.push(rating >= 4 ? POSITIVE_TAGS[0] : NEGATIVE_TAGS[0]);
};

const toggleTag = (tag: string) => {
    const idx = form.value.tags.indexOf(tag);
    if (idx >= 0) form.value.tags.splice(idx, 1);
    else form.value.tags.push(tag);
};

const submitFeedback = async () => {
    if (!form.value.rating) {
        formError.value = 'Avval yulduzcha bilan baho bering!';
        return;
    }

    sending.value = true;
    formError.value = '';
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.functions.invoke('send-telegram', {
            body: {
                type: 'feedback',
                name: form.value.name,
                email: form.value.email,
                category: form.value.rating >= 4 ? 'feature' : 'bug',
                message: [
                    `⭐ ${form.value.rating}/5 yulduz`,
                    form.value.tags.length ? `Teglar: ${form.value.tags.join(', ')}` : '',
                    form.value.message,
                ].filter(Boolean).join('\n'),
                userId: user?.id || '',
            },
        });

        if (error) throw error;
        submitted.value = true;
    } catch (err) {
        console.error('Feedback yuborishda xatolik:', err);
        formError.value = 'Xatolik yuz berdi. Qayta urinib ko\'ring.';
    }
    sending.value = false;
};
</script>
