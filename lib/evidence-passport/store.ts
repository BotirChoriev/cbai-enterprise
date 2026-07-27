import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import {
  fingerprintPassport,
  migrateEvidencePassport,
  migrateEvidencePassportCollection,
} from "@/lib/evidence-passport/migrate";
import type { CreateEvidencePassportInput, EvidencePassport } from "@/lib/evidence-passport/types";
import { EVIDENCE_PASSPORT_SCHEMA_VERSION } from "@/lib/evidence-passport/types";

const STORAGE_KEY = "cbai-evidence-passports";
const memory: EvidencePassport[] = [];
const createOnce = new Set<string>();

/** Stable empty snapshot for SSR / useSyncExternalStore getServerSnapshot. */
const EMPTY_EVIDENCE_PASSPORTS: readonly EvidencePassport[] = [];

/**
 * Referentially stable client snapshot for useSyncExternalStore getSnapshot.
 * Updated only on create / confirm / reset / remove / cross-tab storage change.
 */
let cachedSnapshot: readonly EvidencePassport[] = EMPTY_EVIDENCE_PASSPORTS;
let snapshotReady = false;

function isBrowser() {
  return typeof window !== "undefined";
}
function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function readRaw(): unknown {
  if (!isBrowser()) return memory;
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function sortPassports(list: readonly EvidencePassport[]): EvidencePassport[] {
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function commitSnapshot(list: readonly EvidencePassport[]): readonly EvidencePassport[] {
  const sorted = list.length === 0 ? EMPTY_EVIDENCE_PASSPORTS : sortPassports(list);
  cachedSnapshot = sorted;
  snapshotReady = true;
  return cachedSnapshot;
}

function invalidateSnapshot(): void {
  snapshotReady = false;
}

function writeAll(list: EvidencePassport[]) {
  memory.length = 0;
  memory.push(...list);
  commitSnapshot(list);
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(list));
  window.dispatchEvent(new Event("cbai-evidence-passports-changed"));
}

export function listEvidencePassports(): EvidencePassport[] {
  if (snapshotReady) return cachedSnapshot as EvidencePassport[];
  return commitSnapshot(migrateEvidencePassportCollection(readRaw())) as EvidencePassport[];
}

export function getEvidencePassport(passportId: string): EvidencePassport | null {
  return listEvidencePassports().find((p) => p.passportId === passportId) ?? null;
}

export function createEvidencePassport(input: CreateEvidencePassportInput): EvidencePassport {
  if (input.confirmCreate !== true) {
    throw new Error("Evidence Passport requires explicit confirmation.");
  }
  const original = input.originalSourceContent.trim();
  if (!original) throw new Error("originalSourceContent_required");
  const claimText = input.claimText.trim();
  if (!claimText) throw new Error("claimText_required");

  const key = `${claimText}|${original}|${input.directSourceUrl ?? ""}`.toLowerCase();
  if (createOnce.has(key)) {
    const existing = listEvidencePassports().find(
      (p) =>
        p.claimText.toLowerCase() === claimText.toLowerCase() && p.originalSourceContent === original,
    );
    if (existing) return existing;
  }
  createOnce.add(key);

  const now = new Date().toISOString();
  const evidenceId = input.evidenceId?.trim() || newId("ev");
  const passportId = newId("passport");
  const locale = input.createdLocale ?? input.contentLocale ?? "en";
  const fp = fingerprintPassport({
    evidenceId,
    claimText,
    originalSourceContent: original,
    directSourceUrl: input.directSourceUrl ?? null,
  });

  const passport: EvidencePassport = {
    schemaVersion: EVIDENCE_PASSPORT_SCHEMA_VERSION,
    passportId,
    evidenceId,
    claimId: null,
    claimText,
    stance: input.stance,
    evidenceType: input.evidenceType ?? "other",
    author: input.author ?? null,
    institution: input.institution ?? null,
    directSourceUrl: input.directSourceUrl ?? null,
    publicationDate: input.publicationDate ?? null,
    updateDate: null,
    methodology: input.methodology ?? null,
    sampleSize: null,
    units: null,
    geographyCoverage: null,
    timeCoverage: null,
    statisticalUncertainty: null,
    limitations: [...(input.limitations ?? [])],
    conflictsOfInterest: null,
    replicationStatus: "not_attempted",
    counterEvidenceIds: [],
    freshness: "unknown",
    license: null,
    originalSourceContent: original,
    localizedSummary: input.localizedSummary ?? null,
    cbaiSynthesis: input.cbaiSynthesis ?? null,
    knowledgeState: "unknown",
    humanVerificationStatus: "pending_review",
    verifierDisplayName: null,
    fingerprint: fp,
    version: "1",
    contentLocale: input.contentLocale ?? locale,
    createdLocale: locale,
    createdAt: now,
    updatedAt: now,
    auditHistory: [
      {
        at: now,
        actor: "human",
        action: "passport_created",
        detail: "confirmation_gated",
      },
    ],
  };

  const list = [...listEvidencePassports()];
  list.unshift(passport);
  writeAll(list);
  return passport;
}

export function confirmHumanVerification(
  passportId: string,
  verifierDisplayName: string,
): EvidencePassport | null {
  const current = getEvidencePassport(passportId);
  if (!current) return null;
  const now = new Date().toISOString();
  const next = migrateEvidencePassport({
    ...current,
    humanVerificationStatus: "human_confirmed",
    verifierDisplayName: verifierDisplayName.trim() || "Human verifier",
    knowledgeState: current.knowledgeState === "unknown" ? "known" : current.knowledgeState,
    updatedAt: now,
    auditHistory: [
      ...current.auditHistory,
      {
        at: now,
        actor: verifierDisplayName.trim() || "Human verifier",
        action: "human_confirmed",
        detail: "Evidence may become operational after confirmation.",
      },
    ],
  });
  if (!next) return null;
  const list = [...listEvidencePassports()];
  const idx = list.findIndex((p) => p.passportId === passportId);
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  writeAll(list);
  return next;
}

export function resetEvidencePassportsForTests(): void {
  memory.length = 0;
  createOnce.clear();
  commitSnapshot([]);
  if (isBrowser()) {
    window.localStorage.removeItem(resolveStorageKey(STORAGE_KEY));
  }
}

export function subscribeEvidencePassports(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onSameTab = () => cb();
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== resolveStorageKey(STORAGE_KEY)) return;
    invalidateSnapshot();
    cb();
  };
  window.addEventListener("cbai-evidence-passports-changed", onSameTab);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("cbai-evidence-passports-changed", onSameTab);
    window.removeEventListener("storage", onStorage);
  };
}

export function getEmptyEvidencePassportSnapshot(): readonly EvidencePassport[] {
  return EMPTY_EVIDENCE_PASSPORTS;
}
