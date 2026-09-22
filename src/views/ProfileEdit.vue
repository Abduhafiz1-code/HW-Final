<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button
          @click="router.back()"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 transition">
          <ArrowLeft :size="18" />
        </button>
        <h1 class="text-xl font-black text-slate-900 dark:text-white">
          Profilni tahrirlash
        </h1>
      </div>

      <!-- Avatar -->
      <div class="flex flex-col items-center mb-8">
        <div class="relative inline-flex justify-center mb-3">
          <AvatarFrame
            :src="authStore.avatarUrl"
            :initial="
              authStore.displayName
                ? authStore.displayName[0].toUpperCase()
                : 'U'
            "
            :frame="authStore.avatarFrame"
            :size="96"
            class="shadow-xl shadow-orange-500/25" />
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onAvatarSelected" />
          <button
            @click="avatarInputRef?.click()"
            :disabled="uploadingAvatar"
            class="absolute bottom-0 right-1/2 -mr-10 w-8 h-8 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition disabled:opacity-50 z-20">
            <Loader v-if="uploadingAvatar" :size="14" class="animate-spin" />
            <Camera v-else :size="14" />
          </button>
        </div>
        <button
          @click="avatarInputRef?.click()"
          :disabled="uploadingAvatar"
          class="text-xs font-bold text-orange-500 hover:text-orange-600 transition">
          Rasmni almashtirish
        </button>
        <p v-if="avatarError" class="text-xs text-red-500 mt-2">
          {{ avatarError }}
        </p>
      </div>

      <!-- Orqa fon rasmi -->
      <div
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 mb-4">
        <h3
          class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <ImagePlus :size="14" /> Profil orqa foni
        </h3>
        <!-- Preview: hozirgi fon rasmi yoki placeholder -->
        <div
          class="relative h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-gradient-to-br from-orange-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-3">
          <img
            v-if="bgPreviewUrl || authStore.profileBgUrl"
            :src="bgPreviewUrl || authStore.profileBgUrl!"
            class="absolute inset-0 w-full h-full object-cover animate-fade-in" />
          <p v-else class="text-xs text-slate-400 font-bold">
            Hozircha fon rasmi yo'q
          </p>
          <input
            ref="bgInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onBgSelected" />
          <button
            v-if="bgPreviewUrl || authStore.profileBgUrl"
            @click="removeBg"
            :disabled="uploadingBg"
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition active:scale-95">
            <X :size="13" />
          </button>
        </div>
        <div class="flex gap-2">
          <button
            @click="bgInputRef?.click()"
            :disabled="uploadingBg"
            class="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-black hover:bg-slate-200 dark:hover:bg-white/10 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5">
            <Loader v-if="uploadingBg" :size="13" class="animate-spin" />
            <ImagePlus v-else :size="13" />
            {{
              uploadingBg
                ? "Yuklanmoqda..."
                : authStore.profileBgUrl
                  ? "Almashtirish"
                  : "Rasm tanlash"
            }}
          </button>
        </div>
        <p v-if="bgError" class="text-xs text-red-500 mt-2">{{ bgError }}</p>
        <p class="text-[11px] text-slate-400 mt-2 leading-relaxed">
          Bu rasm profilingiz tepasida chiroyli fon sifatida ko'rinadi (maks
          5MB).
        </p>
      </div>

      <!-- Form -->
      <div
        class="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-5 flex flex-col gap-4 mb-4">
        <div>
          <label
            class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block"
            >Ism familiya</label
          >
          <input
            v-model="name"
            placeholder="Ismingizni kiriting"
            class="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-orange-400 transition" />
        </div>

        <div>
          <label
            class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            placeholder="email@misol.com"
            class="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-orange-400 transition" />
          <p class="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            Email o'zgartirilsa, yangi manzilga tasdiqlash xati yuboriladi —
            havolani bosgach amalga oshadi.
          </p>
        </div>

        <div>
          <label
            class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block"
            >Telefon raqam</label
          >
          <input
            v-model="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            class="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-orange-400 transition" />
        </div>
      </div>

      <p
        v-if="message"
        class="text-xs font-semibold mb-3 px-1"
        :class="ok ? 'text-green-500' : 'text-red-500'">
        {{ message }}
      </p>

      <button
        @click="save"
        :disabled="saving"
        class="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white font-black text-sm rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
        <Loader v-if="saving" :size="16" class="animate-spin" />
        {{ saving ? "Saqlanmoqda..." : "Saqlash" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Camera, ImagePlus, Loader, X } from "@lucide/vue";
import { useAuthStore } from "../stores/AuthStore";
import supabase from "../supabase";
import AvatarFrame from "../components/AvatarFrame.vue";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const phone = ref("");
const saving = ref(false);
const message = ref("");
const ok = ref(false);

onMounted(() => {
  name.value = authStore.displayName || "";
  email.value = authStore.user?.email || "";
  phone.value = authStore.phone || "";
});

// Avatar upload
const avatarInputRef = ref<HTMLInputElement | null>(null);
const uploadingAvatar = ref(false);
const avatarError = ref("");

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

// ── Profil orqa fon rasmi (upload / o'chirish) ──
const bgInputRef = ref<HTMLInputElement | null>(null);
const uploadingBg = ref(false);
const bgError = ref("");
const bgPreviewUrl = ref<string | null>(null);

const onBgSelected = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  bgError.value = "";

  if (!file.type.startsWith("image/")) {
    bgError.value = "Faqat rasm fayl tanlang.";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    bgError.value = "Rasm hajmi 5MB dan oshmasligi kerak.";
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  uploadingBg.value = true;
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/bg.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars") // avatars bucket'ida public o'qish ruxsat — fon ham shu yerda
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      bgError.value = "Yuklashda xatolik. Iltimos qayta urinib ko'ring.";
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    const bustedUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
    bgPreviewUrl.value = bustedUrl;
    const res = await authStore.setProfileBg(bustedUrl);
    if (!res.ok) {
      bgPreviewUrl.value = null;
      bgError.value = res.error ? `Xatolik: ${res.error}` : "Fon saqlanmadi.";
    }
  } finally {
    uploadingBg.value = false;
    if (bgInputRef.value) bgInputRef.value.value = "";
  }
};

const removeBg = async () => {
  bgPreviewUrl.value = null;
  await authStore.setProfileBg(null);
};

const save = async () => {
  message.value = "";
  const cleanName = name.value.trim();
  if (cleanName.length < 2) {
    message.value = "Ism kamida 2 ta belgidan iborat bo'lishi kerak.";
    ok.value = false;
    return;
  }

  saving.value = true;
  try {
    const profileRes = await authStore.updateProfile(
      cleanName,
      undefined,
      phone.value.trim(),
    );
    if (!profileRes) {
      message.value = "Profilni saqlashda xatolik yuz berdi.";
      ok.value = false;
      return;
    }

    const cleanEmail = email.value.trim().toLowerCase();
    if (cleanEmail && cleanEmail !== authStore.user?.email) {
      const emailRes = await authStore.updateEmail(cleanEmail);
      if (!emailRes.ok) {
        message.value = `Ism va telefon saqlandi, lekin email: ${emailRes.error}`;
        ok.value = false;
        return;
      }
      message.value =
        "Saqlandi! Yangi emailni tasdiqlash uchun pochtangizni tekshiring.";
      ok.value = true;
      return;
    }

    message.value = "Muvaffaqiyatli saqlandi!";
    ok.value = true;
  } finally {
    saving.value = false;
  }
};
</script>
