<template>
    <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-50
              dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900
              text-slate-900 dark:text-white px-4 pt-6 pb-16 transition-colors duration-300">
        <div class="max-w-lg mx-auto">
            <div class="flex items-center gap-3 mb-8">
                <RouterLink to="/" class="w-10 h-10 rounded-xl bg-slate-900/5 dark:bg-white/10 flex items-center justify-center
                 text-slate-700 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 transition">
                    ←
                </RouterLink>
                <h1 class="text-lg font-black">Fikr-mulohaza</h1>
            </div>

            <!-- Success -->
            <div v-if="submitted"
                class="bg-green-500/10 dark:bg-green-500/20 border border-green-400/30 rounded-3xl p-8 text-center">
                <div class="flex justify-center mb-4">
                    <CheckCircle :size="48" class="text-green-500" />
                </div>
                <h2 class="text-xl font-black text-green-600 dark:text-green-300">Rahmat!</h2>
                <p class="text-slate-500 dark:text-white/60 text-sm mt-2">
                    Fikringiz yuborildi. Ilovani yaxshilashga yordam berganingiz uchun tashakkur!
                </p>
                <RouterLink to="/" class="mt-5 inline-block px-6 py-3 bg-slate-900/5 dark:bg-white/10 rounded-2xl text-sm font-bold
                 hover:bg-slate-900/10 dark:hover:bg-white/20 transition">
                    ← Bosh sahifaga
                </RouterLink>
            </div>

            <div v-else>
                <!-- Hero -->
                <div class="text-center mb-8">
                    <div class="flex justify-center mb-3">
                        <FileText :size="48" class="text-orange-500" />
                    </div>
                    <h2 class="text-3xl font-black mb-2">Fikringiz muhim!</h2>
                    <p class="text-slate-500 dark:text-white/60 text-sm">
                        Ilovada nima yetishmayapti? Nimani yaxshilash kerak? Bizga ayting.
                    </p>
                </div>

                <!-- Category select -->
                <div class="grid grid-cols-3 gap-2 mb-5">
                    <button v-for="c in categories" :key="c.value" @click="form.category = c.value" :class="form.category === c.value
                        ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                        : 'border-slate-200 text-slate-500 dark:border-white/10 dark:text-white/50'" class="flex flex-col items-center gap-1 py-3 rounded-2xl border-2 font-bold text-xs transition-all
                   hover:bg-slate-50 dark:hover:bg-white/5">
                        <component :is="c.icon" :size="20" />
                        {{ c.label }}
                    </button>
                </div>

                <!-- Form -->
                <div
                    class="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 space-y-3 shadow-sm dark:shadow-none">
                    <div>
                        <label class="text-xs text-slate-400 dark:text-white/50 block mb-1">Ism (ixtiyoriy)</label>
                        <input v-model="form.name" placeholder="Abduhafiz Nazarov" class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20
                     text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm
                     focus:outline-none focus:border-orange-400 transition" />
                    </div>
                    <div>
                        <label class="text-xs text-slate-400 dark:text-white/50 block mb-1">Email (ixtiyoriy)</label>
                        <input v-model="form.email" type="email" placeholder="email@example.com" class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20
                     text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm
                     focus:outline-none focus:border-orange-400 transition" />
                    </div>
                    <div>
                        <label class="text-xs text-slate-400 dark:text-white/50 block mb-1">Xabaringiz</label>
                        <textarea v-model="form.message" rows="4" placeholder="Fikringizni shu yerga yozing..." class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20
                     text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 text-sm resize-none
                     focus:outline-none focus:border-orange-400 transition"></textarea>
                    </div>

                    <p v-if="formError"
                        class="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-400/10 rounded-xl px-3 py-2">
                        {{ formError }}
                    </p>

                    <button @click="submitFeedback" :disabled="sending" class="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-base
                   hover:opacity-90 transition disabled:opacity-60 active:scale-95">
                        <span v-if="sending" class="flex items-center justify-center gap-2">
                            <Loader :size="16" class="animate-spin" /> Yuborilmoqda...
                        </span>
                        <span v-else class="flex items-center justify-center gap-2">
                            <FileText :size="16" /> Yuborish
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <OnboardingTooltip pageId="Feedback" title="Fikr-mulohaza" description="Ilova haqida fikringizni qoldiring" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FileText, CheckCircle, Loader } from '@lucide/vue';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
import { useAuthStore } from '../stores/AuthStore';
import supabase from '../supabase';

const authStore = useAuthStore();
const sending = ref(false);
const submitted = ref(false);
const formError = ref('');

const categories = [
    { value: 'bug', label: 'Xatolik', icon: '🐞' },
    { value: 'feature', label: 'Taklif', icon: '💡' },
    { value: 'other', label: 'Boshqa', icon: '💬' },
];

const form = ref({
    name: authStore.displayName || '',
    email: authStore.user?.email || '',
    category: 'feature',
    message: '',
});

const submitFeedback = async () => {
    if (!form.value.message.trim()) {
        formError.value = 'Iltimos, xabaringizni yozing!';
        return;
    }

    sending.value = true;
    formError.value = '';
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.functions.invoke('send-telegram', {
            body: {
                type: 'feedback',
                name: form.value.name,
                email: form.value.email,
                category: form.value.category,
                message: form.value.message,
                userId: user?.id || '',
            },
        });

        console.log('invoke natijasi:', { data, error });

        if (error) throw error;
        submitted.value = true;
    } catch (err) {
        console.error('Feedback yuborishda xatolik:', err);
        formError.value = 'Xatolik yuz berdi. Qayta urinib ko\'ring.';
    }
    sending.value = false;
};
</script>
