import { defineStore } from "pinia";
import { ref, computed } from "vue";
import supabase from "../supabase";

const TEACHER_SECRET = "Socrati2026";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(null);
  const role = ref<"student" | "teacher">("student");
  const loading = ref(false);
  const error = ref("");
  const isPremium = ref(false);
  const aiUsageCount = ref(0);
  const coopUsageCount = ref(0);
  const premiumUntil = ref<string | null>(null);
  const avatarUrl = ref<string | null>(null);
  const avatarFrame = ref<string>("none");
  const ownedFrames = ref<string[]>(["none"]);

  const isLoggedIn = computed(() => !!user.value);
  const isTeacher = computed(() => role.value === "teacher");
  const displayName = computed(
    () =>
      user.value?.user_metadata?.full_name ||
      user.value?.email?.split("@")[0] ||
      "Do'stim",
  );
  const displayInitial = computed(() =>
    displayName.value.charAt(0).toUpperCase(),
  );
  const canUseAI = computed(() => isPremium.value || aiUsageCount.value < 11);
  const canUseCoop = computed(
    () => isPremium.value || coopUsageCount.value < 2,
  );

  const init = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    user.value = session?.user ?? null;
    if (user.value) {
      role.value = user.value.user_metadata?.role || "student";
      await syncProfile();
      aiUsageCount.value = user.value.user_metadata?.ai_usage || 0;
      coopUsageCount.value = user.value.user_metadata?.coop_usage || 0;
      subscribeToProfile();
    }
    supabase.auth.onAuthStateChange((_e, session) => {
      user.value = session?.user ?? null;
      if (user.value) {
        role.value = user.value.user_metadata?.role || "student";
        syncProfile();
        aiUsageCount.value = user.value.user_metadata?.ai_usage || 0;
        coopUsageCount.value = user.value.user_metadata?.coop_usage || 0;
        subscribeToProfile();
      }
    });
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    selectedRole: "student" | "teacher",
    teacherCode?: string,
  ) => {
    loading.value = true;
    error.value = "";
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    if (cleanName.length < 3) {
      error.value = "Ism familiya kamida 3 ta belgidan iborat bo'lishi kerak.";
      loading.value = false;
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      error.value = "Email manzil noto'g'ri.";
      loading.value = false;
      return false;
    }
    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      error.value =
        "Parol kamida 8 belgi, harf va raqamdan iborat bo'lishi kerak.";
      loading.value = false;
      return false;
    }
    if (selectedRole === "teacher" && teacherCode !== TEACHER_SECRET) {
      error.value = "Teacher kodi noto'g'ri!";
      loading.value = false;
      return false;
    }
    const { data, error: err } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role: selectedRole,
          is_premium: false,
          ai_usage: 0,
          coop_usage: 0,
        },
      },
    });
    if (err) {
      error.value = err.message;
    } else {
      user.value = data.user;
      // profiles jadvaliga ham role bilan birga yozamiz
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          role: selectedRole,
          is_premium: false,
        });
      }
    }
    loading.value = false;
    return !err;
  };

  const signIn = async (email: string, password: string) => {
    loading.value = true;
    error.value = "";
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !password) {
      error.value = "Email va parolni to'g'ri kiriting.";
      loading.value = false;
      return false;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (err) error.value = err.message;
    else {
      user.value = data.user;
      role.value = data.user?.user_metadata?.role || "student";
      await syncProfile();
      aiUsageCount.value = data.user?.user_metadata?.ai_usage || 0;
      coopUsageCount.value = data.user?.user_metadata?.coop_usage || 0;
    }
    loading.value = false;
    return !err;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    user.value = null;
  };

  // ✅ TUZATILDI: isPremium endi faqat BITTA, aniq mantiq bilan hisoblanadi
  const syncProfile = async () => {
    if (!user.value) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, is_premium, premium_until, avatar_url, avatar_frame, owned_frames")
      .eq("id", user.value.id)
      .maybeSingle();

    avatarUrl.value = data?.avatar_url ?? null;
    avatarFrame.value = data?.avatar_frame ?? "none";
    ownedFrames.value = data?.owned_frames?.length ? data.owned_frames : ["none"];

    const meta = user.value.user_metadata || {};
    role.value = (data?.role || meta.role || "student") as
      | "student"
      | "teacher";

    // profiles jadvali asosiy manba (har doim eng yangi), meta faqat fallback
    premiumUntil.value = data?.premium_until ?? meta.premium_until ?? null;

    // Bazadagi flag (is_premium) ham, sanaga asoslangan flag ham hisobga olinadi:
    // - Agar premium_until kelajakda bo'lsa -> premium FAOL
    // - Agar premium_until o'tib ketgan bo'lsa -> premium TUGAGAN (is_premium flag'dan qat'iy nazar)
    // - Agar premium_until umuman yo'q bo'lsa -> faqat is_premium flag'iga qaraladi (masalan, abadiy premium berilgan holatlar uchun)
    const hasExpiryDate = Boolean(premiumUntil.value);
    const activeByDate = hasExpiryDate
      ? new Date(premiumUntil.value as string).getTime() > Date.now()
      : false;
    const flagPremium = Boolean(data?.is_premium ?? meta.is_premium ?? false);

    isPremium.value = hasExpiryDate ? activeByDate : flagPremium;

    aiUsageCount.value = meta.ai_usage || 0;
    coopUsageCount.value = meta.coop_usage || 0;

    if (data?.full_name && data.full_name !== meta.full_name) {
      user.value = {
        ...user.value,
        user_metadata: {
          ...meta,
          full_name: data.full_name,
          role: role.value,
          is_premium: isPremium.value,
        },
      };
    }
  };

  // Bug fix: this used to default `avatarUrl` to "" and always upsert
  // `avatar_url: avatarUrl || null` — so simply editing your display name
  // (without touching your photo) silently wiped the avatar every time.
  // Now `newAvatarUrl` is optional: omit it to keep whatever avatar is
  // already saved; pass a value (or null) to explicitly change/remove it.
  const updateProfile = async (fullName: string, newAvatarUrl?: string | null) => {
    if (!user.value) return false;
    loading.value = true;
    error.value = "";
    const cleanName = fullName.trim();
    if (cleanName.length < 3) {
      error.value = "Ism familiya kamida 3 ta belgidan iborat bo'lishi kerak.";
      loading.value = false;
      return false;
    }
    const finalAvatarUrl = newAvatarUrl !== undefined ? newAvatarUrl : avatarUrl.value;
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.value.id,
      email: user.value.email,
      full_name: cleanName,
      avatar_url: finalAvatarUrl || null,
      role: role.value,
      is_premium: isPremium.value,
      premium_until: premiumUntil.value,
    });
    if (!profileError) avatarUrl.value = finalAvatarUrl || null;
    const { data, error: authError } = await supabase.auth.updateUser({
      data: { full_name: cleanName },
    });
    if (profileError || authError)
      error.value =
        profileError?.message || authError?.message || "Profil saqlanmadi.";
    if (data?.user) user.value = data.user;
    await syncProfile();
    loading.value = false;
    return !profileError && !authError;
  };

  // Faqat allaqachon egalik qilingan (yoki bepul) ramkani kiyish uchun —
  // olmos yechilmaydi.
  const setAvatarFrame = async (frame: string) => {
    if (!user.value) return { ok: false, error: "Tizimga kirilmagan." };
    const { error: err } = await supabase
      .from("profiles")
      .update({ avatar_frame: frame })
      .eq("id", user.value.id);
    if (!err) avatarFrame.value = frame;
    return { ok: !err, error: err?.message };
  };

  // Yangi ramkani birinchi marta sotib olib, darhol kiyib qo'yadi.
  // Diamond yechish User.vue tomonida (CoinStore orqali) amalga oshiriladi —
  // bu funksiya faqat "owned_frames" ro'yxatiga qo'shadi va kiydiradi.
  const unlockFrame = async (frame: string) => {
    if (!user.value) return { ok: false, error: "Tizimga kirilmagan." };
    const nextOwned = ownedFrames.value.includes(frame)
      ? ownedFrames.value
      : [...ownedFrames.value, frame];
    const { error: err } = await supabase
      .from("profiles")
      .update({ owned_frames: nextOwned, avatar_frame: frame })
      .eq("id", user.value.id);
    if (!err) {
      ownedFrames.value = nextOwned;
      avatarFrame.value = frame;
    }
    return { ok: !err, error: err?.message };
  };

  const incrementAIUsage = async () => {
    if (isPremium.value) return;
    aiUsageCount.value++;
    await supabase.auth.updateUser({ data: { ai_usage: aiUsageCount.value } });
  };

  const incrementCoopUsage = async () => {
    if (isPremium.value) return;
    coopUsageCount.value++;
    await supabase.auth.updateUser({
      data: { coop_usage: coopUsageCount.value },
    });
  };

  const activatePremium = async (plan: "monthly" | "yearly" = "monthly") => {
    if (!user.value) return;
    const until = new Date();
    until.setMonth(until.getMonth() + (plan === "yearly" ? 12 : 1));
    isPremium.value = true;
    premiumUntil.value = until.toISOString();
    await supabase.auth.updateUser({
      data: { is_premium: true, premium_until: premiumUntil.value },
    });
    await supabase.from("profiles").upsert({
      id: user.value.id,
      email: user.value.email,
      full_name: displayName.value,
      role: role.value,
      is_premium: true,
      premium_until: premiumUntil.value,
    });
    await supabase.from("subscriptions").insert({
      user_id: user.value.id,
      plan,
      status: "active",
      starts_at: new Date().toISOString(),
      ends_at: premiumUntil.value,
    });
  };

  let profileChannel: any = null;

  const subscribeToProfile = () => {
    if (!user.value) return;

    // ✅ eski kanal bo'lsa, avval uni olib tashlaymiz
    if (profileChannel) {
      supabase.removeChannel(profileChannel);
      profileChannel = null;
    }

    profileChannel = supabase
      .channel(`profile-${user.value.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.value.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          const newPremiumUntil = updated.premium_until || null;
          premiumUntil.value = newPremiumUntil;

          const hasExpiryDate = Boolean(newPremiumUntil);
          const activeByDate = hasExpiryDate
            ? new Date(newPremiumUntil).getTime() > Date.now()
            : false;
          isPremium.value = hasExpiryDate
            ? activeByDate
            : Boolean(updated.is_premium);
        },
      )
      .subscribe();
  };
  return {
    user,
    role,
    loading,
    error,
    isPremium,
    premiumUntil,
    aiUsageCount,
    coopUsageCount,
    avatarUrl,
    avatarFrame,
    ownedFrames,
    isLoggedIn,
    isTeacher,
    displayName,
    displayInitial,
    canUseAI,
    canUseCoop,
    init,
    syncProfile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    setAvatarFrame,
    unlockFrame,
    incrementAIUsage,
    incrementCoopUsage,
    activatePremium,
    subscribeToProfile,
  };
});
