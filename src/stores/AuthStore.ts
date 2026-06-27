import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import supabase from '../supabase';

const TEACHER_SECRET = 'EFE_Education2026';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const role = ref<'student' | 'teacher'>('student');
  const loading = ref(false);
  const error = ref('');
  const isPremium = ref(false);
  const aiUsageCount = ref(0);
  const coopUsageCount = ref(0);
  const premiumUntil = ref<string | null>(null);

  const isLoggedIn = computed(() => !!user.value);
  const isTeacher = computed(() => role.value === 'teacher');
  const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || "Do'stim");
  const displayInitial = computed(() => displayName.value.charAt(0).toUpperCase());
  const canUseAI = computed(() => isPremium.value || aiUsageCount.value < 3);
  const canUseCoop = computed(() => isPremium.value || coopUsageCount.value < 2);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    user.value = session?.user ?? null;
    if (user.value) {
      role.value = user.value.user_metadata?.role || 'student';
      await syncProfile();
      aiUsageCount.value = user.value.user_metadata?.ai_usage || 0;
      coopUsageCount.value = user.value.user_metadata?.coop_usage || 0;
    }
    supabase.auth.onAuthStateChange((_e, session) => {
      user.value = session?.user ?? null;
      if (user.value) {
        role.value = user.value.user_metadata?.role || 'student';
        syncProfile();
        aiUsageCount.value = user.value.user_metadata?.ai_usage || 0;
        coopUsageCount.value = user.value.user_metadata?.coop_usage || 0;
      }
    });
  };

  const signUp = async (email: string, password: string, fullName: string, selectedRole: 'student' | 'teacher', teacherCode?: string) => {
    loading.value = true; error.value = '';
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    if (cleanName.length < 3) {
      error.value = "Ism familiya kamida 3 ta belgidan iborat bo'lishi kerak."; loading.value = false; return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      error.value = "Email manzil noto'g'ri."; loading.value = false; return false;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      error.value = "Parol kamida 8 belgi, harf va raqamdan iborat bo'lishi kerak."; loading.value = false; return false;
    }
    if (selectedRole === 'teacher' && teacherCode !== TEACHER_SECRET) {
      error.value = "Teacher kodi noto'g'ri!"; loading.value = false; return false;
    }
    const { data, error: err } = await supabase.auth.signUp({
      email: cleanEmail, password,
      options: { data: { full_name: cleanName, role: selectedRole, is_premium: false, ai_usage: 0, coop_usage: 0 } }
    });
    if (err) error.value = err.message;
    else user.value = data.user;
    loading.value = false;
    return !err;
  };

  const signIn = async (email: string, password: string) => {
    loading.value = true; error.value = '';
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !password) {
      error.value = "Email va parolni to'g'ri kiriting."; loading.value = false; return false;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (err) error.value = err.message;
    else {
      user.value = data.user;
      role.value = data.user?.user_metadata?.role || 'student';
      await syncProfile();
      aiUsageCount.value = data.user?.user_metadata?.ai_usage || 0;
      coopUsageCount.value = data.user?.user_metadata?.coop_usage || 0;
    }
    loading.value = false;
    return !err;
  };

  const signOut = async () => { await supabase.auth.signOut(); user.value = null; };

  const syncProfile = async () => {
    if (!user.value) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role, is_premium, premium_until')
      .eq('id', user.value.id)
      .maybeSingle();

    const meta = user.value.user_metadata || {};
    role.value = (data?.role || meta.role || 'student') as 'student' | 'teacher';
    premiumUntil.value = data?.premium_until || meta.premium_until || null;
    const activeByDate = premiumUntil.value ? new Date(premiumUntil.value).getTime() > Date.now() : false;
    isPremium.value = Boolean(data?.is_premium || meta.is_premium || activeByDate);
    aiUsageCount.value = meta.ai_usage || 0;
    coopUsageCount.value = meta.coop_usage || 0;

    if (data?.full_name && data.full_name !== meta.full_name) {
      user.value = { ...user.value, user_metadata: { ...meta, full_name: data.full_name, role: role.value, is_premium: isPremium.value } };
    }
  };

  const updateProfile = async (fullName: string, avatarUrl = '') => {
    if (!user.value) return false;
    loading.value = true; error.value = '';
    const cleanName = fullName.trim();
    if (cleanName.length < 3) {
      error.value = "Ism familiya kamida 3 ta belgidan iborat bo'lishi kerak."; loading.value = false; return false;
    }
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.value.id,
      email: user.value.email,
      full_name: cleanName,
      avatar_url: avatarUrl || null,
      role: role.value,
      is_premium: isPremium.value,
      premium_until: premiumUntil.value,
    });
    const { data, error: authError } = await supabase.auth.updateUser({ data: { full_name: cleanName } });
    if (profileError || authError) error.value = profileError?.message || authError?.message || "Profil saqlanmadi.";
    if (data?.user) user.value = data.user;
    await syncProfile();
    loading.value = false;
    return !profileError && !authError;
  };

  const incrementAIUsage = async () => {
    if (isPremium.value) return;
    aiUsageCount.value++;
    await supabase.auth.updateUser({ data: { ai_usage: aiUsageCount.value } });
  };

  const incrementCoopUsage = async () => {
    if (isPremium.value) return;
    coopUsageCount.value++;
    await supabase.auth.updateUser({ data: { coop_usage: coopUsageCount.value } });
  };

  const activatePremium = async (plan: 'monthly' | 'yearly' = 'monthly') => {
    if (!user.value) return;
    const until = new Date();
    until.setMonth(until.getMonth() + (plan === 'yearly' ? 12 : 1));
    isPremium.value = true;
    premiumUntil.value = until.toISOString();
    await supabase.auth.updateUser({ data: { is_premium: true, premium_until: premiumUntil.value } });
    await supabase.from('profiles').upsert({
      id: user.value.id,
      email: user.value.email,
      full_name: displayName.value,
      role: role.value,
      is_premium: true,
      premium_until: premiumUntil.value,
    });
    await supabase.from('subscriptions').insert({
      user_id: user.value.id,
      plan,
      status: 'active',
      starts_at: new Date().toISOString(),
      ends_at: premiumUntil.value,
    });
  };

  return { user, role, loading, error, isPremium, premiumUntil, aiUsageCount, coopUsageCount, isLoggedIn, isTeacher, displayName, displayInitial, canUseAI, canUseCoop, init, syncProfile, signUp, signIn, signOut, updateProfile, incrementAIUsage, incrementCoopUsage, activatePremium };
});
