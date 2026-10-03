import { PAYLOAD_SEPARATOR, TAG_LENGTH, VERSION } from "../config/constants";
import { deriveKeystream, computeTag } from "../crypto/hmac";
import { InvalidKeyError, InvalidPayloadError } from "../domain/errors";
import { uint8ArrayEquals, xor } from "../utils/bytes";
import { fromBase64Url, fromBytes, toBase64Url, toBytes } from "../utils/encoding";

import { ensureValidKey } from "./key-validation";

export function encodePayload(value: string, key: string): string {
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

export function decodePayload(encodedValue: string, key: string): string {
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
