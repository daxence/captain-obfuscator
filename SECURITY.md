# Security

## Threat model

This library provides deterministic reversible encoding for use cases like opaque identifiers or stable metadata values. It is not designed as a general-purpose encryption system for protecting highly sensitive secrets.

## What it protects against

- accidental exposure of an internal identifier when stored in a URL or parameter
- stable opaque references that do not reveal the original value directly
- cross-system use of a consistent, reversible representation

## What it does not protect against

- secret storage of passwords or API keys
- protection from user-controlled code running in the same environment
- offline brute-force attacks if weak keys are used
- security guarantees for values embedded in frontend JavaScript
- suitability for regulated secret handling without a broader design review

## Deterministic output

The encoded form is deterministic. The same plaintext and key produce the same output. This leaks equality information and should be considered as part of the threat model.

## Key handling

The key is a passphrase, not a secret storage mechanism. If a key is included in browser code, it is not secret. Use a backend secret store for any truly sensitive use case.

## Recommended usage

- prefer for opaque identifiers and non-sensitive metadata
- do not use for password hashing or direct secret storage
- do not assume this is equivalent to authenticated encryption in all contexts

## Reporting vulnerabilities

Please contact the maintainer privately via the GitHub security advisory flow or repository contact method. Do not open a public issue for a vulnerability report.
