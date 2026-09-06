import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { translateText } from "@/services/indicTrans2Service";

const EXCLUDED_TAGS = new Set(["SCRIPT", "STYLE", "SVG", "TEXTAREA", "OPTION"]);
const BRAND_OR_DATA = new Set(["MINDORA", "Savitri Devi", "SD"]);

function isEnglishCopy(text: string) {
  return /[A-Za-z]{3}/.test(text) && !BRAND_OR_DATA.has(text.trim());
}

/**
 * Covers copy that has not yet been moved to a reviewed JSON locale bundle.
 * It remembers the original English text, so moving between languages never
 * translates a previous translation. Results are cached by `translateText`.
 */
export function AutoTranslateUi({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const sources = useRef(new WeakMap<Text, string>());
  const runId = useRef(0);
  const isTranslating = useRef(false);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const root = rootRef.current;
    if (!root) return;
    const currentRun = ++runId.current;

    const translate = async () => {
      if (isTranslating.current) return;
      isTranslating.current = true;
      try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        const text = node.textContent ?? "";
        const parent = node.parentElement;
        if (!parent || EXCLUDED_TAGS.has(parent.tagName) || parent.closest("[data-no-translate]")) continue;
        const source = sources.current.get(node) ?? text;
        if (!sources.current.has(node) && isEnglishCopy(source)) sources.current.set(node, source);
        if (sources.current.has(node)) nodes.push(node);
      }

      // Restore source text first. This prevents chaining Hindi -> Assamese,
      // for example, when a user switches languages more than once.
      for (const node of nodes) node.textContent = sources.current.get(node) ?? node.textContent;
      if (i18n.language === "en") return;

      const queue = [...nodes];
      const worker = async () => {
        while (queue.length) {
          const node = queue.shift();
          if (!node) return;
          const source = sources.current.get(node);
          if (!source) continue;
          const translated = await translateText(source, i18n.language);
          if (runId.current === currentRun && sources.current.get(node) === source) node.textContent = translated;
        }
      };
      await Promise.all(Array.from({ length: 3 }, worker));
      } finally {
        isTranslating.current = false;
      }
    };

    let timer = setTimeout(() => void translate(), 80);
    const scheduleIfNewEnglishCopyAppears = (records: MutationRecord[]) => {
      if (i18n.language === "en" || isTranslating.current) return;
      const needsTranslation = records.some((record) => {
        const nodes = record.type === "characterData" ? [record.target] : [...record.addedNodes];
        return nodes.some((node) => {
          if (node.nodeType !== Node.TEXT_NODE) return false;
          const textNode = node as Text;
          const source = sources.current.get(textNode);
          return (!source && isEnglishCopy(textNode.textContent ?? "")) || source === textNode.textContent;
        });
      });
      if (needsTranslation) {
        clearTimeout(timer);
        timer = setTimeout(() => void translate(), 80);
      }
    };
    const observer = new MutationObserver(scheduleIfNewEnglishCopyAppears);
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [i18n.language]);

  return <div ref={rootRef}>{children}</div>;
}
