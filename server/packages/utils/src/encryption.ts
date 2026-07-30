import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Encrypts a plain-text string using AES-256-GCM.
 * @param text  Plain text to encrypt
 * @param key   32-byte hex key (64 hex chars) — store in env as REFRESH_TOKEN_ENCRYPTION_KEY
 * @returns     `iv:authTag:ciphertext` — all hex-encoded, safe to store in DB
 */
export function encrypt(text: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex");
  const iv = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a value produced by `encrypt()`.
 * @param encryptedText  `iv:authTag:ciphertext` hex string
 * @param key            Same 32-byte hex key used during encryption
 * @returns              Original plain-text string
 */
export function decrypt(encryptedText: string, key: string): string {
  const [ivHex, authTagHex, cipherHex] = encryptedText.split(":");
  if (!ivHex || !authTagHex || !cipherHex) {
    throw new Error("Invalid encrypted token format");
  }

  const keyBuffer = Buffer.from(key, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const cipherText = Buffer.from(cipherHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(cipherText),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Produces a SHA-256 hex digest of a refresh token.
 * Store the hash in the DB; send only the raw token to the client.
 * To verify an incoming token: hash it and compare against the stored value.
 *
 * @param token  Raw refresh token (e.g. 48-byte hex string)
 * @returns      64-char hex SHA-256 digest
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
