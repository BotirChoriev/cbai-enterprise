/**
 * Local-only deliberation store. Does not claim multi-user realtime collaboration.
 */

import {
  type DeliberationBundle,
  type DeliberationEvidenceRecord,
  type DeliberationRoom,
  type DeliberationRoomType,
  type ParticipantRole,
  type ScientificClaim,
  type SynthesisSnapshot,
  SDN_SCHEMA_VERSION,
} from "@/lib/scientific-deliberation/types";
import { migrateBundle, migrateDeliberationRoom } from "@/lib/scientific-deliberation/migrate";
import { buildLivingSynthesis } from "@/lib/scientific-deliberation/synthesis";

export const SDN_STORAGE_KEY = "cbai.scientific-deliberation.v1";

export type RoomComposerDraft = {
  readonly title: string;
  readonly roomType: DeliberationRoomType;
  readonly scientificQuestion: string;
  readonly scope: string;
  readonly mainClaim: string;
  readonly proofStandard: string;
  readonly acceptedSourcePolicies: readonly string[];
  readonly languages: readonly string[];
  readonly visibility: DeliberationRoom["visibility"];
  readonly participantRoles: readonly ParticipantRole[];
  readonly startsAt: string;
  readonly endsAt: string;
  readonly translationConsent: boolean;
  readonly transcriptConsent: boolean;
  readonly confidentiality: DeliberationRoom["confidentiality"];
  readonly intellectualPropertyStatus: string;
  readonly conflictDisclosures: string;
  readonly finalHumanApprover: string;
  readonly contentLocale: string;
};

const EMPTY: readonly DeliberationBundle[] = [];
let cachedRaw: string | null | undefined = undefined;
let cachedSnapshot: readonly DeliberationBundle[] = EMPTY;

function parseAll(raw: string | null): readonly DeliberationBundle[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    const bundles = parsed.map((item) => migrateBundle(item));
    return bundles.length ? bundles : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function getSdnSnapshot(): readonly DeliberationBundle[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(SDN_STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = parseAll(raw);
  return cachedSnapshot;
}

export function getEmptySdnSnapshot(): readonly DeliberationBundle[] {
  return EMPTY;
}

export function subscribeSdn(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => onStoreChange();
  window.addEventListener("cbai-sdn-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("cbai-sdn-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

function writeAll(bundles: readonly DeliberationBundle[]): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(bundles);
  if (serialized === window.localStorage.getItem(SDN_STORAGE_KEY)) {
    cachedRaw = serialized;
    cachedSnapshot = bundles.length ? bundles : EMPTY;
    return;
  }
  window.localStorage.setItem(SDN_STORAGE_KEY, serialized);
  cachedRaw = serialized;
  cachedSnapshot = bundles.length ? bundles : EMPTY;
  window.dispatchEvent(new Event("cbai-sdn-changed"));
}

export function emptyRoomComposerDraft(locale: string): RoomComposerDraft {
  return {
    title: "",
    roomType: "claim_verification",
    scientificQuestion: "",
    scope: "",
    mainClaim: "",
    proofStandard: "",
    acceptedSourcePolicies: ["peer_reviewed", "official_registry"],
    languages: [locale || "en"],
    visibility: "local_only",
    participantRoles: ["claim_author", "methodology_reviewer", "final_human_approver"],
    startsAt: "",
    endsAt: "",
    translationConsent: false,
    transcriptConsent: false,
    confidentiality: "unknown",
    intellectualPropertyStatus: "unknown",
    conflictDisclosures: "unknown",
    finalHumanApprover: "",
    contentLocale: locale || "en",
  };
}

export function createRoomBundleFromDraft(
  draft: RoomComposerDraft,
  opts: { readonly confirmed: boolean },
): DeliberationBundle | null {
  if (!opts.confirmed) return null;
  if (!draft.title.trim() || !draft.scientificQuestion.trim() || !draft.mainClaim.trim() || !draft.finalHumanApprover.trim()) {
    return null;
  }
  const now = new Date().toISOString();
  const roomId = `sdn-room-${now.replace(/[:.]/g, "-")}`;
  const claimId = `sdn-claim-${now.replace(/[:.]/g, "-")}`;
  const room: DeliberationRoom = migrateDeliberationRoom({
    id: roomId,
    schemaVersion: SDN_SCHEMA_VERSION,
    title: draft.title.trim(),
    roomType: draft.roomType,
    scientificQuestion: draft.scientificQuestion.trim(),
    scope: draft.scope.trim() || "unknown",
    primaryClaimId: claimId,
    proofStandard: draft.proofStandard.trim() || "unknown",
    acceptedSourcePolicies: draft.acceptedSourcePolicies,
    languages: draft.languages,
    visibility: draft.visibility,
    status: "open",
    participantRoles: draft.participantRoles,
    startsAt: draft.startsAt || null,
    endsAt: draft.endsAt || null,
    translationConsent: draft.translationConsent,
    transcriptConsent: draft.transcriptConsent,
    confidentiality: draft.confidentiality,
    intellectualPropertyStatus: draft.intellectualPropertyStatus || "unknown",
    conflictDisclosures: draft.conflictDisclosures || "unknown",
    finalHumanApprover: draft.finalHumanApprover.trim(),
    sourceRoute: "/evidence",
    relatedEntityIds: [],
    relatedOperationalObjectIds: [],
    collaborationMode: "local_only",
    contentLocale: draft.contentLocale,
    createdLocale: draft.contentLocale,
    createdAt: now,
    updatedAt: now,
    version: 1,
  });
  const claim: ScientificClaim = {
    id: claimId,
    roomId,
    statement: draft.mainClaim.trim(),
    claimType: "primary",
    authorRef: null,
    institutionRef: null,
    status: "proposed",
    assumptions: [],
    scope: draft.scope.trim() || "unknown",
    contentLocale: draft.contentLocale,
    createdLocale: draft.contentLocale,
    createdAt: now,
    updatedAt: now,
    version: 1,
    revisionHistory: [`created:${now}`],
  };
  const participants = draft.participantRoles.map((role, index) => ({
    id: `${roomId}-participant-${index}`,
    roomId,
    displayLabel: role === "final_human_approver" ? draft.finalHumanApprover.trim() : role,
    role,
    institutionRef: null,
    isLocalOnly: true as const,
    cannotImpersonateInstitution: true as const,
  }));
  const checkpoint = {
    id: `${roomId}-cp-final`,
    roomId,
    label: "Final scientific approval remains human",
    requiredApproverRole: "final_human_approver" as const,
    status: "open" as const,
    decidedAt: null,
  };
  const audit = [
    {
      id: `${roomId}-audit-create`,
      roomId,
      kind: "room_created",
      summary: "Local deliberation room created after confirmation",
      at: now,
      actorRole: "claim_author" as const,
    },
  ];
  return {
    room,
    claims: [claim],
    evidence: [],
    methodReviews: [],
    replications: [],
    contributions: [],
    synthesis: null,
    glossary: [],
    participants,
    checkpoints: [checkpoint],
    audit,
    contradictions: [],
  };
}

export function confirmCreateRoom(draft: RoomComposerDraft): DeliberationBundle | null {
  const bundle = createRoomBundleFromDraft(draft, { confirmed: true });
  if (!bundle) return null;
  const next = [...getSdnSnapshot(), bundle];
  writeAll(next);
  return bundle;
}

export function getBundleById(roomId: string): DeliberationBundle | null {
  return getSdnSnapshot().find((b) => b.room.id === roomId) ?? null;
}

export function upsertEvidence(
  roomId: string,
  evidence: DeliberationEvidenceRecord,
  opts: { readonly confirmed: boolean },
): DeliberationBundle | null {
  if (!opts.confirmed) return null;
  const all = [...getSdnSnapshot()];
  const index = all.findIndex((b) => b.room.id === roomId);
  if (index < 0) return null;
  const current = all[index]!;
  if (current.evidence.some((e) => e.id === evidence.id)) return current;
  const nextBundle: DeliberationBundle = {
    ...current,
    evidence: [...current.evidence, evidence],
    room: { ...current.room, updatedAt: new Date().toISOString(), version: current.room.version + 1 },
    audit: [
      ...current.audit,
      {
        id: `${evidence.id}-audit`,
        roomId,
        kind: "evidence_added",
        summary: `Evidence ${evidence.stance} linked to claim ${evidence.claimId}`,
        at: new Date().toISOString(),
        actorRole: "claim_author",
      },
    ],
  };
  all[index] = nextBundle;
  writeAll(all);
  return nextBundle;
}

export function refreshSynthesis(roomId: string): DeliberationBundle | null {
  const all = [...getSdnSnapshot()];
  const index = all.findIndex((b) => b.room.id === roomId);
  if (index < 0) return null;
  const current = all[index]!;
  const synthesis: SynthesisSnapshot = buildLivingSynthesis(current);
  const nextBundle: DeliberationBundle = {
    ...current,
    synthesis,
    room: { ...current.room, status: "synthesis", updatedAt: synthesis.generatedAt, version: current.room.version + 1 },
  };
  all[index] = nextBundle;
  writeAll(all);
  return nextBundle;
}

export function collaborationCapabilityNotice(): {
  readonly mode: "local_only";
  readonly status: "INFRASTRUCTURE_REQUIRED";
  readonly honesty: string;
} {
  return {
    mode: "local_only",
    status: "INFRASTRUCTURE_REQUIRED",
    honesty:
      "Shared realtime multi-user deliberation requires accounts, permissions, cloud persistence, and subscriptions. Local rooms are available; fake online participants are never invented.",
  };
}
