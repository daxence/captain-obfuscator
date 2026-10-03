import { ensureValidKey } from "../core/key-validation";
import { decodePayload, encodePayload } from "../core/payload";

import type { Obfuscator } from "./types";

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
