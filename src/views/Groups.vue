<template>
    <div class="min-h-screen bg-[#F7F9FC] px-4 pt-6 pb-28">
        <div class="max-w-2xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
                <RouterLink to="/"
                    class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                    ←
                </RouterLink>
                <div>
                    <h1 class="text-xl font-black text-slate-900">👥 Guruhlar</h1>
                    <p class="text-xs text-slate-500">O'qituvchi guruhiga qo'shiling</p>
                </div>
            </div>

            <!-- Guruhga qo'shilish -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-4">
                <h2 class="font-black text-slate-900 mb-1">Guruhga qo'shilish</h2>
                <p class="text-xs text-slate-500 mb-4">O'qituvchi bergan kodni kiriting</p>
                <div class="flex gap-2">
                    <input v-model="joinCode" placeholder="Masalan: AB12" maxlength="4"
                        class="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-orange-400" />
                    <button @click="joinGroup" :disabled="joinCode.length < 4 || joining"
                        class="px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm hover:bg-orange-600 transition disabled:opacity-50">
                        {{ joining ? '⏳' : 'Qo\'shilish' }}
                    </button>
                </div>
                <p v-if="joinError" class="text-red-500 text-xs mt-2">{{ joinError }}</p>
                <p v-if="joinSuccess" class="text-green-600 text-xs mt-2 font-bold">✅ {{ joinSuccess }}</p>
            </div>

            <!-- Mening guruhlarim -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h2 class="font-black text-slate-900 mb-4">Mening guruhlarim</h2>
                <div v-if="loading" class="text-center py-6 text-slate-400">⏳ Yuklanmoqda...</div>
                <div v-else-if="myGroups.length === 0" class="text-center py-6">
                    <div class="text-4xl mb-2">👥</div>
                    <p class="text-slate-400 text-sm">Hali hech qanday guruhga qo'shilmadingiz</p>
                </div>
                <div v-for="group in myGroups" :key="group.id"
                    class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
                    <div>
                        <p class="font-black text-slate-900">{{ group.groups?.name }}</p>
                        <p class="text-xs text-slate-500">Kod: <span
                                class="font-bold text-orange-500">{{ group.groups?.code }}</span></p>
                    </div>
                    <button @click="leaveGroup(group.id, group.group_id)"
                        class="text-xs text-red-400 hover:text-red-600 font-semibold transition">
                        Chiqish
                    </button>
                </div>
            </div>
            <!-- Menga yuborilgan testlar -->
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mt-4">
                <h2 class="font-black text-slate-900 mb-4">📋 Menga yuborilgan testlar</h2>
                <div v-if="loadingTests" class="text-center py-6 text-slate-400">⏳ Yuklanmoqda...</div>
                <div v-else-if="assignedTests.length === 0" class="text-center py-6">
                    <div class="text-4xl mb-2">📭</div>
                    <p class="text-slate-400 text-sm">Hali hech qanday test yuborilmagan</p>
                </div>
                <div v-for="item in assignedTests" :key="item.id"
                    class="bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-3">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-black text-slate-900">{{ item.tests?.title }}</p>
                            <p class="text-xs text-slate-500 mt-0.5">
                                {{ item.tests?.subject }} • {{ item.tests?.questions?.length }} savol
                            </p>
                            <p class="text-xs text-orange-500 font-bold mt-1">
                                👥 {{ item.groups?.name }}
                            </p>
                        </div>
                        <RouterLink :to="`/student-quiz?code=${item.tests?.code}`"
                            class="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition">
                            Yechish →
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import supabase from '../supabase';

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
    // joinGroup funksiyasida, fetchMyGroups() dan keyin:
    await fetchAssignedTests();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Kodni topish
    const { data: group } = await supabase
        .from('groups')
        .select('*')
        .eq('code', joinCode.value.toUpperCase())
        .single();

    if (!group) {
        joinError.value = 'Bunday kod topilmadi. Qayta tekshiring.';
        joining.value = false;
        return;
    }

    // Allaqachon qo'shilganmi
    const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        joinError.value = 'Siz allaqachon bu guruhda siz!';
        joining.value = false;
        return;
    }

    // Qo'shilish
    const { error } = await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: user.id,
    });

    if (error) {
        joinError.value = 'Xatolik yuz berdi.';
    } else {
        joinSuccess.value = `"${group.name}" guruhiga muvaffaqiyatli qo'shildingiz!`;
        joinCode.value = '';
        await fetchMyGroups();
    }
    joining.value = false;
};

const leaveGroup = async (memberId: string, groupId: string) => {
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