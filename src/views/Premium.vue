<template>
    <div
        class="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 py-6 px-4">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-8 animate-rise">
                <RouterLink to="/"
                    class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 active:scale-90 transition">
                    ←
                </RouterLink>
                <div>
                    <h1 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span
                            class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-amber-300">
                            <Crown :size="18" />
                        </span>
                        Premium
                    </h1>
                    <p class="text-xs text-slate-500 dark:text-white/60 ml-11">Barcha imkoniyatlarni oching</p>
                </div>
            </div>

            <!-- Already premium banner -->
            <div v-if="authStore.isPremium"
                class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center gap-3 shadow-lg shadow-amber-200 dark:shadow-amber-800/30 animate-rise">
                <Crown :size="22" />
                <div>
                    <p class="font-black text-sm">Siz allaqachon Premium foydalanuvchisiz!</p>
                    <p class="text-xs opacity-90">Barcha imkoniyatlardan bemalol foydalaning.</p>
                </div>
            </div>

            <!-- Plans -->
            <div class="grid grid-cols-2 gap-3 mb-8">
                <!-- Free -->
                <div class="rounded-3xl p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm animate-rise transition-transform hover:-translate-y-0.5"
                    style="animation-delay: 60ms">
                    <div class="flex items-center gap-2 mb-3">
                        <span
                            class="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/70 rounded-xl">Free</span>
                    </div>
                    <div class="text-2xl font-black mb-3">0 so'm</div>
                    <ul class="space-y-2 text-xs text-slate-500 dark:text-white/60">
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="text-green-500 flex-shrink-0" /> Test yechish
                        </li>
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="text-green-500 flex-shrink-0" /> Mashqlar
                        </li>
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="text-green-500 flex-shrink-0" /> O'yinlar
                        </li>
                    </ul>
                </div>

                <!-- Premium -->
                <div class="relative rounded-3xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white border border-amber-300 shadow-lg shadow-amber-200/30 dark:shadow-amber-800/30 animate-rise transition-transform hover:-translate-y-0.5 overflow-hidden"
                    style="animation-delay: 120ms">
                    <div class="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full animate-pulse-slow"></div>
                    <div class="flex items-center gap-2 mb-3">
                        <span
                            class="px-2 py-1 text-xs font-bold bg-white/25 text-white rounded-xl flex items-center gap-1">
                            <Crown :size="12" /> Premium
                        </span>
                    </div>
                    <div class="text-2xl font-black mb-3">29,000 so'm <span
                            class="text-sm font-medium opacity-80">/oy</span></div>
                    <ul class="space-y-2 text-xs relative">
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="flex-shrink-0" /> Barcha bepul funksiyalar
                        </li>
                        <li class="flex items-center gap-2">
                            <Zap :size="14" class="flex-shrink-0" /> Cheksiz test yaratish
                        </li>
                        <li class="flex items-center gap-2">
                            <Rocket :size="14" class="flex-shrink-0" /> AI tahlil
                        </li>
                        <li class="flex items-center gap-2">
                            <Unlock :size="14" class="flex-shrink-0" /> Maxsus test formatlari
                        </li>
                        <li class="flex items-center gap-2">
                            <Star :size="14" class="flex-shrink-0" /> Reytingda ajralib turish
                        </li>
                        <li class="flex items-center gap-2">
                            <Gem :size="14" class="flex-shrink-0" /> Maxfiy sovg'alar
                        </li>
                    </ul>
                </div>
            </div>

            <!-- CTA -->
            <div v-if="!authStore.isPremium"
                class="text-center p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm animate-rise"
                style="animation-delay: 180ms">
                <h2 class="font-black text-slate-900 dark:text-white text-lg mb-2">Hoziroq yangilang!</h2>
                <p class="text-xs text-slate-500 dark:text-white/60 mb-5">29,000 so'm/oy evaziga barcha imkoniyatlarni
                    qo'lga kiriting. So'rov yuborsangiz, operator siz bilan bog'lanadi.</p>
                <button @click="openModal"
                    class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-200 dark:shadow-amber-800/30 hover:opacity-90 transition active:scale-95">
                    <Rocket :size="18" /> Premiumga o'tish
                </button>
            </div>
        </div>

        <!-- Request Modal -->
        <Transition name="modal">
            <div v-if="showModal"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                @click.self="closeModal">
                <div
                    class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-slate-200 dark:border-white/10">

                    <!-- Success state -->
                    <div v-if="submitted" class="text-center py-4 animate-pop">
                        <div
                            class="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle :size="32" class="text-green-500" />
                        </div>
                        <h3 class="font-black text-slate-900 dark:text-white text-lg mb-1">So'rov yuborildi!</h3>
                        <p class="text-sm text-slate-500 dark:text-white/60 mb-5">Tez orada operator siz bilan
                            bog'lanib, to'lov va Premium faollashtirish bo'yicha yordam beradi.</p>
                        <button @click="closeModal"
                            class="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
                            Yopish
                        </button>
                    </div>

                    <!-- Form state -->
                    <div v-else>
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Crown :size="20" class="text-amber-500" /> Premiumga so'rov
                            </h2>
                            <button @click="closeModal"
                                class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-90 transition">
                                <X :size="16" />
                            </button>
                        </div>

                        <div
                            class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-3 mb-4 flex items-center justify-between">
                            <span class="text-xs font-bold text-amber-700 dark:text-amber-300">Premium (oylik)</span>
                            <span class="text-sm font-black text-amber-700 dark:text-amber-300">29,000 so'm</span>
                        </div>

                        <div class="space-y-3">
                            <div>
                                <label
                                    class="text-xs font-bold text-slate-500 dark:text-white/60 mb-1 flex items-center gap-1">
                                    <User :size="12" /> Ismingiz
                                </label>
                                <input v-model="form.name" placeholder="To'liq ismingiz"
                                    class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-500/10 transition" />
                            </div>
                            <div>
                                <label
                                    class="text-xs font-bold text-slate-500 dark:text-white/60 mb-1 flex items-center gap-1">
                                    <Phone :size="12" /> Telefon raqam
                                </label>
                                <input v-model="form.phone" type="tel" placeholder="+998 90 123 45 67"
                                    class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-500/10 transition" />
                            </div>
                        </div>

                        <p v-if="errorMsg" class="text-xs text-red-400 mt-3 flex items-center gap-1">
                            <AlertCircle :size="13" /> {{ errorMsg }}
                        </p>

                        <button @click="submitRequest"
                            :disabled="submitting || !form.name.trim() || form.phone.trim().length < 7"
                            class="w-full mt-5 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-2xl text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            <Loader v-if="submitting" :size="16" class="animate-spin" />
                            <template v-else>
                                <Rocket :size="16" /> So'rovni yuborish
                            </template>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <OnboardingTooltip pageId="Premium" title="Premium" description="Premium imkoniyatlar va afzalliklar" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Gem, Star, Rocket, CheckCircle, Crown, Unlock, Zap, X, User, Phone, Loader, AlertCircle } from '@lucide/vue';
import supabase from '../supabase';
import { useAuthStore } from '../stores/AuthStore';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';

const authStore = useAuthStore();

// ⚠️ Tekshiring: bu nom Supabase dashboard > Edge Functions bo'limida
// joylashtirilgan funksiyangiz nomi bilan bir xil bo'lishi kerak
// (o'sha "feedback / send_results / premium so'rovi"ni boshqaradigan fayl).
const EDGE_FUNCTION_NAME = 'send-telegram';

const showModal = ref(false);
const submitting = ref(false);
const submitted = ref(false);
const errorMsg = ref('');
const form = reactive({ name: '', phone: '' });

const openModal = () => {
    form.name = authStore.displayName || '';
    form.phone = '';
    submitted.value = false;
    errorMsg.value = '';
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const submitRequest = async () => {
    if (!form.name.trim() || form.phone.trim().length < 7 || submitting.value) return;
    submitting.value = true;
    errorMsg.value = '';
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
            body: {
                name: form.name.trim(),
                email: user?.email || authStore.user?.email || '',
                phone: form.phone.trim(),
                plan: "Premium (29,000 so'm/oy)",
                userId: user?.id || authStore.user?.id,
            },
        });
        if (error) throw error;
        submitted.value = true;
    } catch (e: any) {
        console.error('premium request error:', e);
        errorMsg.value = "Yuborishda xatolik yuz berdi. Qayta urinib ko'ring.";
    }
    submitting.value = false;
};
</script>

<style scoped>
@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-rise {
    animation: rise 0.45s ease-out both;
}

@keyframes pop {
    0% {
        opacity: 0;
        transform: scale(0.9);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-pop {
    animation: pop 0.25s ease-out;
}

@keyframes pulseSlow {

    0%,
    100% {
        opacity: 0.5;
        transform: scale(1);
    }

    50% {
        opacity: 0.9;
        transform: scale(1.15);
    }
}

.animate-pulse-slow {
    animation: pulseSlow 3s ease-in-out infinite;
}

.modal-enter-active {
    transition: all 0.25s ease-out;
}

.modal-leave-active {
    transition: all 0.15s ease-in;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from>div,
.modal-leave-to>div {
    transform: scale(0.94) translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
</style>