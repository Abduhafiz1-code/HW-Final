// ── Umumiy savol modeli ──────────────────────────────────────────────
// Testning BARCHA joylarida (ustoz testi, yolg'iz quiz, co-op, eventlar)
// savollar ikki turga bo'linadi:
//   1) variantli (MCQ) — options + answer
//   2) ochiq (open) — o'quvchi o'zi javob yozadi, teacher_answer bilan tekshiriladi
// Bu ikki tur bir jadvalda (tests.questions JSONB) aralash saqlanadi.

export interface NormalizedQuestion {
  question: string;
  type: "mcq" | "open";
  options: string[];
  answer: string; // mcq: to'g'ri variant matni; open: expected answer (ko'rsatish uchun)
  teacher_answer?: string; // open: o'qituvchi kutilgan javobi (bir nechta bo'lsa, | bilan)
  explanation?: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const stripOptionLetter = (s: string): string =>
  s
    .trim()
    .replace(/^[A-Fa-f][).]\s+/, "") // "A) 4", "B. 4"
    .replace(/^[({[]?\s*[A-Fa-f]\s*[).]\s*/, "");

const normalizeText = (s: string): string =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[’‘`´]/g, "'")
    .replace(/["«»]/g, "")
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");

/** Ochiq savol javobini baholash: teacher_answer | bilan ajratilgan variantlar */
export const isOpenCorrect = (
  given: string,
  teacherAnswer: string | undefined | null,
): boolean => {
  if (!given?.trim() || !teacherAnswer) return false;
  const accepted = teacherAnswer
    .split("|")
    .map((a) => normalizeText(a))
    .filter(Boolean);
  const g = normalizeText(given);
  return accepted.includes(g);
};

/** AI yoki DB dan kelgan savolni bir xil formatga keltirish */
export const normalizeQuestion = (raw: any): NormalizedQuestion | null => {
  if (!raw) return null;
  const question = (raw.question ?? raw.q ?? "").toString().trim();
  if (!question) return null;

  const rawOptions: string[] = Array.isArray(raw.options)
    ? raw.options.map((o: any) => stripOptionLetter(String(o ?? "")))
    : [];
  const cleanOptions = rawOptions.filter((o: string) => o);

  const explicitType = raw.type === "open" || raw.type === "mcq" ? raw.type : null;
  const looksOpen =
    explicitType === "open" ||
    (!explicitType &&
      (cleanOptions.length === 0 ||
        (raw.answer == null && raw.teacher_answer != null) ||
        (!Array.isArray(raw.options) && raw.teacher_answer != null)));

  if (looksOpen) {
    return {
      question,
      type: "open",
      options: [],
      answer: (raw.answer ?? raw.teacher_answer ?? "").toString().trim(),
      teacher_answer:
        (raw.teacher_answer ?? raw.answer ?? "").toString().trim() || undefined,
      explanation: raw.explanation?.toString?.(),
    };
  }

  // MCQ: variantlarga "A) " prefiks qo'shamiz (student ko'rishi uchun)
  const options = cleanOptions.slice(0, 6).map(
    (o: string, i: number) => `${OPTION_LETTERS[i]}) ${o}`,
  );
  const rawAnswer = stripOptionLetter(String(raw.answer ?? "")).trim();
  // AI ba'zan faqat harf ("b") yoki "B) matn" qaytaradi — variantlarga moslab olamiz
  let answer = rawAnswer;
  const byLetter = cleanOptions.findIndex(
    (_o: string, i: number) => normalizeText(OPTION_LETTERS[i]) === normalizeText(rawAnswer.replace(/^[).]\s*/, "")),
  );
  if (byLetter >= 0) answer = cleanOptions[byLetter];
  else {
    const byText = cleanOptions.find((o) => normalizeText(o) === normalizeText(rawAnswer));
    if (byText) answer = byText;
  }
  if (!answer) answer = cleanOptions[0] ?? "";
  const idx = cleanOptions.indexOf(answer);
  const labeledAnswer = idx >= 0 ? `${OPTION_LETTERS[idx]}) ${answer}` : answer;

  return {
    question,
    type: "mcq",
    options,
    answer: labeledAnswer,
    explanation: raw.explanation?.toString?.(),
  };
};

/** Ro'yxatni normalize qilib, noto'g'rilarni tashlaydi */
export const normalizeQuestionList = (rawList: any): NormalizedQuestion[] => {
  const arr = Array.isArray(rawList) ? rawList : [];
  return arr
    .map(normalizeQuestion)
    .filter((q): q is NormalizedQuestion => !!q);
};

/** AI uchun aralash (variantli + ochiq) savol so'rovi */
export const mixedQuestionsPrompt = (topic: string, count: number): string =>
  `${topic} mavzusida ${count} ta savol yarat. Savollarning ~60% i variantli, ~40% i ochiq (variant yo'q, o'quvchi o'zi qisqa javob yozadi). Mavzuga qarab til tanla. Faqat JSON array: [{"type":"mcq","question":"...","options":["A variant","B variant","C variant","D variant"],"answer":"to'g'ri variant (to'liq matn, harfsiz)"},{"type":"open","question":"...","teacher_answer":"kutilgan qisqa javob (bir nechta variant bo'lsa | bilan ajrat)"}]. Boshqa hech narsa yozma.`;

/** Umumiy ball formatter */
export const scoreLine = (correct: number, total: number): string =>
  `${correct} / ${total}`;
