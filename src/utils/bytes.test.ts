import { describe, expect, it } from "vitest";

import { uint8ArrayEquals, xor } from "./bytes";

describe("bytes utils", () => {
  it("xors arrays with different lengths", () => {
    expect(Array.from(xor(new Uint8Array([1]), new Uint8Array([2, 3])))).toEqual([3, 3]);
    expect(Array.from(xor(new Uint8Array([2, 3]), new Uint8Array([1])))).toEqual([3, 3]);
  });

  it("compares byte arrays by value and length", () => {
    expect(uint8ArrayEquals(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
    expect(uint8ArrayEquals(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false);
    expect(uint8ArrayEquals(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
  });
});
