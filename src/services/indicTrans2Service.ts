import { getCachedTranslation, setCachedTranslation } from "./translationCache";

const IT2_ENDPOINT = "https://models.ai4bharat.org/inference/v2";

const FLORES_MAP: Record<string, string> = {
  en: "eng_Latn",
  hi: "hin_Deva",
  as: "asm_Beng",
  bn: "ben_Beng",
  ne: "npi_Deva",
  brx: "brx_Deva",
  mni: "mni_Mtei",
  lus: "lus_Latn",
  kha: "kha_Latn",
  trp: "trp_Beng",
};

function timeoutSignal(milliseconds: number): AbortSignal | undefined {
  return typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(milliseconds) : undefined;
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang = "en",
): Promise<string> {
  if (targetLang === sourceLang || !text.trim()) return text;
  const target = FLORES_MAP[targetLang];
  if (!target) return text;

  const cached = await getCachedTranslation(targetLang, text);
  if (cached) return cached;

  try {
    const response = await fetch(`${IT2_ENDPOINT}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        src_lang: FLORES_MAP[sourceLang] ?? FLORES_MAP.en,
        tgt_lang: target,
        sentences: [text],
      }),
      signal: timeoutSignal(8_000),
    });
    if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
    const body = (await response.json()) as { translations?: string[] };
    const translated = body.translations?.[0] ?? text;
    await setCachedTranslation(targetLang, text, translated);
    return translated;
  } catch {
    return text;
  }
}

export async function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang = "en",
): Promise<string[]> {
  return Promise.all(texts.map((text) => translateText(text, targetLang, sourceLang)));
}
