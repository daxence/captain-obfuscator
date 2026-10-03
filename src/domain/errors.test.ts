import { describe, expect, it } from "vitest";

import { ObfuscationError } from "./errors";

describe("domain errors", () => {
  it("exposes explicit error types", () => {
    const err = new ObfuscationError("message");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ObfuscationError");
  });
});
