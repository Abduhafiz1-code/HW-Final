// Profil ramkalari katalogi — EPIC / LEGEND / MYTHIC darajalari bilan.
// Ramkalar animatsiyali SVG: AvatarFrame.vue ichida chiziladi.
// "cost: 0" + achievement => yutuq ramkasi (pulga emas, faollikka ochiladi).
export interface FrameOption {
  key: string;
  label: string;
  cost: number;
  /** 'coin' = tanga bilan (arzon dekor), 'diamond' = olmos bilan (noyob) */
  cost_type?: 'coin' | 'diamond';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: 'colors' | 'animals' | 'epic' | 'legend' | 'mythic';
  /** berilsa: olmos o'rniga shu shart bajarilsa ochiladi */
  achievement?: { type: 'streak' | 'tests'; label: string; target: number };
}

/** Ramka narxi qaysi valyutada: default — olmos */
export const frameCurrency = (f: FrameOption): 'coin' | 'diamond' =>
  f.cost_type ?? 'diamond';

export const FRAME_CATALOG: FrameOption[] = [
  // ── Ranglar (oddiy, arzon) ──────────────────────────────────
  { key: "none", label: "None", cost: 0, rarity: "common", category: "colors" },
  { key: "gold", label: "Gold", cost: 50, cost_type: "coin", rarity: "common", category: "colors" },
  { key: "cyan", label: "Azure", cost: 50, cost_type: "coin", rarity: "common", category: "colors" },
  { key: "purple", label: "Violet", cost: 50, cost_type: "coin", rarity: "common", category: "colors" },

  // ── TANGA uchun arzon dekor (yangi foydalanuvchi ham xarid qila oladi) ──
  { key: "rose-ring", label: "Rose", cost: 80, cost_type: "coin", rarity: "common", category: "colors" },
  { key: "mint-ring", label: "Mint", cost: 80, cost_type: "coin", rarity: "common", category: "colors" },
  { key: "sun-ring", label: "Sunset", cost: 120, cost_type: "coin", rarity: "rare", category: "colors" },
  { key: "ocean-ring", label: "Ocean", cost: 120, cost_type: "coin", rarity: "rare", category: "colors" },

  // ── Hayvonlar (o'rtacha, omma sevgan) ──────────────────────
  { key: "cat-pink", label: "Kitty", cost: 300, rarity: "rare", category: "animals" },
  { key: "wings-pink", label: "Heart Wings", cost: 300, rarity: "rare", category: "animals" },
  { key: "wings-purple", label: "Violet Wings", cost: 300, rarity: "rare", category: "animals" },
  { key: "fox", label: "Fox", cost: 300, rarity: "rare", category: "animals" },
  { key: "frog", label: "Froggy", cost: 400, rarity: "rare", category: "animals" },
  { key: "cat-dark", label: "Midnight Cat", cost: 400, rarity: "epic", category: "animals" },
  { key: "witch", label: "Witch", cost: 500, rarity: "epic", category: "animals" },
  { key: "princess", label: "Princess", cost: 500, rarity: "epic", category: "animals" },

  // ── EPIC (700 olmos, yonib turuvchi halqa) ─────────────────
  { key: "epic-flame", label: "Epic Flame", cost: 700, rarity: "epic", category: "epic" },
  { key: "epic-frost", label: "Epic Frost", cost: 700, rarity: "epic", category: "epic" },

  // ── LEGEND (1200 olmos, animatsiyali yulduzli aura) ────────
  { key: "legend-star", label: "Legend Star", cost: 1200, rarity: "legendary", category: "legend" },
  { key: "legend-storm", label: "Legend Storm", cost: 1200, rarity: "legendary", category: "legend" },

  // ── MYTHIC (2000 olmos, aylanuvchi uchqunlar + toj) ────────
  { key: "mythic-crown", label: "Mythic Crown", cost: 2000, rarity: "mythic", category: "mythic" },
  { key: "mythic-galaxy", label: "Mythic Galaxy", cost: 2000, rarity: "mythic", category: "mythic" },

  // ── YUTUQ ramkalari: test yechgani sari kuchayadi ──────────
  {
    key: "hero-bronze", label: "Bronze Scholar", cost: 0, rarity: "epic", category: "colors",
    achievement: { type: "tests", label: "10 tests", target: 10 },
  },
  {
    key: "hero-silver", label: "Silver Scholar", cost: 0, rarity: "legendary", category: "colors",
    achievement: { type: "tests", label: "30 tests", target: 30 },
  },
  {
    key: "hero-golden", label: "Golden Scholar", cost: 0, rarity: "mythic", category: "colors",
    achievement: { type: "tests", label: "60 tests", target: 60 },
  },
];

export const frameCost = (key: string) =>
  FRAME_CATALOG.find((f) => f.key === key)?.cost ?? 0;

export const frameLabel = (key: string) =>
  FRAME_CATALOG.find((f) => f.key === key)?.label ?? key;

/** Kategoriya bo'yicha filtrlash (do'kon tablari) */
export const framesByCategory = (category: FrameOption["category"]) =>
  FRAME_CATALOG.filter((f) => f.category === category);

export const CATEGORY_LABELS: Record<FrameOption["category"], string> = {
  colors: "Colors",
  animals: "Animals",
  epic: "EPIC",
  legend: "LEGEND",
  mythic: "MYTHIC",
};

/** Yutuq ramkalari (test darajalari) alohida tekshirish uchun */
export const ACHIEVEMENT_FRAMES = FRAME_CATALOG.filter((f) => f.achievement);

/** Kuchlanish darajasi: user nechta test yechgan bo'lsa, eng yuqori ochilgan */
export const strongestUnlockedFrame = (testsSolved: number): string | null => {
  const tiers = ACHIEVEMENT_FRAMES.sort((a, b) =>
    (a.achievement?.target ?? 0) - (b.achievement?.target ?? 0),
  );
  let best: string | null = null;
  for (const f of tiers) {
    if (testsSolved >= (f.achievement?.target ?? 0)) best = f.key;
  }
  return best;
};

/** Rarity ko'rinishi: chip rangi + yorliq + ring rangi */
export const rarityStyle = (rarity: FrameOption["rarity"]) => {
  switch (rarity) {
    case "rare":
      return { chip: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300", label: "RARE", ring: "ring-cyan-400" };
    case "epic":
      return { chip: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", label: "EPIC", ring: "ring-purple-500" };
    case "legendary":
      return { chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", label: "LEGEND", ring: "ring-amber-500" };
    case "mythic":
      return { chip: "bg-gradient-to-r from-rose-200 to-violet-200 text-violet-700 dark:from-rose-900/40 dark:to-violet-900/40 dark:text-violet-300", label: "MYTHIC", ring: "ring-violet-500" };
    default:
      return { chip: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300", label: "COMMON", ring: "ring-slate-300" };
  }
};

// Eski oddiy ring ramkalar (ilgari mavjudlar mosligi uchun)
export const simpleRingClass = (frame?: string) => {
  switch (frame) {
    case "gold": return "ring-4 ring-amber-400";
    case "cyan": return "ring-4 ring-cyan-400";
    case "purple": return "ring-4 ring-purple-400";
    case "rose-ring": return "ring-4 ring-rose-400";
    case "mint-ring": return "ring-4 ring-emerald-400";
    case "sun-ring": return "ring-4 ring-orange-400";
    case "ocean-ring": return "ring-4 ring-sky-500";
    default: return "ring-2 ring-slate-200 dark:ring-slate-600";
  }
};

/** AvatarFrame ichida SVG bilan chiziladigan barcha ramkalar */
export const isDecorativeFrame = (frame?: string) =>
  !!frame && [
    "cat-pink", "wings-pink", "wings-purple", "fox", "frog", "cat-dark",
    "witch", "princess",
    "epic-flame", "epic-frost",
    "legend-star", "legend-storm",
    "mythic-crown", "mythic-galaxy",
    "hero-bronze", "hero-silver", "hero-golden",
  ].includes(frame);
