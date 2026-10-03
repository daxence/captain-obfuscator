import { INITIAL_HASH, ROUND_CONSTANTS } from "../config/constants";

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
    const s0 =
      rotateRight(words[index - 15], 7) ^
      rotateRight(words[index - 15], 18) ^
      (words[index - 15] >>> 3);
    const s1 =
      rotateRight(words[index - 2], 17) ^
      rotateRight(words[index - 2], 19) ^
      (words[index - 2] >>> 10);
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

export function sha256(data: Uint8Array): Uint8Array {
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
