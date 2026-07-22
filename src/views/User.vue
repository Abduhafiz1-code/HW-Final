<template>
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900
                text-slate-900 dark:text-white px-4 pt-6 pb-28 transition-colors duration-300">
        <div class="max-w-lg mx-auto">

            <!-- Profile Header -->
            <div class="text-center mb-10 mt-4">
                <div class="relative inline-flex justify-center mb-4 w-full">
                    <AvatarFrame :src="authStore.avatarUrl" :initial="authStore.displayName ? authStore.displayName[0].toUpperCase() : 'U'"
                        :frame="authStore.avatarFrame" :size="96" class="shadow-xl shadow-orange-500/25" />
                    <input ref="avatarInputRef" type="file" accept="image/*" class="hidden" @change="onAvatarSelected" />
                    <button @click="avatarInputRef?.click()" :disabled="uploadingAvatar"
                        class="absolute bottom-0 right-1/2 -mr-10 w-8 h-8 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition disabled:opacity-50 z-20">
                        <Loader v-if="uploadingAvatar" :size="14" class="animate-spin" />
                        <Camera v-else :size="14" />
                    </button>
                </div>
                <p v-if="avatarError" class="text-xs text-red-500 -mt-2 mb-2">{{ avatarError }}</p>

                <!-- Inline name editing -->
                <div v-if="editingName" class="flex items-center justify-center gap-2 mb-1">
                    <input v-model="editNameValue" ref="nameInputRef" @keyup.enter="saveNameEdit"
                        @keyup.escape="cancelNameEdit" placeholder="Ismingizni kiriting"
                        class="px-3 py-1.5 rounded-xl border-2 border-orange-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-black text-center focus:outline-none focus:border-orange-500 transition w-48" />
                    <button @click="saveNameEdit"
                        class="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition">
                        <Check :size="16" />
                    </button>
                    <button @click="cancelNameEdit"
                        class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white/70 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                        <X :size="16" />
                    </button>
                </div>
                <h2 v-else class="text-xl font-black">{{ authStore.displayName || 'Foydalanuvchi' }}</h2>

                <p class="text-sm text-slate-500 dark:text-white/60">{{ authStore.user?.email }}</p>
                <div v-if="isPremium"
                    class="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <Crown :size="12" /> Premium
                </div>
            </div>

            <!-- Quiz Summary -->
            <div
                class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
                <h3 class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 :size="18" class="text-orange-500" /> Test natijalari
                </h3>
                <div class="flex justify-around text-center">
                    <div>
                        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.total }}</p>
                        <p class="text-xs text-slate-500 dark:text-white/60">Jami testlar</p>
                    </div>
                    <div>
                        <p class="text-2xl font-black text-green-600 dark:text-green-400">{{ stats.best }}%</p>
                        <p class="text-xs text-slate-500 dark:text-white/60">Eng yaxshi</p>
                    </div>
                    <div>
                        <p class="text-2xl font-black text-orange-500">{{ stats.avg }}%</p>
                        <p class="text-xs text-slate-500 dark:text-white/60">O'rtacha</p>
                    </div>
                </div>
            </div>

            <!-- Profil ramkalari (olmosga sotib olinadi) -->
            <div
                class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles :size="18" class="text-purple-500" /> Profil ramkalari
                    </h3>
                    <span class="flex items-center gap-1 text-cyan-500 font-black text-xs">
                        <Gem :size="14" /> {{ coinStore.diamonds }}
                    </span>
                </div>
                <div class="grid grid-cols-4 gap-4">
                    <button v-for="f in FRAME_CATALOG" :key="f.key" @click="selectFrame(f.key)"
                        class="flex flex-col items-center gap-1.5 group">
                        <AvatarFrame :src="authStore.avatarUrl" :initial="authStore.displayName ? authStore.displayName[0].toUpperCase() : 'U'"
                            :frame="f.key" :size="48"
                            :class="authStore.avatarFrame === f.key ? 'ring-2 ring-offset-2 ring-orange-400 dark:ring-offset-slate-800 rounded-full' : 'opacity-75 group-hover:opacity-100 transition'" />
                        <span class="text-[9px] font-bold text-slate-400 text-center leading-tight">{{ f.label }}</span>
                        <span v-if="authStore.avatarFrame === f.key" class="text-[10px] font-black text-green-500">Faol</span>
                        <span v-else-if="f.cost === 0 || authStore.ownedFrames.includes(f.key)"
                            class="text-[10px] font-black text-slate-400">{{ f.cost === 0 ? 'Bepul' : 'Sizniki' }}</span>
                        <span v-else class="text-[10px] font-black text-cyan-500 flex items-center gap-0.5">
                            <Gem :size="10" /> {{ f.cost }}
                        </span>
                    </button>
                </div>
                <p v-if="frameError" class="text-xs text-red-500 mt-3">{{ frameError }}</p>
            </div>

            <!-- Settings Items -->
            <div class="space-y-2 mb-6">
                <button @click="startNameEdit" class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10
                 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left">
                    <span class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
                        <User :size="18" class="text-slate-400" /> Profilni tahrirlash
                    </span>
                    <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
                </button>
                <button @click="toggleDarkMode" class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10
                 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left">
                    <span class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
                        <Moon v-if="!isDark" :size="18" class="text-slate-400" />
                        <Sun v-else :size="18" class="text-amber-400" />
                        {{ isDark ? 'Yorug\' rejim' : 'Tungi rejim' }}
                    </span>
                    <span class="text-slate-300">
                        <Sun v-if="!isDark" :size="16" class="text-slate-400" />
                        <Moon v-else :size="16" class="text-indigo-500" />
                    </span>
                </button>
                <RouterLink to="/premium"
                    class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10
               rounded-2xl border border-amber-200 dark:border-amber-500/20 hover:shadow-md transition text-left block">
                    <span class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
                        <Crown :size="18" class="text-amber-500" /> Premium
                    </span>
                    <span class="text-amber-500 font-bold text-xs flex items-center gap-1">
                        <Crown :size="14" />
                    </span>
                </RouterLink>

                <!-- Ilova haqida -->
                <button @click="showAboutModal = true" class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10
                 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left">
                    <span class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
                        <Info :size="18" class="text-slate-400" /> Ilova haqida
                    </span>
                    <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
                </button>
            </div>

            <!-- Sign Out -->
            <button @click="handleSignOut" class="w-full py-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 font-bold text-sm
               hover:bg-red-100 dark:hover:bg-red-500/20 transition flex items-center justify-center gap-2">
                <LogOut :size="18" /> Chiqish
            </button>
        </div>

        <!-- About Modal -->
        <div v-if="showAboutModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            @click.self="showAboutModal = false">
            <div
                class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-slate-200 dark:border-white/10">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Info :size="22" class="text-orange-500" /> Ilova haqida
                    </h2>
                    <button @click="showAboutModal = false"
                        class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                        <X :size="16" />
                    </button>
                </div>
                <div class="space-y-4 text-sm">
                    <div
                        class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
                        <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Ilova
                            nomi</p>
                        <p class="font-black text-slate-900 dark:text-white text-lg mt-0.5">Socrati</p>
                    </div>
                    <div
                        class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
                        <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Versiya
                        </p>
                        <p class="font-black text-slate-900 dark:text-white text-lg mt-0.5">2.0.0</p>
                    </div>
                    <div
                        class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
                        <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Tavsif
                        </p>
                        <p class="text-slate-700 dark:text-white/80 mt-1 leading-relaxed">This app helps students with
                            homework, quizzes, and games</p>
                    </div>
                    <div
                        class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
                        <p class="text-xs text-slate-400 dark:text-white/50 uppercase font-bold tracking-wide">Dasturchi
                        </p>
                        <p class="font-bold text-slate-900 dark:text-white mt-0.5">Abduhafiz Qodirov</p>
                        <p class="text-xs text-slate-500 dark:text-white/60 mt-0.5">Qo'qon, O'zbekiston</p>
                        <p class="text-xs text-slate-500 dark:text-white/60">Full-stack dasturchi & AI muhandisi</p>
                    </div>
                    <a href="mailto:abduhafiznazarov@gmail.com"
                        class="block w-full py-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl text-orange-600 dark:text-orange-400 font-bold text-sm text-center hover:bg-orange-100 dark:hover:bg-orange-500/20 transition flex items-center justify-center gap-2">
                        <Mail :size="16" /> qodirovabduhafiz1@gmail.com
                    </a>
                </div>
                <button @click="showAboutModal = false"
                    class="w-full mt-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                    Yopish
                </button>
            </div>
        </div>

        <!-- Onboarding Tooltip -->
        <OnboardingTooltip pageId="User" title="Profil" description="Shaxsiy profil va sozlamalar" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { User, BarChart3, LogOut, Moon, Sun, Crown, Info, Mail, Check, X, ChevronRight, Camera, Loader, Sparkles, Gem } from '@lucide/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/AuthStore';
import { useCoinStore } from '../stores/CoinStore';
import supabase from '../supabase';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';
import AvatarFrame from '../components/AvatarFrame.vue';
import { FRAME_CATALOG, frameCost } from '../lib/frames';

const router = useRouter();
const authStore = useAuthStore();
const coinStore = useCoinStore();
// Bug fix: this used to be hardcoded to `ref(true)`, so every user — even
// non-premium ones — saw the Premium badge and never the upsell button.
// Now it reflects the real auth state.
const isPremium = computed(() => authStore.isPremium);
const stats = ref({ total: 0, best: 0, avg: 0 });
const isDark = ref(document.documentElement.classList.contains('dark'));
const showAboutModal = ref(false);

// Inline name editing
const editingName = ref(false);
const editNameValue = ref('');
const nameInputRef = ref<HTMLInputElement | null>(null);

// Avatar upload
const avatarInputRef = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref(false);
const avatarError = ref('');

const onAvatarSelected = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    avatarError.value = '';

    if (!file.type.startsWith('image/')) {
        avatarError.value = 'Faqat rasm fayl tanlang.';
        return;
    }
    if (file.size > 3 * 1024 * 1024) {
        avatarError.value = 'Rasm hajmi 3MB dan oshmasligi kerak.';
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    uploadingAvatar.value = true;
    try {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true, cacheControl: '3600' });

        if (uploadError) {
            avatarError.value = "Yuklashda xatolik. Supabase'da 'avatars' bucket sozlanganini tekshiring.";
            return;
        }

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
        // Cache-bust so the new photo shows immediately even though the path is unchanged
        const bustedUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
        await authStore.updateProfile(authStore.displayName, bustedUrl);
    } finally {
        uploadingAvatar.value = false;
        if (avatarInputRef.value) avatarInputRef.value.value = '';
    }
};

onMounted(() => {
    loadStats();
    coinStore.fetchCoins();
});

// Profil ramkalari — bir marta olmosga sotib olinadi, keyin bepul kiyiladi
const frameError = ref('');

const selectFrame = async (key: string) => {
    frameError.value = '';
    if (authStore.avatarFrame === key) return;

    const alreadyOwned = authStore.ownedFrames.includes(key);
    const cost = frameCost(key);

    // Egalik qilingan (yoki bepul) ramkani kiyish — olmos yechilmaydi
    if (alreadyOwned || cost === 0) {
        const res = await authStore.setAvatarFrame(key);
        if (!res.ok) frameError.value = res.error ? `Xatolik: ${res.error}` : 'Ramkani saqlashda xatolik yuz berdi.';
        return;
    }

    // Yangi ramka — sotib olish kerak
    if (coinStore.diamonds < cost) {
        frameError.value = `Bu ramka uchun ${cost} olmos kerak.`;
        return;
    }

    const res = await authStore.unlockFrame(key);
    if (!res.ok) {
        frameError.value = res.error ? `Xatolik: ${res.error}` : 'Ramkani saqlashda xatolik yuz berdi.';
        return;
    }

    const newDiamonds = coinStore.diamonds - cost;
    coinStore.diamonds = newDiamonds;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('coins').update({ diamonds: newDiamonds }).eq('user_id', user.id);
    }
};

const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
        .from('test_results')
        .select('percent')
        .eq('user_id', user.id);
    if (data && data.length > 0) {
        stats.value.total = data.length;
        stats.value.best = Math.max(...data.map((d: any) => d.percent));
        stats.value.avg = Math.round(data.reduce((s: number, d: any) => s + d.percent, 0) / data.length);
    }
};

const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    isDark.value = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark.value ? 'true' : 'false');
};

const handleSignOut = async () => {
    await authStore.signOut();
    router.push('/login');
};

// Name editing
const startNameEdit = () => {
    editNameValue.value = authStore.displayName || '';
    editingName.value = true;
    nextTick(() => {
        nameInputRef.value?.focus();
        nameInputRef.value?.select();
    });
};

const saveNameEdit = async () => {
    const name = editNameValue.value.trim();
    if (!name || name.length < 2) return;
    await authStore.updateProfile(name);
    editingName.value = false;
};

const cancelNameEdit = () => {
    editingName.value = false;
    editNameValue.value = '';
};
</script>