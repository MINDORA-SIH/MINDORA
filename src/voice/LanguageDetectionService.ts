import type { FastText } from "fasttext.wasm";

/**
 * fastText's compact language-identification model runs entirely in the browser.
 * The model and WebAssembly runtime are lazy-loaded, so the normal UI startup
 * stays fast and no transcript is sent to another language-detection service.
 */
const FASTTEXT_CORE_URL = "/fasttext/fasttext.mjs";
const FASTTEXT_WASM_URL = "/fasttext/fasttext.wasm";
const FASTTEXT_MODEL_URL = "/fasttext/lid.176.ftz";

const FASTTEXT_TO_APP_LANGUAGE: Record<string, string> = {
  en: "en",
  hi: "hi",
  ne: "ne",
  as: "as",
  bn: "bn",
  brx: "brx",
  mni: "mni",
  lus: "lus",
  kha: "kha",
  trp: "trp",
};

export interface DetectedLanguage {
  language: string;
  confidence: number;
  source: "fasttext" | "fallback";
}

let detectorPromise: Promise<FastText> | null = null;

async function getDetector(): Promise<FastText> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FastText } = await import("fasttext.wasm");
      const detector = await FastText.create({
        corePath: FASTTEXT_CORE_URL,
        wasmPath: FASTTEXT_WASM_URL,
      });
      await detector.loadModel(FASTTEXT_MODEL_URL);
      return detector;
    })().catch((error) => {
      detectorPromise = null;
      throw error;
    });
  }
  return detectorPromise;
}

/** Uses fastText WASM when it can make a confident, app-supported prediction. */
export async function detectLanguage(
  text: string,
  fallbackLanguage: string,
): Promise<DetectedLanguage> {
  if (!text.trim()) {
    return { language: fallbackLanguage, confidence: 0, source: "fallback" };
  }

  try {
    const detector = await getDetector();
    const prediction = [...detector.predict(text, 1, 0)][0];
    if (!prediction) {
      return { language: fallbackLanguage, confidence: 0, source: "fallback" };
    }

    const [rawLabel, confidence] = prediction;
    const rawLanguage = rawLabel.replace(/^__label__/, "").toLowerCase();
    const language = FASTTEXT_TO_APP_LANGUAGE[rawLanguage];
    if (!language || confidence < 0.5) {
      return { language: fallbackLanguage, confidence, source: "fallback" };
    }
    return { language, confidence, source: "fasttext" };
  } catch {
    // Speech navigation remains available if WASM/model loading is blocked.
    return { language: fallbackLanguage, confidence: 0, source: "fallback" };
  }
}
