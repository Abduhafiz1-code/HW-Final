<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white px-4 pt-6 pb-28 transition-colors duration-300">
    <div class="max-w-lg mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6 mt-2">
        <button
          @click="router.back()"
          class="w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 transition">
          <ArrowLeft :size="18" />
        </button>
        <h1 class="text-xl font-black">Sozlamalar</h1>
      </div>

      <!-- Profilni tahrirlash -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User :size="18" class="text-orange-500" /> Profilni tahrirlash
        </h3>

        <!-- Avatar -->
        <div class="flex justify-center mb-2 mt-26">
          <div class="relative inline-flex">
            <AvatarFrame
              :src="authStore.avatarUrl"
              :initial="
                authStore.displayName
                  ? authStore.displayName[0].toUpperCase()
                  : 'U'
              "
              :frame="authStore.avatarFrame"
              :size="88"
              class="shadow-lg shadow-orange-500/20" />
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onAvatarSelected" />
            <button
              @click="avatarInputRef?.click()"
              :disabled="uploadingAvatar"
              class="absolute bottom-0 right-0 w-24 h-24 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition disabled:opacity-50">
              <Loader v-if="uploadingAvatar" :size="14" class="animate-spin" />
              <Camera v-else :size="14" />
            </button>
          </div>
        </div>
        <p
          v-if="avatarError"
          class="text-xs text-red-500 text-center -mt-3 mb-3">
          {{ avatarError }}
        </p>

        <!-- Name -->
        <div class="mb-4">
          <label
            class="text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-wide"
            >Ism</label
          >
          <input
            v-model="form.name"
            type="text"
            placeholder="Ismingiz"
            class="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-400 transition" />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label
            class="text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-wide"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            class="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-400 transition" />
          <p class="text-[11px] text-slate-400 dark:text-white/40 mt-1">
            Email o'zgartirilsa, tasdiqlash xati yuboriladi.
          </p>
        </div>

        <!-- Phone -->
        <div class="mb-5">
          <label
            class="text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-wide"
            >Telefon raqam</label
          >
          <input
            v-model="form.phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            class="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-400 transition" />
        </div>

        <p v-if="profileError" class="text-xs text-red-500 mb-3">
          {{ profileError }}
        </p>
        <p
          v-if="profileSaved"
          class="text-xs text-green-500 mb-3 flex items-center gap-1">
          <Check :size="12" /> Saqlandi
        </p>

        <button
          @click="saveProfile"
          :disabled="savingProfile"
          class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
          <Loader v-if="savingProfile" :size="16" class="animate-spin" />
          Saqlash
        </button>
      </section>

      <!-- Ko'rinish -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Palette :size="18" class="text-indigo-500" /> Ko'rinish
        </h3>
        <button
          @click="toggleDarkMode"
          class="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl transition">
          <span
            class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
            <Moon v-if="!isDark" :size="18" class="text-slate-400" />
            <Sun v-else :size="18" class="text-amber-400" />
            {{ isDark ? "Yorug' rejim" : "Tungi rejim" }}
          </span>
          <span
            class="relative inline-flex h-6 w-11 items-center rounded-full transition"
            :class="isDark ? 'bg-orange-500' : 'bg-slate-300'">
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              :class="isDark ? 'translate-x-6' : 'translate-x-1'" />
          </span>
        </button>
      </section>

      <!-- Bildirishnomalar -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell :size="18" class="text-purple-500" /> Bildirishnomalar
        </h3>
        <button
          @click="toggleNotifications"
          class="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl transition">
          <span class="font-bold text-slate-700 dark:text-white/80 text-sm"
            >Push bildirishnomalar</span
          >
          <span
            class="relative inline-flex h-6 w-11 items-center rounded-full transition"
            :class="notificationsEnabled ? 'bg-orange-500' : 'bg-slate-300'">
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              :class="
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              " />
          </span>
        </button>
      </section>

      <!-- Xavfsizlik -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4 shadow-sm dark:shadow-none">
        <h3
          class="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock :size="18" class="text-slate-500" /> Xavfsizlik
        </h3>
        <div v-if="!showPasswordForm">
          <button
            @click="showPasswordForm = true"
            class="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition">
            <span class="font-bold text-slate-700 dark:text-white/80 text-sm"
              >Parolni almashtirish</span
            >
            <ChevronRight :size="16" class="text-slate-300" />
          </button>
        </div>
        <div v-else class="space-y-3">
          <input
            v-model="newPassword"
            type="password"
            placeholder="Yangi parol (kamida 6 belgi)"
            class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-400 transition text-sm" />
          <p v-if="passwordError" class="text-xs text-red-500">
            {{ passwordError }}
          </p>
          <p
            v-if="passwordSaved"
            class="text-xs text-green-500 flex items-center gap-1">
            <Check :size="12" /> Parol yangilandi
          </p>
          <div class="flex gap-2">
            <button
              @click="changePassword"
              :disabled="savingPassword"
              class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50">
              Saqlash
            </button>
            <button
              @click="
                showPasswordForm = false;
                newPassword = '';
                passwordError = '';
              "
              class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white/70 font-bold rounded-xl text-sm transition">
              Bekor qilish
            </button>
          </div>
        </div>
      </section>

      <!-- Fikr bildirish -->
      <RouterLink
        to="/feedback"
        class="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-4 hover:bg-slate-50 dark:hover:bg-white/10 transition text-left block">
        <span
          class="font-bold text-slate-700 dark:text-white/80 flex items-center gap-3 text-sm">
          <MessageSquareText :size="18" class="text-sky-500" /> Fikr bildirish
        </span>
        <ChevronRight :size="18" class="text-slate-300 dark:text-white/30" />
      </RouterLink>

      <!-- Xavfli zona -->
      <section
        class="bg-white dark:bg-white/5 rounded-3xl border border-red-200 dark:border-red-500/20 p-5 mb-4">
        <h3 class="font-black text-red-500 mb-4 flex items-center gap-2">
          <AlertTriangle :size="18" /> Xavfli zona
        </h3>
        <button
          @click="showDeleteModal = true"
          class="w-full py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition flex items-center justify-center gap-2">
          <Trash2 :size="16" /> Hisobni o'chirish
        </button>
      </section>

      <!-- Sign Out -->
      <button
        @click="handleSignOut"
        class="w-full py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-white/70 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center justify-center gap-2">
        <LogOut :size="18" /> Chiqish
      </button>
    </div>

    <!-- Delete Account Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      @click.self="showDeleteModal = false">
      <div
        class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-red-200 dark:border-red-500/20">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-500">
            <AlertTriangle :size="20" />
          </div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white">
            Hisobni o'chirish
          </h2>
        </div>
        <p class="text-sm text-slate-600 dark:text-white/70 mb-4">
          Bu amalni ortga qaytarib bo'lmaydi. Barcha ma'lumotlaringiz, test
          natijalaringiz va olmoslaringiz butunlay o'chiriladi.
        </p>
        <p v-if="deleteError" class="text-xs text-red-500 mb-3">
          {{ deleteError }}
        </p>
        <div class="flex gap-2">
          <button
            @click="confirmDeleteAccount"
            :disabled="deletingAccount"
            class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
            <Loader v-if="deletingAccount" :size="14" class="animate-spin" />
            Ha, o'chirish
          </button>
          <button
            @click="showDeleteModal = false"
            class="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-sm transition">
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import {
  ArrowLeft,
  User,
  Camera,
  Loader,
  Check,
  Palette,
  Moon,
  Sun,
  Bell,
  Lock,
  ChevronRight,
  MessageSquareText,
  AlertTriangle,
  Trash2,
  LogOut,
} from "@lucide/vue";
import { useAuthStore } from "../stores/AuthStore";
import supabase from "../supabase";

const router = useRouter();
const authStore = useAuthStore();

// ---------- Profil formasi ----------
const form = reactive({
  name: authStore.displayName || "",
  email: authStore.user?.email || "",
  phone: authStore.phone || "", // AuthStore'ga `phone` maydoni qo'shilishi kerak
});

const avatarInputRef = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref(false);
const avatarError = ref("");
const savingProfile = ref(false);
const profileError = ref("");
const profileSaved = ref(false);

const onAvatarSelected = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  avatarError.value = "";

  if (!file.type.startsWith("image/")) {
    avatarError.value = "Faqat rasm fayl tanlang.";
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    avatarError.value = "Rasm hajmi 3MB dan oshmasligi kerak.";
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  uploadingAvatar.value = true;
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      avatarError.value =
        "Yuklashda xatolik. Supabase'da 'avatars' bucket sozlanganini tekshiring.";
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    const bustedUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    await authStore.updateProfile(authStore.displayName, bustedUrl);
  } finally {
    uploadingAvatar.value = false;
    if (avatarInputRef.value) avatarInputRef.value.value = "";
  }
};

const saveProfile = async () => {
  profileError.value = "";
  profileSaved.value = false;

  if (!form.name.trim() || form.name.trim().length < 2) {
    profileError.value = "Ism kamida 2 ta belgidan iborat bo'lishi kerak.";
    return;
  }

  savingProfile.value = true;
  try {
    // Ism va telefon — profiles jadvaliga
    await authStore.updateProfile(
      form.name.trim(),
      authStore.avatarUrl,
      form.phone.trim(),
    );

    // Email o'zgargan bo'lsa — Supabase Auth orqali (tasdiqlash xati yuboriladi)
    if (form.email.trim() && form.email.trim() !== authStore.user?.email) {
      const { error } = await supabase.auth.updateUser({
        email: form.email.trim(),
      });
      if (error) {
        profileError.value = `Email yangilashda xatolik: ${error.message}`;
        return;
      }
    }

    profileSaved.value = true;
    setTimeout(() => (profileSaved.value = false), 2500);
  } catch (err: any) {
    profileError.value = err?.message || "Saqlashda xatolik yuz berdi.";
  } finally {
    savingProfile.value = false;
  }
};

// ---------- Tema ----------
const isDark = ref(document.documentElement.classList.contains("dark"));
const toggleDarkMode = () => {
  document.documentElement.classList.toggle("dark");
  isDark.value = document.documentElement.classList.contains("dark");
  localStorage.setItem("darkMode", isDark.value ? "true" : "false");
};

// ---------- Bildirishnomalar ----------
const notificationsEnabled = ref(
  localStorage.getItem("notificationsEnabled") !== "false",
);
const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value;
  localStorage.setItem(
    "notificationsEnabled",
    String(notificationsEnabled.value),
  );
};

// ---------- Parol ----------
const showPasswordForm = ref(false);
const newPassword = ref("");
const savingPassword = ref(false);
const passwordError = ref("");
const passwordSaved = ref(false);

const changePassword = async () => {
  passwordError.value = "";
  passwordSaved.value = false;
  if (newPassword.value.length < 6) {
    passwordError.value = "Parol kamida 6 ta belgidan iborat bo'lishi kerak.";
    return;
  }
  savingPassword.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    });
    if (error) {
      passwordError.value = error.message;
      return;
    }
    passwordSaved.value = true;
    newPassword.value = "";
    setTimeout(() => {
      passwordSaved.value = false;
      showPasswordForm.value = false;
    }, 2000);
  } finally {
    savingPassword.value = false;
  }
};

// ---------- Hisobni o'chirish ----------
const showDeleteModal = ref(false);
const deletingAccount = ref(false);
const deleteError = ref("");

const confirmDeleteAccount = async () => {
  deleteError.value = "";
  deletingAccount.value = true;
  try {
    // ESLATMA: auth.users'ni o'chirish uchun service-role kalit kerak,
    // shuning uchun bu Supabase Edge Function orqali bajarilishi kerak.
    // Edge function nomi: "delete-account" (o'zingiz yaratishingiz kerak).
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) {
      deleteError.value =
        "Hisobni o'chirishda xatolik. Iltimos qayta urinib ko'ring yoki qo'llab-quvvatlash bilan bog'laning.";
      return;
    }
    await authStore.signOut();
    router.push("/login");
  } catch {
    deleteError.value = "Hisobni o'chirishda xatolik yuz berdi.";
  } finally {
    deletingAccount.value = false;
    showDeleteModal.value = false;
  }
};

// ---------- Chiqish ----------
const handleSignOut = async () => {
  await authStore.signOut();
  router.push("/login");
};

onMounted(() => {
  form.name = authStore.displayName || "";
  form.email = authStore.user?.email || "";
  form.phone = authStore.phone || "";
});
</script>
