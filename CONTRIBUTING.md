# Contributing

Thanks for contributing to captain-obfuscator.

## Workflow

1. Fork and clone the repository.
2. Install dependencies with Yarn.
3. Create a focused branch.
4. Add or update tests for any behavior change.
5. Run the validation commands before opening a PR.

## Validation

```bash
yarn lint
yarn typecheck
yarn test
yarn test:coverage
yarn build
```

## Commit style

This project uses conventional commits where practical.

Examples:

- `feat: add deterministic obfuscation API`
- `fix: reject malformed payloads`
- `docs: improve README examples`
- `test: add Unicode payload coverage`
