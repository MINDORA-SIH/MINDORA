import { VoiceIntent, type IntentResult } from './VoiceNavigation';
import { ROUTE_COMMANDS } from './routeCommands';
import { normalizeText, removeFillerWords } from './CommandNormalizer';

export function parseCommand(transcript: string, detectedLanguage: string): IntentResult {
  const normalized = normalizeText(transcript);
  const cleaned = removeFillerWords(normalized, detectedLanguage);
  
  if (!cleaned) {
    return { type: VoiceIntent.UNKNOWN_COMMAND, route: null, label: 'Unknown' };
  }

  // 1. Exact match against aliases for detected language
  for (const command of ROUTE_COMMANDS) {
    const aliases = command.aliases[detectedLanguage] || [];
    for (const alias of aliases) {
      if (cleaned === normalizeText(alias)) {
        return { type: command.intent, route: command.route, label: command.label };
      }
    }
  }

  // 2. Substring/containment match for detected language
  for (const command of ROUTE_COMMANDS) {
    const aliases = command.aliases[detectedLanguage] || [];
    for (const alias of aliases) {
      if (cleaned.includes(normalizeText(alias))) {
        return { type: command.intent, route: command.route, label: command.label };
      }
    }
  }

  // 3. Fallback: Try all languages (exact and substring)
  for (const command of ROUTE_COMMANDS) {
    for (const lang in command.aliases) {
      const aliases = command.aliases[lang];
      for (const alias of aliases) {
        const normAlias = normalizeText(alias);
        if (cleaned === normAlias || cleaned.includes(normAlias)) {
          return { type: command.intent, route: command.route, label: command.label };
        }
      }
    }
  }

  return { type: VoiceIntent.UNKNOWN_COMMAND, route: null, label: 'Unknown' };
}
