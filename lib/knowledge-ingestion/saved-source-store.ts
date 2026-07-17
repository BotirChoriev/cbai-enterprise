/**
 * BUILD-028.5 — Persisted saved knowledge sources (device-local, namespaced).
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { getCurrentUserId } from "@/lib/auth/auth-store";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";
import { recordConfirmedMutation } from "@/lib/telemetry/workflow-telemetry";
import type {
  SavedKnowledgeSource,
  SourceIngestionState,
  SourceLifecycleTransition,
} from "@/lib/knowledge-ingestion/source-ingestion.types";
import { SAVED_SOURCE_SCHEMA_VERSION } from "@/lib/knowledge-ingestion/source-ingestion.types";
import { assertSourceLifecycleTransition } from "@/lib/knowledge-ingestion/source-lifecycle";
import {
  buildDedupeKeyFromCanonical,
  findDuplicateSavedSource,
  normalizeDoi,
} from "@/lib/knowledge-ingestion/source-deduplication";
import type { CanonicalKnowledgeSource } from "@/lib/knowledge-connectors/types";

const SOURCES_KEY = "cbai-saved-knowledge-sources";
const TRANSITIONS_KEY = "cbai-source-lifecycle-transitions";

const memorySources: SavedKnowledgeSource[] = [];
const memoryTransitions: SourceLifecycleTransition[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (v: unknown) => v is T): T[] {
  if (!isBrowser()) {
    if (key === SOURCES_KEY) return memorySources.filter(isValid) as T[];
    if (key === TRANSITIONS_KEY) return memoryTransitions.filter(isValid) as T[];
    return [];
  }
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: readonly T[]): void {
  if (!isBrowser()) {
    if (key === SOURCES_KEY) {
      memorySources.length = 0;
      memorySources.push(...(items as unknown as SavedKnowledgeSource[]));
    } else if (key === TRANSITIONS_KEY) {
      memoryTransitions.length = 0;
      memoryTransitions.push(...(items as unknown as SourceLifecycleTransition[]));
    }
    return;
  }
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(items));
}

function isSavedSource(v: unknown): v is SavedKnowledgeSource {
  const s = v as SavedKnowledgeSource;
  return (
    typeof s === "object" &&
    s !== null &&
    typeof s.id === "string" &&
    typeof s.title === "string" &&
    typeof s.lifecycleState === "string"
  );
}

function isTransition(v: unknown): v is SourceLifecycleTransition {
  const t = v as SourceLifecycleTransition;
  return (
    typeof t === "object" &&
    t !== null &&
    typeof t.sourceId === "string" &&
    typeof t.fromState === "string" &&
    typeof t.toState === "string"
  );
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveIngestionActorId(): string {
  return getCurrentUserId() ?? "device-local";
}

export function loadSavedKnowledgeSources(): SavedKnowledgeSource[] {
  return readList(SOURCES_KEY, isSavedSource).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function loadSavedKnowledgeSource(sourceId: string): SavedKnowledgeSource | null {
  return loadSavedKnowledgeSources().find((s) => s.id === sourceId) ?? null;
}

export function loadSavedSourcesForMission(missionId: string): SavedKnowledgeSource[] {
  return loadSavedKnowledgeSources().filter((s) =>
    s.missionRelations.some((r) => r.missionId === missionId),
  );
}

function recordTransition(transition: SourceLifecycleTransition): void {
  const all = readList(TRANSITIONS_KEY, isTransition);
  writeList(TRANSITIONS_KEY, [...all, transition]);
}

function persistSource(updated: SavedKnowledgeSource, fromState: SourceIngestionState, reason?: string): SavedKnowledgeSource {
  const all = readList(SOURCES_KEY, isSavedSource);
  const index = all.findIndex((s) => s.id === updated.id);
  const next = index >= 0 ? all.map((s, i) => (i === index ? updated : s)) : [...all, updated];
  writeList(SOURCES_KEY, next);
  recordTransition({
    sourceId: updated.id,
    fromState,
    toState: updated.lifecycleState,
    actor: resolveIngestionActorId(),
    timestamp: new Date().toISOString(),
    reason: reason ?? null,
    missionId: updated.missionRelations[0]?.missionId ?? null,
  });
  notifyMissionDataChanged("evidence");
  return updated;
}

function parseAuthors(canonical: CanonicalKnowledgeSource): SavedKnowledgeSource["authors"] {
  return canonical.authors.map((name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return { displayName: name };
    return {
      givenName: parts.slice(0, -1).join(" "),
      familyName: parts[parts.length - 1] ?? null,
      displayName: name,
    };
  });
}

export type SaveSourceResult =
  | { readonly ok: true; readonly source: SavedKnowledgeSource; readonly duplicate: boolean }
  | { readonly ok: false; readonly error: "duplicate_probable" | "invalid" };

export function saveKnowledgeSourceFromCanonical(
  canonical: CanonicalKnowledgeSource,
): SaveSourceResult {
  const existing = findDuplicateSavedSource(loadSavedKnowledgeSources(), canonical);
  if (existing) {
    return { ok: true, source: existing, duplicate: true };
  }

  const doi = normalizeDoi(
    canonical.identifiers.find((id) => id.scheme.toLowerCase() === "doi")?.value ?? canonical.canonicalId,
  );
  const key = buildDedupeKeyFromCanonical(canonical);
  if (key.startsWith("probable:") && !doi) {
    // Allow save but no silent merge on probable keys
  }

  const now = new Date().toISOString();
  const actor = resolveIngestionActorId();
  const source: SavedKnowledgeSource = {
    id: newId("src"),
    schemaVersion: SAVED_SOURCE_SCHEMA_VERSION,
    canonicalId: canonical.canonicalId,
    provider: canonical.provider,
    providerRecordId: canonical.provenance.providerRecordId,
    sourceType: canonical.sourceType,
    title: canonical.title,
    authors: parseAuthors(canonical),
    publicationDate: canonical.publicationDate,
    doi: doi ?? null,
    landingPageUrl: canonical.landingPageUrl,
    retrievedAt: canonical.retrievedAt,
    savedAt: now,
    savedBy: actor,
    provenance: canonical.provenance,
    lifecycleState: "saved_source",
    trustState: "source_available",
    abstract: canonical.abstract,
    abstractAvailability: canonical.abstract?.trim()
      ? "provider_supplied"
      : "not_supplied",
    limitations: canonical.limitations.map((message) => ({ message })),
    missionRelations: [],
    humanReviewState: "not_requested",
  };

  persistSource(source, "search_result", "User saved Crossref metadata");
  recordConfirmedMutation("source_saved", { objectType: "saved_source", objectId: source.id });
  return { ok: true, source, duplicate: false };
}

export function linkSavedSourceToMission(
  sourceId: string,
  missionId: string,
  relevanceNote?: string | null,
): SavedKnowledgeSource | null {
  const source = loadSavedKnowledgeSource(sourceId);
  if (!source) return null;
  if (source.missionRelations.some((r) => r.missionId === missionId)) return source;

  assertSourceLifecycleTransition(source.lifecycleState, "linked_to_mission");
  const fromState = source.lifecycleState;
  const now = new Date().toISOString();
  const actor = resolveIngestionActorId();
  const updated: SavedKnowledgeSource = {
    ...source,
    lifecycleState: "linked_to_mission",
    trustState: "needs_review",
    humanReviewState: "not_requested",
    missionRelations: [
      ...source.missionRelations,
      { missionId, linkedAt: now, linkedBy: actor, relevanceNote: relevanceNote ?? null },
    ],
  };
  persistSource(updated, fromState, "Linked to mission");
  recordConfirmedMutation("source_linked_to_mission", {
    objectType: "saved_source",
    objectId: sourceId,
    metadata: { missionId },
  });
  return updated;
}

export function requestSavedSourceReview(sourceId: string): SavedKnowledgeSource | null {
  const source = loadSavedKnowledgeSource(sourceId);
  if (!source) return null;
  if (source.missionRelations.length === 0) return null;

  assertSourceLifecycleTransition(source.lifecycleState, "awaiting_review");
  const fromState = source.lifecycleState;
  const updated: SavedKnowledgeSource = {
    ...source,
    lifecycleState: "awaiting_review",
    humanReviewState: "awaiting_review",
    trustState: "needs_review",
  };
  persistSource(updated, fromState, "Review requested");
  recordConfirmedMutation("source_review_requested", {
    objectType: "saved_source",
    objectId: sourceId,
  });
  return updated;
}

export function updateSavedSourceRecord(source: SavedKnowledgeSource, fromState: SourceIngestionState): SavedKnowledgeSource {
  return persistSource(source, fromState);
}

/** Test helper — clear in-memory and local storage sources. */
export function clearSavedKnowledgeSourcesForTests(): void {
  memorySources.length = 0;
  memoryTransitions.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(SOURCES_KEY));
  window.localStorage.removeItem(resolveStorageKey(TRANSITIONS_KEY));
}
