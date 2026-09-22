// ── Adaptiv daraja: AI test savollari har safar qiyinlashadi ─────────
// Foydalanuvchi bir xil fan+darajada test yecha versа, keyingi test
// oldingisidan bir pog'ona qiyinroq bo'ladi. Buning uchun necha bor
// yechilgani localStorage'da saqlanadi (oddiligi va tezligi uchun).

const KEY = "adaptive_difficulty_v1";

interface AdaptiveEntry {
  attempts: number; // shu fan+darajada necha bor test yechilgan
  best: number; // eng yaxshi foiz
}

type AdaptiveMap = Record<string, AdaptiveEntry>;

const load = (): AdaptiveMap => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as AdaptiveMap;
  } catch {
    return {};
  }
};

const save = (map: AdaptiveMap) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* localStorage to'lgan bo'lsa jim o'tamiz */
  }
};

/**
 * Qiyinlikni oshirish: daraja ro'yxatida pog'ona balandlashadi
 * (A1→A2→...→C1), C1 dan keyin "C1+" (AI ko'proq murakkab savol beradi).
 */
const LEVEL_LADDER = ["A1", "A2", "B1", "B2", "C1"];

/** Attempt kaliti: fan + daraja (masalan "math-A1") */
const entryKey = (subject: string, level: string) => `${subject}-${level}`;

/** Keyingi testda ishlatiladigan effective level (AI prompt uchun) */
export const nextAdaptiveLevel = (subject: string, level: string): string => {
  const map = load();
  const entry = map[entryKey(subject, level)];
  const attempts = entry?.attempts ?? 0;
  if (attempts === 0) return level;

  const idx = LEVEL_LADDER.indexOf(level);
  // Har 2 urinishda 1 pog'ona yuqoriga (maksimal darajadan oshmaydi)
  const boost = Math.min(attempts, 6) / 2;
  const steps = Math.floor(boost);
  const targetIdx = idx < 0 ? LEVEL_LADDER.length - 1 : Math.min(LEVEL_LADDER.length - 1, idx + steps);
  const boosted = LEVEL_LADDER[targetIdx] ?? level;

  // Agar maks darajaga yetib bo'lsa, "C1+" belgisi bilan qaytaramiz
  if (targetIdx >= LEVEL_LADDER.length - 1 && idx + steps > LEVEL_LADDER.length - 1) {
    return `${boosted}+`;
  }
  return boosted;
};

/** Keyingi testga qiyinlik talabi (AI prompt qismi) */
export const adaptiveDifficultyClause = (subject: string, level: string): string => {
  const map = load();
  const attempts = map[entryKey(subject, level)]?.attempts ?? 0;
  if (attempts === 0) return "";
  const extra =
    attempts >= 6
      ? "Bu foydalanuvchi mavzuni yaxshi biladi — JUDA murakkab, kombinator yechim talab qiluvchi savollar ber."
      : attempts >= 3
        ? "Bu foydalanuvchi mavzuni o'rganmoqda — murakkab, ko'p qadamli savollar ber."
        : "Bu foydalanuvchi boshlayapti — oldingisidan biroz qiyinroq savollar ber.";
  return `Foydalanuvchi shu mavzuda allaqachon ${attempts} bor test yechdi. ${extra}`;
};

/** Test tugagach chaqiriladi: urinishni hisoblaydi */
export const recordAdaptiveAttempt = (
  subject: string,
  level: string,
  percent: number,
) => {
  const map = load();
  const key = entryKey(subject, level);
  const entry = map[key] ?? { attempts: 0, best: 0 };
  entry.attempts += 1;
  entry.best = Math.max(entry.best, percent);
  map[key] = entry;
  save(map);
};

/** Ko'rsatish uchun: hozirgi urinishlar soni va eng yaxshi natija */
export const adaptiveStats = (subject: string, level: string): AdaptiveEntry => {
  const map = load();
  return map[entryKey(subject, level)] ?? { attempts: 0, best: 0 };
};
