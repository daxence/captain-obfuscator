export class ObfuscationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObfuscationError";
  }
}

export class InvalidKeyError extends ObfuscationError {
  constructor(message = "A non-empty key is required.") {
    super(message);
    this.name = "InvalidKeyError";
  }
}

export class InvalidPayloadError extends ObfuscationError {
  constructor(message = "Encoded payload is invalid or corrupted.") {
    super(message);
    this.name = "InvalidPayloadError";
  }
}
