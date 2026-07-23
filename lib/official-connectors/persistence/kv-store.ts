/**
 * Cloudflare KV / D1-ready persistence for verified observations.
 * When no binding is present, falls back to in-memory only and reports status honestly.
 */

import type { ObservationVersionRecord } from "@/lib/official-connectors/store";
import type { ConnectorHealthSnapshot, VerifiedObservation } from "@/lib/official-connectors/types";

export type EvidenceKvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

export type PersistenceStatus = {
  readonly backend: "kv" | "memory";
  readonly message: string;
};

export type PersistedBundle = {
  readonly immutableSourceRecords: readonly {
    readonly sourceSlug: string;
    readonly sourceName: string;
    readonly officialSourceUrl: string;
  }[];
  readonly versions: readonly ObservationVersionRecord[];
  readonly healthHistory: readonly ConnectorHealthSnapshot[];
  readonly writtenAt: string;
};

const MEMORY_KEY = "evidence:verified:bundle";
const memory = new Map<string, string>();

export function persistenceStatus(kv?: EvidenceKvNamespace | null): PersistenceStatus {
  if (kv) {
    return {
      backend: "kv",
      message: "Cloudflare KV binding EVIDENCE_OBSERVATIONS_KV is available",
    };
  }
  return {
    backend: "memory",
    message: "No KV binding — versions retained in Function isolate memory only for this request lifecycle",
  };
}

export async function persistVerifiedBundle(
  bundle: PersistedBundle,
  kv?: EvidenceKvNamespace | null,
): Promise<PersistenceStatus> {
  const serialized = JSON.stringify(bundle);
  if (kv) {
    await kv.put(MEMORY_KEY, serialized);
    return persistenceStatus(kv);
  }
  memory.set(MEMORY_KEY, serialized);
  return persistenceStatus(null);
}

export async function loadVerifiedBundle(
  kv?: EvidenceKvNamespace | null,
): Promise<PersistedBundle | null> {
  const raw = kv ? await kv.get(MEMORY_KEY) : memory.get(MEMORY_KEY) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedBundle;
  } catch {
    return null;
  }
}

export function buildImmutableSourceRecords(
  observations: readonly VerifiedObservation[],
): PersistedBundle["immutableSourceRecords"] {
  const bySlug = new Map<string, PersistedBundle["immutableSourceRecords"][number]>();
  for (const item of observations) {
    if (bySlug.has(item.provenance.sourceSlug)) continue;
    bySlug.set(item.provenance.sourceSlug, {
      sourceSlug: item.provenance.sourceSlug,
      sourceName: item.provenance.sourceName,
      officialSourceUrl: item.provenance.sourceUrl,
    });
  }
  return [...bySlug.values()];
}
