const HMAC_PREFIX = "captain-obfuscator:v1";
const INITIAL_HASH = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
  0x5be0cd19,
] as const;
const ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
  0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
  0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
  0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
  0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
  0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
] as const;

export class ObfuscationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObfuscationError";
  }
}

export class InvalidKeyError extends ObfuscationError {
  constructor(message = "A non-empty key is required.") {
    super(message);
    this.name = "InvalidKeyError";
  }
}

export class InvalidPayloadError extends ObfuscationError {
  constructor(message = "Encoded payload is invalid or corrupted.") {
    super(message);
    this.name = "InvalidPayloadError";
  }
}

export type Obfuscator = {
  encode: (value: string) => string;
  decode: (value: string) => string;
};

const VERSION = "v1" as const;
const PAYLOAD_SEPARATOR = ".";
const TAG_LENGTH = 32;
const MAX_KEY_LENGTH = 1024;

function ensureValidKey(key: string): string {
  if (typeof key !== "string" || key.length === 0 || key.trim().length === 0) {
    throw new InvalidKeyError();
  }

  if (key.length > MAX_KEY_LENGTH) {
    throw new InvalidKeyError("Key is too long.");
  }

  return key;
}

function toBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function fromBytes(value: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(value);
}

function toBase64Url(value: Uint8Array): string {
  let binary = "";

  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function rotateRight(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function sha256Transform(state: Uint32Array, chunk: Uint8Array): void {
  const words = new Uint32Array(64);

  for (let index = 0; index < 16; index += 1) {
    const offset = index * 4;
    words[index] =
      ((chunk[offset] << 24) |
        (chunk[offset + 1] << 16) |
        (chunk[offset + 2] << 8) |
        chunk[offset + 3]) >>>
      0;
  }

  for (let index = 16; index < 64; index += 1) {
    const s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3);
    const s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10);
    words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
  }

  let a = state[0];
  let b = state[1];
  let c = state[2];
  let d = state[3];
  let e = state[4];
  let f = state[5];
  let g = state[6];
  let h = state[7];

  for (let index = 0; index < 64; index += 1) {
    const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
    const ch = ((e & f) ^ (~e & g)) >>> 0;
    const temp1 = (h + s1 + ch + ROUND_CONSTANTS[index] + words[index]) >>> 0;
    const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
    const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
    const temp2 = (s0 + maj) >>> 0;

    h = g;
    g = f;
    f = e;
    e = (d + temp1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (temp1 + temp2) >>> 0;
  }

  state[0] = (state[0] + a) >>> 0;
  state[1] = (state[1] + b) >>> 0;
  state[2] = (state[2] + c) >>> 0;
  state[3] = (state[3] + d) >>> 0;
  state[4] = (state[4] + e) >>> 0;
  state[5] = (state[5] + f) >>> 0;
  state[6] = (state[6] + g) >>> 0;
  state[7] = (state[7] + h) >>> 0;
}

function sha256(data: Uint8Array): Uint8Array {
  const state = new Uint32Array(INITIAL_HASH);
  const bitLength = data.length * 8;
  const padded = new Uint8Array(((data.length + 9 + 63) & ~63) >>> 0);

  padded.set(data, 0);
  padded[data.length] = 0x80;

  const lengthOffset = padded.length - 8;
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  view.setUint32(lengthOffset, bitLength >>> 32, false);
  view.setUint32(lengthOffset + 4, bitLength >>> 0, false);

  for (let offset = 0; offset < padded.length; offset += 64) {
    sha256Transform(state, padded.slice(offset, offset + 64));
  }

  const output = new Uint8Array(32);
  const outView = new DataView(output.buffer);

  for (let index = 0; index < 8; index += 1) {
    outView.setUint32(index * 4, state[index], false);
  }

  return output;
}

function hmacSha256(secret: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  const key = secret.length > blockSize ? sha256(secret) : secret;
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(key, 0);

  const inner = new Uint8Array(blockSize + message.length);
  const outer = new Uint8Array(blockSize + 32);

  for (let index = 0; index < blockSize; index += 1) {
    inner[index] = paddedKey[index] ^ 0x36;
    outer[index] = paddedKey[index] ^ 0x5c;
  }

  inner.set(message, blockSize);
  outer.set(sha256(inner), blockSize);

  return sha256(outer);
}

function deriveKeystream(secret: string, length: number): Uint8Array {
  const output = new Uint8Array(length);
  const secretBytes = toBytes(secret);
  let position = 0;
  let blockIndex = 0;

  while (position < length) {
    const counter = new TextEncoder().encode(`${HMAC_PREFIX}:${blockIndex}`);
    const block = hmacSha256(secretBytes, counter);
    const chunkLength = Math.min(block.length, length - position);
    output.set(block.slice(0, chunkLength), position);
    position += chunkLength;
    blockIndex += 1;
  }

  return output;
}

function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(Math.max(a.length, b.length));

  for (let index = 0; index < result.length; index += 1) {
    const sourceA = index < a.length ? a[index] ?? 0 : 0;
    const sourceB = index < b.length ? b[index] ?? 0 : 0;
    result[index] = sourceA ^ sourceB;
  }

  return result.slice(0, Math.max(a.length, b.length));
}

function uint8ArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}

function computeTag(secret: string, ciphertext: Uint8Array): Uint8Array {
  return hmacSha256(toBytes(secret), ciphertext);
}

function encodePayload(value: string, key: string): string {
  const normalizedKey = ensureValidKey(key);
  const plaintext = toBytes(value);
  const keystream = deriveKeystream(normalizedKey, plaintext.length);
  const ciphertext = xor(plaintext, keystream).slice(0, plaintext.length);
  const tag = computeTag(normalizedKey, ciphertext);
  const payload = new Uint8Array(ciphertext.length + tag.length);

  payload.set(ciphertext, 0);
  payload.set(tag, ciphertext.length);

  return `${VERSION}${PAYLOAD_SEPARATOR}${toBase64Url(payload)}`;
}

function decodePayload(encodedValue: string, key: string): string {
  const normalizedKey = ensureValidKey(key);

  if (typeof encodedValue !== "string" || encodedValue.length === 0) {
    throw new InvalidPayloadError("Encoded value is required.");
  }

  const [version, payload] = encodedValue.split(PAYLOAD_SEPARATOR, 2);

  if (version !== VERSION || typeof payload !== "string" || payload.length === 0) {
    throw new InvalidPayloadError("Unsupported or malformed payload version.");
  }

  let decoded: Uint8Array;

  try {
    decoded = fromBase64Url(payload);
  } catch {
    throw new InvalidPayloadError("Payload is not valid base64url.");
  }

  if (decoded.length < TAG_LENGTH) {
    throw new InvalidPayloadError("Payload is missing authentication data.");
  }

  const ciphertextLength = decoded.length - TAG_LENGTH;
  const ciphertext = decoded.slice(0, ciphertextLength);
  const expectedTag = decoded.slice(ciphertextLength);
  const actualTag = computeTag(normalizedKey, ciphertext);

  if (!uint8ArrayEquals(actualTag, expectedTag)) {
    throw new InvalidKeyError("The supplied key does not match the encoded value.");
  }

  const keystream = deriveKeystream(normalizedKey, ciphertext.length);
  const plaintext = xor(ciphertext, keystream).slice(0, ciphertext.length);

  return fromBytes(plaintext);
}

export function obfuscate(value: string, key: string): string {
  return encodePayload(value, key);
}

export function deobfuscate(value: string, key: string): string {
  return decodePayload(value, key);
}

export function createObfuscator(key: string): Obfuscator {
  const normalizedKey = ensureValidKey(key);

  return {
    encode(value: string): string {
      return obfuscate(value, normalizedKey);
    },
    decode(value: string): string {
      return deobfuscate(value, normalizedKey);
    },
  };
}
