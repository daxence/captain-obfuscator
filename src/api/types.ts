export type Obfuscator = {
  encode: (value: string) => string;
  decode: (value: string) => string;
};
