<template>
    <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
        <div class="max-w-2xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
                <RouterLink to="/"
                    class="w-10 h-10 inline md:hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition">
                    <ArrowLeft :size="18" />
                </RouterLink>
                <div>
                    <h1 class="text-xl font-black text-slate-900 flex items-center gap-2"><Users :size="22" class="text-orange-500" /> Guruhlar</h1>
                    <p class="text-xs text-slate-500">O'qituvchi guruhiga qo'shiling</p>
                </div>
            </div>

            <!-- Guruhga qo'shilish -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-4">
                <h2 class="font-black text-slate-900 mb-1">Guruhga qo'shilish</h2>
                <p class="text-xs text-slate-500 mb-4">O'qituvchi bergan kodni kiriting</p>
                <div class="flex gap-2">
                    <input v-model="joinCode" placeholder="Masalan: AB12" maxlength="4"
                        class="flex-1 w-[75%] px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-orange-400" />
                    <button @click="joinGroup" :disabled="joinCode.length < 4 || joining"
                        class="px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm hover:bg-orange-600 transition disabled:opacity-50">
                        <Loader v-if="joining" :size="16" class="animate-spin inline" /><span v-else>Add</span>
                    </button>
                </div>
                <p v-if="joinError" class="text-red-500 text-xs mt-2">{{ joinError }}</p>
                <p v-if="joinSuccess" class="text-green-600 text-xs mt-2 font-bold flex items-center gap-1"><CheckCircle :size="14" /> {{ joinSuccess }}</p>
            </div>

            <!-- Mening guruhlarim -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div class="mb-5 flex items-end justify-between"><div><h2 class="font-black text-slate-900">Mening guruhlarim</h2><p class="mt-1 text-xs text-slate-500">Siz qo'shilgan o'quv guruhlari</p></div><span class="rounded-xl bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-600">{{ myGroups.length }} ta</span></div>
                <div v-if="loading" class="text-center py-6 text-slate-400 flex items-center justify-center gap-2"><Loader :size="18" class="animate-spin" /> Yuklanmoqda...</div>
                <div v-else-if="myGroups.length === 0" class="text-center py-6">
                    <div class="mb-2 flex justify-center"><Users :size="36" class="text-slate-300" /></div>
                    <p class="text-slate-400 text-sm">Hali hech qanday guruhga qo'shilmadingiz</p>
                </div>
                <div v-for="group in myGroups" :key="group.id"
                    class="group relative mb-4 overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div class="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-orange-100/70"></div><div class="relative flex items-center justify-between gap-3"><div class="flex min-w-0 items-center gap-3"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-200"><Users :size="22" /></div><div class="min-w-0"><p class="truncate font-black text-slate-900">{{ group.groups?.name }}</p><p class="mt-1 text-xs font-medium text-slate-500">Siz ushbu guruh a'zosisiz</p></div></div><div class="shrink-0 rounded-2xl border border-orange-200 bg-white px-3 py-2 text-center shadow-sm"><p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Guruh kodi</p><p class="mt-0.5 font-black tracking-[0.16em] text-orange-600">{{ group.groups?.code }}</p></div></div>
                    <button @click="leaveGroup(group.id, group.group_id)"
                        class="relative mt-4 text-xs font-semibold text-red-400 transition hover:text-red-600">
                        Chiqish
                    </button>
                </div>
            </div>
            <!-- Menga yuborilgan testlar -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mt-4">
                <div class="mb-5 flex items-end justify-between"><div><h2 class="font-black text-slate-900 flex items-center gap-2"><ClipboardList :size="20" class="text-orange-500" /> Menga yuborilgan testlar</h2><p class="mt-1 text-xs text-slate-500">Guruhingiz uchun tayyorlangan topshiriqlar</p></div><span class="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{{ assignedTests.length }} ta</span></div>
                <div v-if="loadingTests" class="text-center py-6 text-slate-400 flex items-center justify-center gap-2"><Loader :size="18" class="animate-spin" /> Yuklanmoqda...</div>
                <div v-else-if="assignedTests.length === 0" class="text-center py-6">
                    <div class="mb-2 flex justify-center"><Inbox :size="36" class="text-slate-300" /></div>
                    <p class="text-slate-400 text-sm">Hali hech qanday test yuborilmagan</p>
                </div>
                <div v-for="item in assignedTests" :key="item.id"
                    class="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md">
                    <div class="flex items-start justify-between gap-3"><div class="min-w-0"><div class="mb-2 flex items-center gap-2"><span class="rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">{{ item.tests?.subject || 'Fan' }}</span><span class="text-xs font-semibold text-slate-400">{{ item.tests?.questions?.length || 0 }} savol</span></div><p class="truncate font-black text-lg text-slate-900">{{ item.tests?.title }}</p><p class="mt-2 text-xs font-bold text-orange-600 flex items-center gap-1"><span class="flex h-5 w-5 items-center justify-center rounded-md bg-orange-100"><Users :size="12" /></span> {{ item.groups?.name }}</p></div>
                        <RouterLink :to="`/student-quiz?code=${item.tests?.code}`"
                            class="shrink-0 px-4 py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm shadow-sm shadow-orange-200 hover:bg-orange-600 active:scale-95 transition inline-flex items-center gap-1">
                            Yechish <ArrowRight :size="14" />
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
        <OnboardingTooltip pageId="Groups" title="Guruhlar" description="O'qituvchi bergan kod bilan guruhga qo'shiling" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Users, Loader, CheckCircle, ClipboardList, Inbox, ArrowLeft, ArrowRight } from '@lucide/vue';
import supabase from '../supabase';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';


const joinCode = ref('');
const joining = ref(false);
const joinError = ref('');
const joinSuccess = ref('');
const loading = ref(false);
const myGroups = ref<any[]>([]);

onMounted(async () => {
    await fetchMyGroups();
    await fetchAssignedTests();
});

const fetchMyGroups = async () => {
    loading.value = true;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
        .from('group_members')
        .select('*, groups(name, code)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    myGroups.value = data || [];
    loading.value = false;
};

const joinGroup = async () => {
    joining.value = true;
    joinError.value = '';
    joinSuccess.value = '';
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        joinError.value = 'Avval tizimga kiring.';
        joining.value = false;
        return;
    }

    const { data, error } = await supabase.rpc('join_group_by_code', {
        join_code: joinCode.value,
    });

    const group = Array.isArray(data) ? data[0] : null;
    if (error || !group) {
        joinError.value = 'Bunday kod topilmadi yoki guruhga qo\'shib bo\'lmadi.';
    } else {
        joinSuccess.value = `"${group.name}" guruhiga muvaffaqiyatli qo'shildingiz!`;
        joinCode.value = '';
        await fetchMyGroups();
        await fetchAssignedTests();
    }
    joining.value = false;
};

const leaveGroup = async (memberId: string, _groupId: string) => {
    await supabase.from('group_members').delete().eq('id', memberId);
    myGroups.value = myGroups.value.filter((g: any) => g.id !== memberId);
};
const assignedTests = ref<any[]>([]);
const loadingTests = ref(false);

const fetchAssignedTests = async () => {
    loadingTests.value = true;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Avval o'quvchi qaysi guruhlarda ekanini topamiz
    const { data: memberData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

    if (!memberData || memberData.length === 0) {
        loadingTests.value = false;
        return;
    }

    const groupIds = memberData.map((m: any) => m.group_id);

    // O'sha guruhlarga yuborilgan testlarni olamiz
    const { data } = await supabase
        .from('test_assignments')
        .select('*, tests(title, subject, questions, code), groups(name)')
        .in('group_id', groupIds)
        .order('assigned_at', { ascending: false });

    assignedTests.value = data || [];
    loadingTests.value = false;
};
</script>
