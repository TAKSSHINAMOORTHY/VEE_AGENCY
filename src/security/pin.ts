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

export interface PinPayloadV1 {
  version: 1;
  saltB64: string;
  hashB64: string;
  iterations: number;
}

const DEFAULT_ITERATIONS = 150_000;

function assertWebCryptoAvailable() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("WebCrypto not available");
  }
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function createPinPayload(pin: string): Promise<PinPayloadV1> {
  if (!isValidPin(pin)) {
    throw new Error("PIN must be 4 digits");
  }

  assertWebCryptoAvailable();

  const salt = new Uint8Array(16);
  globalThis.crypto.getRandomValues(salt);

  const hash = await derivePinHash(pin, salt, DEFAULT_ITERATIONS);

  return {
    version: 1,
    saltB64: bytesToBase64(salt),
    hashB64: bytesToBase64(hash),
    iterations: DEFAULT_ITERATIONS,
  };
}

export async function verifyPinPayload(pin: string, payload: PinPayloadV1): Promise<boolean> {
  if (!isValidPin(pin)) return false;

  assertWebCryptoAvailable();

  const salt = base64ToBytes(payload.saltB64);
  const expectedHash = base64ToBytes(payload.hashB64);
  const actualHash = await derivePinHash(pin, salt, payload.iterations);

  if (actualHash.length !== expectedHash.length) return false;

  // Constant-time-ish compare.
  let diff = 0;
  for (let i = 0; i < actualHash.length; i += 1) {
    diff |= actualHash[i] ^ expectedHash[i];
  }
  return diff === 0;
}

async function derivePinHash(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    textToBytes(pin) as unknown as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as unknown as BufferSource,
      iterations,
    },
    keyMaterial,
    256,
  );

  return new Uint8Array(bits);
}
