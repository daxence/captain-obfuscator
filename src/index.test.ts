import {
  InvalidKeyError,
  InvalidPayloadError,
  ObfuscationError,
  createObfuscator,
  deobfuscate,
  obfuscate,
} from "./index";

import { describe, expect, it } from "vitest";

describe("captain-obfuscator", () => {
  it("round-trips ASCII values", () => {
    const value = "hello world";
    const encoded = obfuscate(value, "my-key");

    expect(encoded).toBeTypeOf("string");
    expect(encoded).not.toBe(value);
    expect(deobfuscate(encoded, "my-key")).toBe(value);
  });

  it("is deterministic", () => {
    const value = "customer-123";
    const key = "my-super-secret";

    expect(obfuscate(value, key)).toBe(obfuscate(value, key));
  });

  it("changes output for different keys and values", () => {
    expect(obfuscate("alpha", "key-1")).not.toBe(obfuscate("alpha", "key-2"));
    expect(obfuscate("alpha", "key-1")).not.toBe(obfuscate("beta", "key-1"));
  });

  it("supports empty strings and unicode", () => {
    expect(deobfuscate(obfuscate("", "my-key"), "my-key")).toBe("");
    expect(deobfuscate(obfuscate("héllo 🌍 العربية", "unicode-key"), "unicode-key")).toBe(
      "héllo 🌍 العربية",
    );
  });

  it("handles multiline, JSON, and special characters", () => {
    const samples = [
      "line 1\nline 2",
      '{"user":"alice","active":true}',
      "!@#$%^&*()_+-=[]{}|;:',.<>/?\\`~",
      "ça va? oui!",
      "emoji 😀😀😀",
      "Arabic: مرحبا بالعالم",
    ];

    for (const sample of samples) {
      const encoded = obfuscate(sample, "special-key");
      expect(deobfuscate(encoded, "special-key")).toBe(sample);
    }
  });

  it("rejects empty or invalid keys", () => {
    expect(() => obfuscate("hello", "")).toThrow(InvalidKeyError);
    expect(() => deobfuscate("v1.test", "")).toThrow(InvalidKeyError);
    expect(() => createObfuscator("")).toThrow(InvalidKeyError);
  });

  it("throws on wrong key and malformed payload", () => {
    const encoded = obfuscate("hello world", "valid-key");

    expect(() => deobfuscate(encoded, "wrong-key")).toThrow(InvalidKeyError);
    expect(() => deobfuscate("not-valid", "valid-key")).toThrow(InvalidPayloadError);
    expect(() => deobfuscate("v1.", "valid-key")).toThrow(InvalidPayloadError);
    expect(() => deobfuscate("v1", "valid-key")).toThrow(InvalidPayloadError);
    expect(() => deobfuscate("v1.invalid-base64!!!", "valid-key")).toThrow(InvalidPayloadError);
    expect(() => deobfuscate("v2.invalid", "valid-key")).toThrow(InvalidPayloadError);
    expect(() => deobfuscate("v1.abc", "valid-key")).toThrow(InvalidPayloadError);
  });

  it("rejects oversized keys and empty payload strings", () => {
    const oversized = "x".repeat(2000);
    expect(() => obfuscate("hello", oversized)).toThrow(InvalidKeyError);
    expect(() => deobfuscate("", "valid-key")).toThrow(InvalidPayloadError);
    expect(() => deobfuscate("v1.", "   ")).toThrow(InvalidKeyError);
  });

  it("supports reusable codec instances", () => {
    const codec = createObfuscator("instance-key");
    const encoded = codec.encode("hello");

    expect(codec.decode(encoded)).toBe("hello");
    expect(codec.decode(codec.encode("hello"))).toBe("hello");
  });

  it("handles large strings and fuzz-like round trips", () => {
    const inputs: string[] = [];

    for (let i = 0; i < 200; i += 1) {
      inputs.push(
        `${"x".repeat(i % 7)}-${i}-${"こんにちは".repeat((i % 11) + 1)}-${"emoji 😀".repeat((i % 5) + 1)}`,
      );
    }

    for (const input of inputs) {
      const encoded = obfuscate(input, "big-key");
      expect(deobfuscate(encoded, "big-key")).toBe(input);
    }
  });

  it("returns predictable versioned payloads", () => {
    const encoded = obfuscate("version-test", "v1");

    expect(encoded.startsWith("v1.")).toBe(true);
    expect(() => deobfuscate(encoded, "v1")).not.toThrow();
  });

  it("exposes explicit error types", () => {
    const err = new ObfuscationError("message");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ObfuscationError");
  });
});
