# captain-obfuscator

A small, deterministic string obfuscation library for opaque identifiers, metadata, and URL-safe values.

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](https://github.com/daxence/captain-obfuscator/actions)
[![npm](https://img.shields.io/badge/npm-v0.1.0-blue)](https://www.npmjs.com/package/@daxence/captain-obfuscator)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Demo

Try the live demo here: https://tools-hub.work/tools/captain-obfuscator/

## Installation

```bash
npm install @daxence/captain-obfuscator
# or
pnpm add @daxence/captain-obfuscator
```

## Quick start

```ts
import { obfuscate, deobfuscate, createObfuscator } from "@daxence/captain-obfuscator";

const encoded = obfuscate("customer-123", "my-key");
const decoded = deobfuscate(encoded, "my-key");

console.log(encoded);
console.log(decoded); // "customer-123"

const codec = createObfuscator("my-key");
console.log(codec.encode("hello world"));
console.log(codec.decode(codec.encode("hello world")));
```

## Deterministic behavior

This library is designed to be deterministic: the same string and the same key always produce the same encoded output.

```ts
obfuscate("hello world", "my-key") === obfuscate("hello world", "my-key");
```

That makes it useful for generating stable opaque values for internal identifiers, metadata, or URL-safe tokens where reversibility is helpful and where equality should be preserved.

## API

### `obfuscate(value: string, key: string): string`

Returns a deterministic, URL-safe encoded string.

### `deobfuscate(value: string, key: string): string`

Decodes a previously encoded string. Throws `ObfuscationError` for malformed input or invalid payloads.

### `createObfuscator(key: string): { encode(value: string): string; decode(value: string): string }`

Creates a reusable codec bound to a single key.

## Security considerations

This is not secure encryption and should not be described as such.

This library intentionally uses a deterministic, reversible encoding scheme built from a standard authenticated encryption primitive. That means:

- it is useful for stable opaque identifiers and metadata transport
- it is not suitable for password storage, session secrets, or sensitive data protection without a separate security design
- the result leaks equality: identical plaintext and key yields identical encoded output
- keys embedded in client-side JavaScript are not secrets
- a wrong key should fail to decode and may throw a structured error

For a deeper threat model and guidance, see [SECURITY.md](SECURITY.md).

## Error handling

The library throws a small set of explicit errors for predictable behavior:

```ts
import {
  ObfuscationError,
  InvalidKeyError,
  InvalidPayloadError,
} from "@daxence/captain-obfuscator";
```

Common cases include:

- empty or invalid key
- malformed encoded value
- payload version mismatch
- authentication failure when decoding with the wrong key
- corrupted data after the encoded payload

## Compatibility and versioning

The encoded payload includes a version prefix so future releases can evolve the format without breaking older values. A major version bump is required before changing the encoding format in a way that is incompatible with previous payloads.

## Development

```bash
git clone <repo>
pnpm install
pnpm test
pnpm build
```

## Releasing a new version (semantic-release)

This repository uses `semantic-release` and publishes from `main`.

1. Use Conventional Commits in your merged changes:

- `feat:` triggers a minor release
- `fix:` triggers a patch release
- `BREAKING CHANGE:` triggers a major release

2. Push (or merge) the commits to `main`.
3. GitHub Actions runs the CI workflow, then triggers the release workflow.
4. The release workflow runs `pnpm release` and automatically updates:

- npm package version
- GitHub release
- `CHANGELOG.md`

Optional local check:

```bash
pnpm release --dry-run
```

## Contributing

Contributions are welcome. Please open an issue or PR with a clear description and tests.

## License

MIT
