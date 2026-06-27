import supabase from "../supabase";

const AI_DAILY_LIMIT = 5;

const getTodayKey = () => {
  const today = new Date().toISOString().split("T")[0]; // "2026-06-27"
  return `ai_usage_${today}`;
};

const getUsageCount = (): number => {
  const key = getTodayKey();
  return parseInt(localStorage.getItem(key) || "0");
};

const incrementUsage = () => {
  const key = getTodayKey();
  const current = getUsageCount();
  localStorage.setItem(key, String(current + 1));
  // Eski kunlarni tozalash
  Object.keys(localStorage)
    .filter((k) => k.startsWith("ai_usage_") && k !== key)
    .forEach((k) => localStorage.removeItem(k));
};

const isPremium = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();
  return data?.is_premium || false;
};

export const checkAILimit = async (): Promise<{
  allowed: boolean;
  remaining: number;
}> => {
  const premium = await isPremium();
  if (premium) return { allowed: true, remaining: 999 };
  const used = getUsageCount();
  const remaining = AI_DAILY_LIMIT - used;
  return { allowed: remaining > 0, remaining };
};

export const askAI = async (prompt: string): Promise<string> => {
  const { allowed, remaining } = await checkAILimit();
  if (!allowed) {
    console.log("natije", remaining);
    return `❌ Kunlik limit tugadi! Bugun 5 ta so'rov bepul. Premium obuna bilan cheksiz foydalaning. 🌟`;
  }

  try {
    const { data, error } = await supabase.functions.invoke("GroqAI", {
      body: { prompt },
    });
    if (error) throw error;
    incrementUsage(); // faqat muvaffaqiyatli bo'lsa hisoblaymiz
    return data?.text || "Javob olinmadi";
  } catch (e) {
    console.error("AI xatosi:", e);
    return "❌ Xatolik yuz berdi.";
  }
};

export const askAIJson = async <T = any>(
  prompt: string,
  fallback: T,
): Promise<T> => {
  const jsonPrompt = `${prompt}

MUHIM: Faqat sof JSON qaytar. Hech qanday izoh, \`\`\` belgisi yoki boshqa matn yozma. Faqat [ yoki { bilan boshla.`;

  const text = await askAI(jsonPrompt);

  if (text.startsWith("❌")) return fallback;

  try {
    return JSON.parse(text.trim());
  } catch {
    try {
      const match = text.match(/[\[{][\s\S]*[\]}]/);
      if (!match) throw new Error("JSON topilmadi");
      return JSON.parse(match[0]);
    } catch (e) {
      console.error("JSON parse xatosi:", text);
      return fallback;
    }
  }
};

export { getUsageCount, AI_DAILY_LIMIT };
