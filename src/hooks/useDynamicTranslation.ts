import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateText } from "../services/indicTrans2Service";

/** Translates caregiver-entered runtime text and safely falls back while offline. */
export function useDynamicTranslation(sourceText: string, sourceLang = "en") {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState(sourceText);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (i18n.language === sourceLang || !sourceText.trim()) {
      setTranslated(sourceText);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setTranslated(sourceText);
    setIsLoading(true);
    void translateText(sourceText, i18n.language, sourceLang).then((result) => {
      if (!cancelled) {
        setTranslated(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sourceText, sourceLang, i18n.language]);

  return { text: translated, isLoading };
}
