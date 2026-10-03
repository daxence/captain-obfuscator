export function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(Math.max(a.length, b.length));

  for (let index = 0; index < result.length; index += 1) {
    const sourceA = index < a.length ? a[index] : 0;
    const sourceB = index < b.length ? b[index] : 0;
    result[index] = sourceA ^ sourceB;
  }

  return result.slice(0, Math.max(a.length, b.length));
}

export function uint8ArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
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
