import { createObfuscator, deobfuscate, obfuscate } from "./api/api";
import type { Obfuscator } from "./api/types";
import { InvalidKeyError, InvalidPayloadError, ObfuscationError } from "./domain/errors";

export { InvalidKeyError, InvalidPayloadError, ObfuscationError };
export { createObfuscator, deobfuscate, obfuscate };
export type { Obfuscator };
