// ============================================================
// Edge Function: homework-ocr
// Uy vazifasi rasmini qabul qilib, AI (vision) yordamida
// bosqichma-bosqich yechim / tarjima qaytaradi.
//
// Deploy:
//   supabase functions deploy homework-ocr
//   supabase secrets set GEMINI_API_KEY=...   (bepul: aistudio.google.com)
//   supabase secrets set GROQ_API_KEY=gsk_...   (yoki ANTHROPIC_API_KEY)
//
// MUHIM: Provider FALLBACK — birinchi provider rate-limit (429) bersa,
// keyingisi avtomatik sinanadi. Kalit FAQAT server tomonda.
// ============================================================

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });

const VISION_PROMPT = `Sen tajribali o'qituvchi va professional tarjimonsan. Rasm bilan ishlash tartibi:
1. Rasmdagi BARCHA matnni diqqat bilan o'qi (OCR)
2. Agar savol "tarjima qil" dese — matnni SO'RALGAN TILGA to'liq va aniq tarjima qil, hech narsani qoldirmasdan
3. Aks holda — masalani top va O'ZBEK TILIDA bosqichma-bosqich yech:
   - Avval masala shartini qisqacha yoz
   - Har bosqichni raqamlang va tushuntirib ber
   - Oxirida javobni ajratib ko'rsat: "JAVOB: ..."
   - Bir necha masala bo'lsa, ketma-ket yech
4. Javobni ixcham yoz — ortiqcha kirish/so'z yozma
5. Rasmda matn o'qilmasa, shu haqda yoz`;

interface ProviderResult {
  ok: boolean;
  text: string;
  /** 429/5xx — boshqa provider'ga o'tish mumkin */
  retryable: boolean;
  error?: string;
}

async function callGroq(
  key: string,
  promptText: string,
  imageBase64: string,
  mimeType: string,
): Promise<ProviderResult> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Vision model. max_tokens 700 — free tier OTPM (1000) ichiga sig'adi.
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      let msg = `Groq xato: ${res.status}`;
      try {
        msg = JSON.parse(detail)?.error?.message || msg;
      } catch { /* raw */ }
      console.error("Groq upstream:", res.status, msg.slice(0, 200));
      return { ok: false, text: "", retryable: res.status === 429 || res.status >= 500, error: msg };
    }
    const data = await res.json();
    return { ok: true, text: data?.choices?.[0]?.message?.content || "", retryable: false };
  } catch (e) {
    return { ok: false, text: "", retryable: true, error: String((e as Error)?.message || e) };
  }
}

async function callGemini(
  key: string,
  promptText: string,
  imageBase64: string,
  mimeType: string,
): Promise<ProviderResult> {
  // Gemini modellari tez eskiradi — bir nechtasini ketma-ket sinaymiz.
  // "gemini-flash-latest" aliasi eng yangi flash modelga ko'rsatadi.
  const models = [
    "gemini-flash-latest",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];
  let lastError = "";
  let lastRetryable = false;

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  { inline_data: { mime_type: mimeType, data: imageBase64 } },
                ],
              },
            ],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
          }),
        },
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        let msg = `Gemini ${model}: ${res.status}`;
        try {
          msg = JSON.parse(detail)?.error?.message || msg;
        } catch { /* raw */ }
        console.error("Gemini upstream:", res.status, msg.slice(0, 200));
        lastError = msg;
        lastRetryable = res.status === 429 || res.status >= 500;
        // Model mavjud emas/deprecat bo'lsa — keyingi modelga o'tamiz.
        // 429 (limit) bo'lsa ham keyingisiga o'tish yaxshi — boshqa modelda limit alohida.
        continue;
      }
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p: { text?: string }) => p?.text || "").join("");
      if (text.trim()) return { ok: true, text, retryable: false };
      lastError = `Gemini ${model}: bo'sh javob`;
    } catch (e) {
      lastError = String((e as Error)?.message || e);
      lastRetryable = true;
    }
  }

  return { ok: false, text: "", retryable: lastRetryable, error: lastError || "Gemini javob bermadi" };
}

async function callAnthropic(
  key: string,
  promptText: string,
  imageBase64: string,
  mimeType: string,
): Promise<ProviderResult> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mimeType, data: imageBase64 },
              },
              { type: "text", text: promptText },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      let msg = `Anthropic xato: ${res.status}`;
      try {
        msg = JSON.parse(detail)?.error?.message || msg;
      } catch { /* raw */ }
      console.error("Anthropic upstream:", res.status, msg.slice(0, 200));
      return { ok: false, text: "", retryable: res.status === 429 || res.status >= 500, error: msg };
    }
    const data = await res.json();
    return { ok: true, text: data?.content?.[0]?.text || "", retryable: false };
  } catch (e) {
    return { ok: false, text: "", retryable: true, error: String((e as Error)?.message || e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Faqat POST" }, 405);
  }

  try {
    let payload: { imageBase64?: string; mimeType?: string; question?: string };
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Noto'g'ri so'rov (JSON emas)" }, 400);
    }

    const { imageBase64, mimeType, question } = payload;
    if (!imageBase64) return json({ error: "Rasm yuborilmadi" }, 400);
    if (imageBase64.length > 12 * 1024 * 1024) {
      return json({ error: "Rasm juda katta" }, 413);
    }

    const mime = mimeType || "image/jpeg";
    const promptText = `${VISION_PROMPT}${question ? `\n\nQo'shimcha savol: ${question}` : ""}`;

    // Provider chain — bor key'lar ketma-ket sinanadi, 429/5xx bo'lsa keyingisiga o'tadi
    const chain: { name: string; run: () => Promise<ProviderResult> }[] = [];
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (groqKey) {
      chain.push({ name: "Groq", run: () => callGroq(groqKey, promptText, imageBase64, mime) });
    }
    if (geminiKey) {
      chain.push({ name: "Gemini", run: () => callGemini(geminiKey, promptText, imageBase64, mime) });
    }
    if (anthropicKey) {
      chain.push({ name: "Anthropic", run: () => callAnthropic(anthropicKey, promptText, imageBase64, mime) });
    }

    if (chain.length === 0) {
      return json(
        { error: "AI kalit sozlanmagan (GEMINI_API_KEY, GROQ_API_KEY yoki ANTHROPIC_API_KEY)" },
        503,
      );
    }

    let lastError = "";
    let anyRetryable = false;
    for (const provider of chain) {
      const result = await provider.run();
      if (result.ok && result.text.trim()) {
        return json({ text: result.text });
      }
      lastError = result.error || lastError;
      if (result.retryable) anyRetryable = true;
      console.error(`${provider.name} muvaffaqiyatsiz, keyingisiga o'tilmoqda...`);
    }

    return json(
      {
        error: lastError || "Barcha AI provayderlari javob bermadi",
        retryable: anyRetryable,
      },
      anyRetryable ? 429 : 502,
    );
  } catch (e) {
    console.error("homework-ocr xato:", e);
    return json(
      { error: "Rasmni tahlil qilishda xatolik. Qayta urinib ko'ring." },
      500,
    );
  }
});
