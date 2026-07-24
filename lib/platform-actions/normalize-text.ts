/** Text normalization for deterministic intent matching across locales. */

export function normalizePlatformText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`ʻʼ]/g, "'")
    .replace(/\s+/g, " ");
}

export function containsNormalizedPhrase(haystack: string, phrase: string): boolean {
  const normalizedHaystack = normalizePlatformText(haystack);
  const normalizedPhrase = normalizePlatformText(phrase);
  if (!normalizedPhrase) return false;
  return normalizedHaystack.includes(normalizedPhrase);
}

export function exactNormalizedMatch(a: string, b: string): boolean {
  return normalizePlatformText(a) === normalizePlatformText(b);
}
