import { HMAC_PREFIX } from "../config/constants";
import { toBytes } from "../utils/encoding";

import { sha256 } from "./sha256";

export function hmacSha256(secret: Uint8Array, message: Uint8Array): Uint8Array {
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

export function deriveKeystream(secret: string, length: number): Uint8Array {
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

export function computeTag(secret: string, ciphertext: Uint8Array): Uint8Array {
  return hmacSha256(toBytes(secret), ciphertext);
}
