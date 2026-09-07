export interface SessionKeys {
  aesKey: CryptoKey;
  clientPublicKeyBase64: string;
}

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function establishSessionKey(serverPublicKeyBase64: string): Promise<SessionKeys> {
  const serverPubKeyBytes = base64ToArrayBuffer(serverPublicKeyBase64);
  
  const serverKey = await crypto.subtle.importKey(
    'raw',
    serverPubKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  const clientKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveKey', 'deriveBits']
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: serverKey },
    clientKeyPair.privateKey,
    256
  );

  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    sharedBits,
    'HKDF',
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: new TextEncoder().encode('mindora-voice-aes256gcm')
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  new Uint8Array(sharedBits).fill(0);

  const clientPubKeyBytes = await crypto.subtle.exportKey('raw', clientKeyPair.publicKey);
  const clientPublicKeyBase64 = arrayBufferToBase64(clientPubKeyBytes);

  return { aesKey, clientPublicKeyBase64 };
}

export async function encryptAudio(audioBlob: Blob, aesKey: CryptoKey): Promise<EncryptedPayload> {
  const audioBuffer = await audioBlob.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    audioBuffer
  );

  new Uint8Array(audioBuffer).fill(0);

  return {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

export async function decryptTranscript(payload: EncryptedPayload, aesKey: CryptoKey): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(payload.encryptedData);
  const ivBuffer = base64ToArrayBuffer(payload.iv);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
    aesKey,
    encryptedBuffer
  );

  const transcript = new TextDecoder().decode(decryptedBuffer);
  new Uint8Array(decryptedBuffer).fill(0);
  return transcript;
}
