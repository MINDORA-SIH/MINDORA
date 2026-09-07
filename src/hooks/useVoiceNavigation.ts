import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { getLangConfig } from "@/i18n/langConfig";
import { AudioRecorder } from "@/voice/AudioRecorder";
import { decryptTranscript, encryptAudio, establishSessionKey } from "@/voice/CryptoService";
import { detectLanguage } from "@/voice/LanguageDetectionService";
import { parseCommand } from "@/voice/CommandParser";
import { getSession, transcribe } from "@/voice/SpeechRecognitionClient";
import { resolveNavigation, type IntentResult, VoiceIntent } from "@/voice/VoiceNavigation";

export type VoiceStatus = "IDLE" | "LISTENING" | "ENCRYPTING" | "PROCESSING" | "CONFIRMING" | "SUCCESS" | "ERROR";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type BrowserSpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>>;
};

type BrowserWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

const MAX_RECORDING_SECONDS = Number(import.meta.env.VITE_MAX_RECORDING_SECONDS) || 8;
const CONFIDENCE_THRESHOLD = Number(import.meta.env.VITE_VOICE_COMMAND_CONFIDENCE_THRESHOLD) || 0.75;

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("notallowed") || message.includes("permission")) return "Microphone permission is required for voice navigation.";
  if (message.includes("empty")) return "I couldn't hear any speech. Please try again.";
  if (message.includes("1.5mb") || message.includes("maximum allowed")) return "Recording was too long. Please speak a shorter command.";
  if (message.includes("timed out")) return "Voice navigation is taking too long. Please try again.";
  if (message.includes("network")) return "Voice navigation requires an internet connection.";
  if (message.includes("security") || message.includes("decrypt") || message.includes("encrypt")) return "A security error occurred. Please try again.";
  if (message.includes("unavailable") || message.includes("failed to get session")) return "Voice navigation is temporarily unavailable.";
  return "I couldn't process that voice command. Please try again.";
}

export function useVoiceNavigation() {
  const navigate = useNavigate();
  const recorderRef = useRef<AudioRecorder | null>(null);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const requestVersion = useRef(0);
  const pendingIntent = useRef<IntentResult | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("IDLE");
  const [transcript, setTranscript] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [intent, setIntent] = useState<IntentResult | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBasicMode, setIsBasicMode] = useState(false);

  const reset = useCallback(() => {
    requestVersion.current += 1;
    recorderRef.current?.cancel();
    recorderRef.current = null;
    speechRecognitionRef.current?.abort();
    speechRecognitionRef.current = null;
    pendingIntent.current = null;
    setStatus("IDLE");
    setTranscript("");
    setDetectedLanguage("");
    setIntent(null);
    setConfidence(null);
    setError(null);
    setIsBasicMode(false);
  }, []);

  const navigateForIntent = useCallback((nextIntent: IntentResult) => {
    pendingIntent.current = null;
    setIntent(nextIntent);
    setStatus("SUCCESS");
    window.setTimeout(() => {
      resolveNavigation(nextIntent, (to) => {
        if (typeof to === "number") navigate(to);
        else navigate(to);
      });
      reset();
    }, 700);
  }, [navigate, reset]);

  const handleTranscript = useCallback((text: string, language: string, score: number) => {
    const parsed = parseCommand(text, language);
    setTranscript(text);
    setDetectedLanguage(language);
    setConfidence(score);
    setIntent(parsed);
    if (parsed.type === VoiceIntent.UNKNOWN_COMMAND) {
      setError("I heard you, but I don't recognize that as a page name.");
      setStatus("ERROR");
      return;
    }
    if (score < CONFIDENCE_THRESHOLD) {
      pendingIntent.current = parsed;
      setStatus("CONFIRMING");
      return;
    }
    navigateForIntent(parsed);
  }, [navigateForIntent]);

  const startBasicRecognition = useCallback((language: string, version = requestVersion.current) => {
    const Recognition = (window as BrowserWindow).SpeechRecognition || (window as BrowserWindow).webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice navigation requires an internet connection.");
      setStatus("ERROR");
      return;
    }
    const recognition = new Recognition();
    speechRecognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLangConfig(language).speechRecognitionLang;
    recognition.onresult = (event) => {
      const result = event.results[0][0];
      void detectLanguage(result.transcript, language).then((detected) => {
        if (version !== requestVersion.current) return;
        handleTranscript(
          result.transcript,
          detected.language,
          detected.source === "fasttext" ? Math.max(result.confidence || 1, detected.confidence) : result.confidence || 1,
        );
      });
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError(event.error === "not-allowed" ? "Microphone permission is required for voice navigation." : "I couldn't hear any speech. Please try again.");
        setStatus("ERROR");
      }
    };
    recognition.onend = () => { speechRecognitionRef.current = null; };
    setIsBasicMode(true);
    setStatus("LISTENING");
    recognition.start();
  }, [handleTranscript]);

  const processRecording = useCallback(async (recording: Awaited<ReturnType<AudioRecorder["waitForResult"]>>, sessionId: string, clientPublicKey: string, aesKey: CryptoKey, version: number) => {
    try {
      if (version !== requestVersion.current) return;
      setStatus("ENCRYPTING");
      const encryptedAudio = await encryptAudio(recording.blob, aesKey);
      if (version !== requestVersion.current) return;
      setStatus("PROCESSING");
      const response = await transcribe(encryptedAudio, sessionId, clientPublicKey, recording.mimeType);
      if (version !== requestVersion.current) return;
      const text = await decryptTranscript({ encryptedData: response.encryptedText, iv: response.iv }, aesKey);
      if (version !== requestVersion.current) return;
      const detected = await detectLanguage(text, response.language);
      if (version !== requestVersion.current) return;
      handleTranscript(
        text,
        detected.language,
        detected.source === "fasttext" ? Math.max(response.confidence, detected.confidence) : response.confidence,
      );
    } catch (nextError) {
      if (version === requestVersion.current) {
        setError(friendlyError(nextError));
        setStatus("ERROR");
      }
    }
  }, [handleTranscript]);

  const startListening = useCallback(async (language: string) => {
    reset();
    const version = requestVersion.current;
    if (!navigator.onLine) {
      startBasicRecognition(language, version);
      return;
    }
    try {
      setStatus("ENCRYPTING");
      const session = await getSession();
      const keys = await establishSessionKey(session.publicKey);
      if (version !== requestVersion.current) return;
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      await recorder.start(MAX_RECORDING_SECONDS);
      if (version !== requestVersion.current) return;
      setStatus("LISTENING");
      void recorder.waitForResult()
        .then((recording) => processRecording(recording, session.sessionId, keys.clientPublicKeyBase64, keys.aesKey, version))
        .catch((nextError) => {
          if (version === requestVersion.current && (nextError as Error).message !== "Recording cancelled") {
            setError(friendlyError(nextError));
            setStatus("ERROR");
          }
        });
    } catch (nextError) {
      if (version !== requestVersion.current) return;
      if (nextError instanceof Error && nextError.message.toLowerCase().includes("network")) startBasicRecognition(language, version);
      else {
        setError(friendlyError(nextError));
        setStatus("ERROR");
      }
    }
  }, [processRecording, reset, startBasicRecognition]);

  const stopListening = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      return;
    }
    recorderRef.current?.stop().catch((nextError) => {
      setError(friendlyError(nextError));
      setStatus("ERROR");
    });
  }, []);

  const confirmNavigation = useCallback(() => {
    if (pendingIntent.current) navigateForIntent(pendingIntent.current);
  }, [navigateForIntent]);

  useEffect(() => reset, [reset]);

  return {
    status,
    isListening: status === "LISTENING",
    isEncrypting: status === "ENCRYPTING",
    isProcessing: status === "PROCESSING",
    isConfirming: status === "CONFIRMING",
    transcript,
    detectedLanguage,
    intent,
    confidence,
    error,
    isBasicMode,
    startListening,
    stopListening,
    confirmNavigation,
    cancel: reset,
  };
}
