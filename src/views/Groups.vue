<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 px-4 pt-6 pb-28">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink
          to="/"
          class="w-10 h-10 inline md:hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition">
          <ArrowLeft :size="18" />
        </RouterLink>
        <div>
          <h1
            class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span
              class="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-none">
              <Users :size="18" class="text-white" />
            </span>
            Guruhlar
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            O'qituvchi guruhiga qo'shiling yoki o'z guruhingizni yarating
          </p>
        </div>
      </div>

      <!-- Error banner + retry -->
      <div
        v-if="loadError"
        class="mb-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 px-4 py-3 flex items-center gap-3">
        <XCircle :size="18" class="text-red-500 flex-shrink-0" />
        <p class="text-xs font-bold text-red-600 flex-1">
          Ma'lumotlarni yuklashda xatolik yuz berdi. Internetni tekshirib, qayta
          urinib ko'ring.
        </p>
        <button
          @click="fetchAll"
          class="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-black hover:bg-red-600 active:scale-95 transition flex-shrink-0">
          Qayta urinish
        </button>
      </div>

      <!-- Guruhga qo'shilish -->
      <AppCard class="mb-4">
        <div class="flex items-start justify-between gap-3 mb-1">
          <div>
            <h2 class="font-black text-slate-900 dark:text-white mb-1">
              Guruhga qo'shilish
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              O'quvchi bo'lsangiz, o'qituvchi bergan kodni kiriting
            </p>
          </div>
          <RouterLink
            v-if="authStore.isTeacher"
            to="/teacher"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 text-xs font-black text-indigo-600 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
            <Users :size="14" /> Guruh yaratish
          </RouterLink>
        </div>
        <div class="flex gap-2 mt-4">
          <input
            v-model="joinCode"
            placeholder="Masalan: AB12"
            maxlength="4"
            class="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 transition" />
          <AppButton
            @click="joinGroup"
            :disabled="joinCode.length < 4"
            :loading="joining">
            Qo'shilish
          </AppButton>
        </div>
        <p
          v-if="joinError"
          class="text-red-500 text-xs mt-2 flex items-center gap-1">
          <XCircle :size="13" /> {{ joinError }}
        </p>
        <p
          v-if="joinSuccess"
          class="text-green-600 dark:text-green-400 text-xs mt-2 font-bold flex items-center gap-1 animate-pop">
          <CheckCircle :size="14" /> {{ joinSuccess }}
        </p>
      </AppCard>

      <!-- Guruh yaratish (o'qituvchi uchun) -->
      <AppCard v-if="authStore.isTeacher" class="mb-4">
        <div class="flex items-start gap-3">
          <div
            class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-100 dark:shadow-none">
            <UserPlus :size="20" class="text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-black text-slate-900 dark:text-white">
              Yangi guruh yarating
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
              Guruh nomini yozing — tizim avtomatik 4 xonali kod beradi,
              o'quvchilar shu kod bilan qo'shiladi.
            </p>
            <div class="flex gap-2">
              <input
                v-model="newGroupName"
                placeholder="Masalan: 8-A sinf matematika"
                maxlength="60"
                class="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition" />
              <AppButton
                variant="info"
                @click="createGroup"
                :disabled="!newGroupName.trim()"
                :loading="creating">
                Yaratish
              </AppButton>
            </div>
            <p
              v-if="createdGroupCode"
              class="mt-3 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800 px-4 py-3 flex items-center gap-3 animate-pop">
              <CheckCircle :size="18" class="text-green-500 flex-shrink-0" />
              <span
                class="text-xs font-bold text-green-700 dark:text-green-300 flex-1">
                Guruh yaratildi! Kod:
                <span class="font-black tracking-widest text-base">{{
                  createdGroupCode
                }}</span>
              </span>
              <button
                @click="copyCode"
                class="px-3 py-1.5 rounded-xl bg-green-500 text-white text-xs font-black hover:bg-green-600 active:scale-95 transition flex-shrink-0">
                Nusxa olish
              </button>
            </p>
          </div>
        </div>
      </AppCard>

      <!-- Mening guruhlarim -->
      <AppCard>
        <div class="mb-5 flex items-end justify-between">
          <div>
            <h2 class="font-black text-slate-900 dark:text-white">
              Mening guruhlarim
            </h2>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Siz qo'shilgan o'quv guruhlari
            </p>
          </div>
          <span
            class="rounded-xl bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 text-xs font-black text-orange-600 dark:text-orange-400"
            >{{ myGroups.length }} ta</span
          >
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="space-y-3">
          <div
            v-for="i in 2"
            :key="i"
            class="rounded-3xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 animate-pulse">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
              <div class="flex-1 space-y-2">
                <div
                  class="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div
                  class="h-3 w-1/2 bg-slate-100 dark:bg-slate-700/60 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else-if="myGroups.length === 0"
          :icon="Users"
          title="Hali guruhga qo'shilmadingiz"
          description="O'qituvchingiz bergan 4 xonali kodni yuqoridagi maydonga kiriting — guruh shu yerda paydo bo'ladi." />

        <div v-else class="space-y-4">
          <div
            v-for="group in myGroups"
            :key="group.id"
            class="group relative overflow-hidden rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-orange-950/30 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up">
            <div
              class="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-orange-100/70 dark:bg-orange-500/10"></div>
            <div class="relative flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none">
                  <Users :size="22" />
                </div>
                <div class="min-w-0">
                  <p class="truncate font-black text-slate-900 dark:text-white">
                    {{ group.groups?.name }}
                  </p>
                  <p
                    class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Siz ushbu guruh a'zosisiz
                  </p>
                </div>
              </div>
              <div
                class="shrink-0 rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-900 px-3 py-2 text-center shadow-sm">
                <p
                  class="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Guruh kodi
                </p>
                <p
                  class="mt-0.5 font-black tracking-[0.16em] text-orange-600 dark:text-orange-400">
                  {{ group.groups?.code }}
                </p>
              </div>
            </div>
            <button
              @click="leaveGroup(group.id)"
              class="relative mt-4 text-xs font-semibold text-red-400 transition hover:text-red-600">
              Guruhdan chiqish
            </button>
          </div>
        </div>
      </AppCard>

      <!-- Menga yuborilgan testlar -->
      <AppCard class="mt-4">
        <div class="mb-5 flex items-end justify-between">
          <div>
            <h2
              class="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList :size="20" class="text-orange-500" /> Menga
              yuborilgan testlar
            </h2>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Guruhingiz uchun tayyorlangan topshiriqlar
            </p>
          </div>
          <span
            class="rounded-xl bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-black text-slate-600 dark:text-slate-300"
            >{{ assignedTests.length }} ta</span
          >
        </div>

        <div v-if="loadingTests" class="space-y-3">
          <div
            v-for="i in 2"
            :key="i"
            class="rounded-3xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 animate-pulse">
            <div
              class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3"></div>
            <div
              class="h-5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>

        <EmptyState
          v-else-if="assignedTests.length === 0"
          :icon="Inbox"
          title="Hali test yuborilmagan"
          description="O'qituvchingiz guruhga test biriktirganda, uni shu yerda ko'rib, darhol yecha olasiz." />

        <div v-else class="space-y-4">
          <div
            v-for="item in assignedTests"
            :key="item.id"
            class="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md animate-fade-in-up">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="mb-2 flex items-center gap-2">
                  <span
                    class="rounded-lg bg-blue-100 dark:bg-blue-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:text-blue-300"
                    >{{ item.tests?.subject || "Fan" }}</span
                  ><span class="text-xs font-semibold text-slate-400"
                    >{{ item.tests?.questions?.length || 0 }} savol</span
                  >
                </div>
                <p
                  class="truncate font-black text-lg text-slate-900 dark:text-white">
                  {{ item.tests?.title }}
                </p>
                <p
                  class="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-500/20"
                    ><Users :size="12"
                  /></span>
                  {{ item.groups?.name }}
                </p>
              </div>
              <RouterLink
                :to="`/student-quiz?code=${item.tests?.code}`"
                class="shrink-0 px-4 py-3 bg-orange-500 text-white font-bold rounded-2xl text-sm shadow-sm shadow-orange-200 dark:shadow-none hover:bg-orange-600 active:scale-95 transition inline-flex items-center gap-1">
                Yechish <ArrowRight :size="14" />
              </RouterLink>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
    <OnboardingTooltip
      pageId="Groups"
      title="Guruhlar"
      description="O'qituvchi bergan kod bilan guruhga qo'shiling" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Users,
  CheckCircle,
  ClipboardList,
  Inbox,
  ArrowLeft,
  ArrowRight,
  XCircle,
  UserPlus,
} from "@lucide/vue";
import supabase from "../supabase";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";
import { useAuthStore } from "../stores/AuthStore";
import AppCard from "../components/ui/AppCard.vue";
import AppButton from "../components/ui/AppButton.vue";
import EmptyState from "../components/ui/EmptyState.vue";

const joinCode = ref("");
const joining = ref(false);
const joinError = ref("");
const joinSuccess = ref("");
const loading = ref(false);
const loadingTests = ref(false);
const loadError = ref(false);
const myGroups = ref<any[]>([]);
const assignedTests = ref<any[]>([]);
const newGroupName = ref("");
const creating = ref(false);
const createdGroupCode = ref("");
const authStore = useAuthStore();

const fetchAll = async () => {
  loadError.value = false;
  await Promise.all([fetchMyGroups(), fetchAssignedTests()]);
};

onMounted(fetchAll);

const fetchMyGroups = async () => {
  loading.value = true;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("group_members")
      .select("*, groups(name, code)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    myGroups.value = data || [];
  } catch (err) {
    console.error("Guruhlar yuklanmadi:", err);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

const fetchAssignedTests = async () => {
  loadingTests.value = true;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);
    if (memberError) throw memberError;

    if (!memberData || memberData.length === 0) {
      assignedTests.value = [];
      return;
    }

    const groupIds = memberData.map((m: any) => m.group_id);
    const { data, error } = await supabase
      .from("test_assignments")
      .select("*, tests(title, subject, questions, code), groups(name)")
      .in("group_id", groupIds)
      .order("assigned_at", { ascending: false });
    if (error) throw error;
    assignedTests.value = data || [];
  } catch (err) {
    console.error("Testlar yuklanmadi:", err);
    loadError.value = true;
  } finally {
    loadingTests.value = false;
  }
};

const joinGroup = async () => {
  joining.value = true;
  joinError.value = "";
  joinSuccess.value = "";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    joinError.value = "Avval tizimga kiring.";
    joining.value = false;
    return;
  }

  const { data, error } = await supabase.rpc("join_group_by_code", {
    join_code: joinCode.value,
  });

  const group = Array.isArray(data) ? data[0] : null;
  if (error || !group) {
    joinError.value = "Bunday kod topilmadi yoki guruhga qo'shib bo'lmadi.";
  } else {
    joinSuccess.value = `"${group.name}" guruhiga muvaffaqiyatli qo'shildingiz!`;
    joinCode.value = "";
    await fetchAll();
  }
  joining.value = false;
};

const createGroup = async () => {
  creating.value = true;
  createdGroupCode.value = "";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !newGroupName.value.trim()) {
    creating.value = false;
    return;
  }
  const code = Math.random().toString(36).slice(2, 6).toUpperCase();
  const { data, error } = await supabase
    .from("groups")
    .insert({
      teacher_id: user.id,
      name: newGroupName.value.trim(),
      code,
    })
    .select()
    .single();
  if (!error && data) {
    createdGroupCode.value = data.code;
    newGroupName.value = "";
    await fetchMyGroups();
  } else {
    joinError.value = "Guruh yaratishda xatolik. Qayta urinib ko'ring.";
  }
  creating.value = false;
};

const copyCode = () => {
  navigator.clipboard?.writeText(createdGroupCode.value);
};

const leaveGroup = async (memberId: string) => {
  await supabase.from("group_members").delete().eq("id", memberId);
  myGroups.value = myGroups.value.filter((g: any) => g.id !== memberId);
  await fetchAssignedTests();
};
</script>
