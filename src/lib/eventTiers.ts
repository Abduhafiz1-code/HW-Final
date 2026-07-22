// Ikkala yangi event ("So'z yodlash — B1" va "Fanlar testi — B2") bir xil
// mukofot jadvalidan foydalanadi: natija foizi qanchalik yuqori bo'lsa,
// olmos va tanga miqdori shunchalik ko'p bo'ladi.
export interface EventTier {
  minPercent: number;
  diamonds: number;
  coins: number;
  label: string;
}

export const EVENT_TIERS: EventTier[] = [
  { minPercent: 80, diamonds: 20, coins: 50, label: "A'lo" },
  { minPercent: 60, diamonds: 10, coins: 30, label: "Yaxshi" },
  { minPercent: 40, diamonds: 5, coins: 20, label: "Qoniqarli" },
];

// Berilgan foizga mos tierni qaytaradi, agar 40% dan past bo'lsa null
// (mukofot yo'q — foydalanuvchi qayta urinib ko'rishi mumkin).
export const getEventTier = (percent: number): EventTier | null =>
  EVENT_TIERS.find((t) => percent >= t.minPercent) ?? null;
