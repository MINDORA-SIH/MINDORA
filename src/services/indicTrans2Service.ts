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

/** Google accepts these two language tags where the ISO app codes are rejected. */
const GOOGLE_LANGUAGE_MAP: Record<string, string> = { brx: "hi", mni: "mni-Mtei" };

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

  // The configured IndicTrans endpoint currently rejects browser POSTs (405).
  // This public GET fallback has no credentials and is used only for copy that
  // has not yet been added to the offline locale bundles.
  try {
      const query = new URLSearchParams({
        client: "gtx",
        sl: sourceLang,
        tl: GOOGLE_LANGUAGE_MAP[targetLang] ?? targetLang,
        dt: "t",
        q: text,
      });
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?${query}`);
      if (!response.ok) throw new Error(`Fallback translation failed: ${response.status}`);
      const body = (await response.json()) as Array<Array<[string]>>;
      const translated = body[0]?.map((part) => part[0]).join("") || text;
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
