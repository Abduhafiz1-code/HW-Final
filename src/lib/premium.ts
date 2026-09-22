import supabase from "../supabase";

// ── Premium holatini bir joydan olish (kesh bilan) ─────────────────────
const isPremium = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  // 5 daqiqalik kesh — sahifalar tez ochiladi, DB so'rovlari kamayadi
  const cache = (window as any).__premiumCache as { value: boolean; at: number } | undefined;
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache.value;
  const { data } = await supabase
    .from("profiles")
    .select("is_premium, premium_until")
    .eq("id", user.id)
    .single();
  const hasExpiry = Boolean(data?.premium_until);
  const activeByDate = hasExpiry
    ? new Date(data!.premium_until as string).getTime() > Date.now()
    : false;
  const flagPremium = Boolean(data?.is_premium);
  const value = hasExpiry ? activeByDate : flagPremium;
  (window as any).__premiumCache = { value, at: Date.now() };
  return value;
};

// ── Uy vazifasi skaner limiti: 5 ta/kun bepul, Premium = cheksiz ───────
export const HOMEWORK_DAILY_LIMIT = 5;

const getHomeworkTodayKey = () =>
  `homework_usage_${new Date().toISOString().split("T")[0]}`;

const getHomeworkUsage = (): number =>
  parseInt(localStorage.getItem(getHomeworkTodayKey()) || "0");

const incrementHomeworkUsage = () => {
  const key = getHomeworkTodayKey();
  localStorage.setItem(key, String(getHomeworkUsage() + 1));
  Object.keys(localStorage)
    .filter((k) => k.startsWith("homework_usage_") && k !== key)
    .forEach((k) => localStorage.removeItem(k));
};

export const checkHomeworkLimit = async (): Promise<{
  allowed: boolean;
  remaining: number;
  premium: boolean;
}> => {
  const premium = await isPremium();
  if (premium) return { allowed: true, remaining: Infinity, premium: true };
  const remaining = HOMEWORK_DAILY_LIMIT - getHomeworkUsage();
  return { allowed: remaining > 0, remaining, premium: false };
};

export const useHomeworkQuota = () => incrementHomeworkUsage();
