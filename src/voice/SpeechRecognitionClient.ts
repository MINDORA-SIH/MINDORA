import type { EncryptedPayload } from './CryptoService';

export interface SessionInfo {
  sessionId: string;
  publicKey: string;
  keyAlgorithm: string;
}

export interface TranscribeResponse {
  encryptedText: string;
  iv: string;
  language: string;
  confidence: number;
}

const ASR_API_URL = import.meta.env.VITE_ASR_API_URL || 'http://localhost:8000/api';
const COMMAND_TIMEOUT_MS = Number(import.meta.env.VITE_COMMAND_TIMEOUT_MS) || 10000;

export async function getSession(): Promise<SessionInfo> {
  try {
    const response = await fetch(`${ASR_API_URL}/asr/session`);
    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error: Could not reach the ASR API.');
    }
    throw error;
  }
}

export async function transcribe(
  encryptedPayload: EncryptedPayload,
  sessionId: string,
  clientPublicKey: string,
  mimeType: string
): Promise<TranscribeResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COMMAND_TIMEOUT_MS);

  try {
    const response = await fetch(`${ASR_API_URL}/asr/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        clientPublicKey: clientPublicKey,
        encryptedAudio: encryptedPayload.encryptedData,
        iv: encryptedPayload.iv,
        mimeType
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.status === 400) {
      throw new Error('Validation error: Invalid request parameters.');
    }
    if (response.status === 503) {
      throw new Error('Service unavailable: ASR model not ready.');
    }
    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Transcription request timed out.');
    }
    if (error instanceof TypeError) {
      throw new Error('Network error: Could not reach the ASR API.');
    }
    throw error;
  }
}
