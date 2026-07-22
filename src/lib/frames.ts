// Profil ramkalari katalogi.
// "cost: 0" => bepul (standart ring), qolganlari olmosga sotib olinadi.
export interface FrameOption {
  key: string;
  label: string;
  cost: number;
}

export const FRAME_CATALOG: FrameOption[] = [
  { key: "none", label: "Yo'q", cost: 0 },
  { key: "gold", label: "Oltin", cost: 15 },
  { key: "cyan", label: "Ko'k", cost: 15 },
  { key: "purple", label: "Binafsha", cost: 15 },
  // ── Yangi illyustrativ ramkalar (300-500 olmos) ──────────────
  { key: "cat-pink", label: "Mushukcha", cost: 300 },
  { key: "wings-pink", label: "Yurak-qanot", cost: 300 },
  { key: "wings-purple", label: "Binafsha qanot", cost: 300 },
  { key: "fox", label: "Tulkicha", cost: 300 },
  { key: "frog", label: "Qurbaqa", cost: 400 },
  { key: "cat-dark", label: "Tungi mushuk", cost: 400 },
  { key: "witch", label: "Jodugar", cost: 500 },
  { key: "princess", label: "Malika", cost: 500 },
];

export const frameCost = (key: string) =>
  FRAME_CATALOG.find((f) => f.key === key)?.cost ?? 0;

export const frameLabel = (key: string) =>
  FRAME_CATALOG.find((f) => f.key === key)?.label ?? key;

// Eski, oddiy rang-ring ramkalar uchun (yangi illyustrativ ramkalar
// AvatarFrame.vue ichida SVG bilan chiziladi).
export const simpleRingClass = (frame?: string) => {
  switch (frame) {
    case "gold": return "ring-4 ring-amber-400";
    case "cyan": return "ring-4 ring-cyan-400";
    case "purple": return "ring-4 ring-purple-400";
    default: return "ring-2 ring-slate-200 dark:ring-slate-600";
  }
};

export const isDecorativeFrame = (frame?: string) =>
  !!frame && ["cat-pink", "wings-pink", "wings-purple", "fox", "frog", "cat-dark", "witch", "princess"].includes(frame);
