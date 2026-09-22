// ══════════════════════════════════════════════════════════════
// Socrati ovoz tizimi — Web Audio API bilan sintez qilingan ovozlar.
// 0 KB asset: hech qanday .mp3 fayl kerak emas, hammasi kodda.
//
//   playDing()      → to'g'ri javob (yoqimli "din!")
//   playBuzz()      → xato javob (yumshoq "bzzz")
//   playClick()     → tugma bosilishi (juda moye "tik")
//   playFanfare()   → g'alaba/celebration (kichik fanfara)
//   playChime()     → splash/kirish (sokin, jozibador qo'ng'iroq)
//   speak(text, lang) → TTS (talaffuz) — brauzerning o'z ovozi
//
// Sozlamalarda o'chirilishi mumkin (localStorage: socrati_sound).
// ══════════════════════════════════════════════════════════════

const SOUND_KEY = "socrati_sound";

let ctx: AudioContext | null = null;
let enabled = localStorage.getItem(SOUND_KEY) !== "off";

export const isSoundEnabled = () => enabled;

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
  localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  if (on) ensureCtx(); // yoqilganda audio'ni "unlock" qilamiz
};

const ensureCtx = (): AudioContext | null => {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    // Brauzer autoplay siyosati: user gesture'dan keyin resume kerak
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

interface ToneOpts {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
}

const tone = ({ freq, dur, type = "sine", gain = 0.12, delay = 0, slideTo }: ToneOpts) => {
  const ac = ensureCtx();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    // Yumshoq attack/release — "qattiq" klik eshitilmasin
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    /* audio mavjud emas — jim o'tamiz */
  }
};

/* ── To'g'ri javob: yuqoriga siljigan ikki tonli "din!" ── */
export const playDing = () => {
  tone({ freq: 784, dur: 0.14, type: "sine", gain: 0.14 }); // G5
  tone({ freq: 1175, dur: 0.2, type: "sine", gain: 0.12, delay: 0.09 }); // D6
};

/* ── Xato javob: past, yumshoq "bzzz" ── */
export const playBuzz = () => {
  tone({ freq: 220, dur: 0.18, type: "sawtooth", gain: 0.07, slideTo: 160 });
};

/* ── Tugma bosilishi: juda qisqa, nozik "tik" ── */
export const playClick = () => {
  tone({ freq: 1400, dur: 0.045, type: "triangle", gain: 0.05 });
};

/* ── G'alaba fanfarasi: C-E-G-C arpeggio + yakuniy akkord ── */
export const playFanfare = () => {
  const N = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  N.forEach((f, i) => tone({ freq: f, dur: 0.16, type: "triangle", gain: 0.13, delay: i * 0.11 }));
  // Yakuniy akkord (C6+E6+G6)
  [1046.5, 1318.5, 1568].forEach((f) =>
    tone({ freq: f, dur: 0.55, type: "triangle", gain: 0.08, delay: 0.48 }),
  );
};

/* ── Splash/kirish: sokin, sirli kris-tal qo'ng'irog'i ── */
export const playChime = () => {
  const N = [523.25, 783.99, 1046.5, 1318.5]; // C5 G5 C6 E6
  N.forEach((f, i) =>
    tone({ freq: f, dur: 1.1, type: "sine", gain: 0.07, delay: i * 0.16 }),
  );
};

/* ── Mukofot/tanga: kichik yaltiroq "ping" ── */
export const playCoin = () => {
  tone({ freq: 987.77, dur: 0.09, type: "square", gain: 0.05 }); // B5
  tone({ freq: 1318.5, dur: 0.22, type: "square", gain: 0.05, delay: 0.07 }); // E6
};

/* ════════════════ TTS (talaffuz) ════════════════ */

// Til kodlarini brauzer TTS tiliga moslaymiz
const TTS_LANG: Record<string, string> = {
  uz: "uz-UZ",
  en: "en-US",
  ru: "ru-RU",
  tr: "tr-TR",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  ar: "ar-SA",
  zh: "zh-CN",
  ko: "ko-KR",
  ja: "ja-JP",
  it: "it-IT",
};

export const speak = (text: string, lang = "en") => {
  if (!enabled || !text || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel(); // avvalgisini to'xtatamiz
    const u = new SpeechSynthesisUtterance(text);
    u.lang = TTS_LANG[lang] || lang || "en-US";
    u.rate = 0.92; // biroz sekin — o'rganish uchun qulay
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {
    /* TTS mavjud emas */
  }
};

export const stopSpeaking = () => {  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* jim */
  }
};

export const isSpeaking = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  window.speechSynthesis.speaking;
