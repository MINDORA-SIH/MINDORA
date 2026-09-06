import { getRecord, putRecord, STORE_TRANSLATIONS } from "../data/mindoraDb";

interface TranslationRecord {
  id: string;
  lang: string;
  sourceText: string;
  translatedText: string;
  cachedAt: number;
}

const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function cacheKey(lang: string, text: string): string {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (Math.imul(31, hash) + text.charCodeAt(index)) | 0;
  }
  return `${lang}::${hash}`;
}

export async function getCachedTranslation(lang: string, text: string): Promise<string | null> {
  try {
    const record = await getRecord<TranslationRecord>(STORE_TRANSLATIONS, cacheKey(lang, text));
    if (!record || Date.now() - record.cachedAt > TTL_MS) return null;
    return record.translatedText;
  } catch {
    return null;
  }
}

export async function setCachedTranslation(
  lang: string,
  text: string,
  translatedText: string,
): Promise<void> {
  try {
    await putRecord<TranslationRecord>(STORE_TRANSLATIONS, {
      id: cacheKey(lang, text),
      lang,
      sourceText: text,
      translatedText,
      cachedAt: Date.now(),
    });
  } catch {
    // IndexedDB is optional: callers keep the source text if it is unavailable.
  }
}
