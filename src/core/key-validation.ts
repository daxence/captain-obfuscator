import { MAX_KEY_LENGTH } from "../config/constants";
import { InvalidKeyError } from "../domain/errors";

export function ensureValidKey(key: string): string {
  if (typeof key !== "string" || key.length === 0 || key.trim().length === 0) {
    throw new InvalidKeyError();
  }

  if (key.length > MAX_KEY_LENGTH) {
    throw new InvalidKeyError("Key is too long.");
  }

  return key;
}
