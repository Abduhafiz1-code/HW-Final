/**
 * Rasmni siqish util — AI vision so'rovlarida token tejaydi.
 * Katta rasmlar (telefon kameralari 12MP+) base64'da juda katta bo'ladi va
 * provider'ning token limitiga uriladi ("Request too large" xatosi).
 */

export interface CompressOptions {
  /** Maksimal o'lcham (eng uzun tomon), px. 1600 OCR uchun yetarli aniqlik. */
  maxDimension?: number;
  /** JPEG sifati 0..1. 0.8 matn uchun yetarli, hajmni ~70% kamaytiradi. */
  quality?: number;
  /** Natijaviy base64 maksimal hajmi (bayt). Oshsa sifat pasaytiriladi. */
  maxBytes?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1600,
  quality: 0.8,
  maxBytes: 1_500_000, // ~1.5MB base64
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * File yoki dataURL'ni siqib, { dataUrl, base64, mimeType } qaytaradi.
 * PNG (shaffoflik) bo'lsa ham JPEG'ga aylantiriladi — OCR uchun muhim emas,
 * lekin hajm 3-5 barobar kamayadi.
 */
export const compressImage = async (
  source: File | string,
  opts: CompressOptions = {},
): Promise<{ dataUrl: string; base64: string; mimeType: string }> => {
  const { maxDimension, quality, maxBytes } = { ...DEFAULTS, ...opts };

  const dataUrl = typeof source === "string" ? source : await fileToDataUrl(source);

  // Rasm o'lchamini aniqlash
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  let w = Math.max(1, Math.round(img.width * scale));
  let h = Math.max(1, Math.round(img.height * scale));
  let q = quality;

  const draw = (width: number, height: number, quality: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff"; // shaffoflikni oq bilan almashtir (matn aniqligi uchun)
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  };

  // Birinchi urinish: so'ralgan sifat. Hajm oshsa — sifat, keyin o'lcham pasayadi.
  let out = draw(w, h, q);
  while (out.length * 0.75 > maxBytes && q > 0.4) {
    q -= 0.15;
    out = draw(w, h, q);
  }
  while (out.length * 0.75 > maxBytes && w > 640) {
    w = Math.round(w * 0.75);
    h = Math.round(h * 0.75);
    q = Math.min(q, 0.7);
    out = draw(w, h, q);
  }

  return {
    dataUrl: out,
    base64: out.split(",")[1] || "",
    mimeType: "image/jpeg",
  };
};
