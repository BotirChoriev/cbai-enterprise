/**
 * Real password hashing for the local account system — Web Crypto's SHA-256, available in every
 * modern browser and in Node without an import. A random salt per user (`crypto.getRandomValues`)
 * means two users with the same password never produce the same stored hash. This is real
 * cryptographic hashing, not plaintext storage — but it is still a client-side-only credential
 * check with no server, so it is not equivalent to a real backend auth system. See auth-types.ts's
 * LOCAL_ACCOUNT_NOTICE.
 */

function getCrypto(): Crypto {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto is not available in this environment.");
  }
  return crypto;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  getCrypto().getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const digest = await getCrypto().subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashPassword(password, salt);
  return actualHash === expectedHash;
}
