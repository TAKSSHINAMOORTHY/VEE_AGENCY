const DEFAULT_ITERATIONS = 150_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export type EncryptedBackupPayloadV2 = {
  version: 2;
  exportedAt: string;
  encrypted: {
    saltB64: string;
    ivB64: string;
    iterations: number;
    ciphertextB64: string;
  };
};

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function assertWebCryptoAvailable() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("WebCrypto not available");
  }
}

async function deriveKey(pin: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const baseKey = await globalThis.crypto.subtle.importKey(
    "raw",
    toArrayBuffer(textToBytes(pin)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations,
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBackupPayload(
  pin: string,
  data: Record<string, string | null>,
): Promise<EncryptedBackupPayloadV2> {
  assertWebCryptoAvailable();

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const iterations = DEFAULT_ITERATIONS;
  const key = await deriveKey(pin, salt, iterations);
  const plaintext = textToBytes(JSON.stringify({ version: 1, data }));

  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(plaintext),
  );
  const ciphertext = new Uint8Array(encrypted);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    encrypted: {
      saltB64: bytesToBase64(salt),
      ivB64: bytesToBase64(iv),
      iterations,
      ciphertextB64: bytesToBase64(ciphertext),
    },
  };
}

export async function decryptBackupPayload(
  pin: string,
  payload: EncryptedBackupPayloadV2,
): Promise<Record<string, string | null>> {
  assertWebCryptoAvailable();

  const salt = base64ToBytes(payload.encrypted.saltB64);
  const iv = base64ToBytes(payload.encrypted.ivB64);
  const ciphertext = base64ToBytes(payload.encrypted.ciphertextB64);

  const key = await deriveKey(pin, salt, payload.encrypted.iterations || DEFAULT_ITERATIONS);
  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(ciphertext),
  );

  const text = new TextDecoder().decode(decrypted);
  const parsed = JSON.parse(text) as { version: number; data: Record<string, string | null> };
  if (parsed.version !== 1 || !parsed.data || typeof parsed.data !== "object") {
    throw new Error("Invalid backup payload");
  }

  return parsed.data;
}
