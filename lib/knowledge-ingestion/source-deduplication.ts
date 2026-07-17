import type { SavedKnowledgeSource } from "@/lib/knowledge-ingestion/source-ingestion.types";
import type { CanonicalKnowledgeSource } from "@/lib/knowledge-connectors/types";

export function normalizeDoi(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim().toLowerCase();
  const withoutPrefix = value.replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
  return withoutPrefix.replace(/^doi:/, "");
}

export function buildDedupeKeyFromCanonical(source: CanonicalKnowledgeSource): string {
  const doi = normalizeDoi(
    source.identifiers.find((id) => id.scheme.toLowerCase() === "doi")?.value ?? source.canonicalId,
  );
  if (doi) return `doi:${doi}`;
  if (source.provenance.providerRecordId) {
    return `${source.provider}:${source.provenance.providerRecordId}`;
  }
  const firstAuthor = source.authors[0]?.split(" ").pop()?.toLowerCase() ?? "";
  const year = source.publicationDate?.slice(0, 4) ?? "";
  const title = source.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `probable:${title}:${year}:${firstAuthor}`;
}

export function findDuplicateSavedSource(
  sources: readonly SavedKnowledgeSource[],
  canonical: CanonicalKnowledgeSource,
): SavedKnowledgeSource | null {
  const key = buildDedupeKeyFromCanonical(canonical);
  const doi = normalizeDoi(
    canonical.identifiers.find((id) => id.scheme.toLowerCase() === "doi")?.value ?? canonical.canonicalId,
  );

  if (doi) {
    const byDoi = sources.find((s) => normalizeDoi(s.doi) === doi);
    if (byDoi) return byDoi;
  }

  if (key.startsWith("probable:")) {
    return null;
  }

  return sources.find((s) => {
    if (s.provider === canonical.provider && s.providerRecordId === canonical.provenance.providerRecordId) {
      return true;
    }
    return false;
  }) ?? null;
}
