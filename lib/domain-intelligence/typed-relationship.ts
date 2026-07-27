/**
 * Typed Domain Intelligence relationships with provenance.
 * Unknown fields preserved; no fabricated strength or confidence.
 */

import {
  DOMAIN_RELATIONSHIP_DIRECTION,
  isDomainEntityKind,
  isDomainRelationshipAllowed,
  isDomainRelationshipKind,
  type DomainEntityKind,
  type DomainRelationshipKind,
} from "@/lib/domain-intelligence/canonical-kinds";
import type { MaterialClass } from "@/lib/domain-intelligence/evidence-provenance";

export const DOMAIN_RELATIONSHIP_SCHEMA_VERSION = 1 as const;

export type DomainRelationshipProvenance = {
  readonly materialClass: MaterialClass;
  readonly sourceLabel?: string;
  readonly sourceUrl?: string;
  readonly observedAt?: string;
  readonly verifiedAt?: string | null;
  /** Registry key that produced this edge (e.g. "local-university-country-match"). */
  readonly derivedFrom?: string;
  readonly contentLocale?: string;
};

export type DomainRelationshipRecord = {
  readonly id: string;
  readonly version: typeof DOMAIN_RELATIONSHIP_SCHEMA_VERSION;
  readonly kind: DomainRelationshipKind;
  readonly fromKind: DomainEntityKind;
  readonly fromId: string;
  readonly fromLabel: string;
  readonly toKind: DomainEntityKind;
  readonly toId: string;
  readonly toLabel: string;
  readonly direction: "directed" | "bidirectional";
  readonly status: "active" | "historical" | "proposed" | "unavailable";
  readonly confidence: "known" | "registry_derived" | "user_asserted" | "unknown";
  readonly provenance: DomainRelationshipProvenance;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Preserve unknown fields from older migrations. */
  readonly unknownFields?: Readonly<Record<string, unknown>>;
};

export type BuildDomainRelationshipInput = {
  readonly kind: DomainRelationshipKind;
  readonly fromKind: DomainEntityKind;
  readonly fromId: string;
  readonly fromLabel: string;
  readonly toKind: DomainEntityKind;
  readonly toId: string;
  readonly toLabel: string;
  readonly status?: DomainRelationshipRecord["status"];
  readonly confidence?: DomainRelationshipRecord["confidence"];
  readonly provenance: DomainRelationshipProvenance;
  readonly id?: string;
  readonly createdAt?: string;
  readonly unknownFields?: Readonly<Record<string, unknown>>;
};

export function buildDomainRelationship(input: BuildDomainRelationshipInput): DomainRelationshipRecord | null {
  if (!isDomainRelationshipKind(input.kind)) return null;
  if (!isDomainEntityKind(input.fromKind) || !isDomainEntityKind(input.toKind)) return null;
  if (!isDomainRelationshipAllowed(input.kind, input.fromKind, input.toKind)) return null;
  if (!input.fromId.trim() || !input.toId.trim()) return null;

  const now = new Date().toISOString();
  return {
    id: input.id ?? `rel:${input.kind}:${input.fromKind}:${input.fromId}:${input.toKind}:${input.toId}`,
    version: DOMAIN_RELATIONSHIP_SCHEMA_VERSION,
    kind: input.kind,
    fromKind: input.fromKind,
    fromId: input.fromId,
    fromLabel: input.fromLabel,
    toKind: input.toKind,
    toId: input.toId,
    toLabel: input.toLabel,
    direction: DOMAIN_RELATIONSHIP_DIRECTION[input.kind],
    status: input.status ?? "active",
    confidence: input.confidence ?? "unknown",
    provenance: input.provenance,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    ...(input.unknownFields ? { unknownFields: input.unknownFields } : {}),
  };
}

/** Preserve unknown fields when migrating a raw stored relationship. */
export function migrateDomainRelationship(
  raw: Readonly<Record<string, unknown>>,
): DomainRelationshipRecord | null {
  const kind = raw.kind;
  const fromKind = raw.fromKind;
  const toKind = raw.toKind;
  if (!isDomainRelationshipKind(kind) || !isDomainEntityKind(fromKind) || !isDomainEntityKind(toKind)) {
    return null;
  }
  const known = new Set([
    "id",
    "version",
    "kind",
    "fromKind",
    "fromId",
    "fromLabel",
    "toKind",
    "toId",
    "toLabel",
    "direction",
    "status",
    "confidence",
    "provenance",
    "createdAt",
    "updatedAt",
    "unknownFields",
  ]);
  const unknownFields: Record<string, unknown> = {
    ...((raw.unknownFields as Record<string, unknown> | undefined) ?? {}),
  };
  for (const [key, value] of Object.entries(raw)) {
    if (!known.has(key)) unknownFields[key] = value;
  }

  const provenance = (raw.provenance ?? {}) as DomainRelationshipProvenance;
  return buildDomainRelationship({
    kind,
    fromKind,
    fromId: String(raw.fromId ?? ""),
    fromLabel: String(raw.fromLabel ?? raw.fromId ?? ""),
    toKind,
    toId: String(raw.toId ?? ""),
    toLabel: String(raw.toLabel ?? raw.toId ?? ""),
    status: (raw.status as DomainRelationshipRecord["status"]) ?? "active",
    confidence: (raw.confidence as DomainRelationshipRecord["confidence"]) ?? "unknown",
    provenance: {
      materialClass: provenance.materialClass ?? "unknown",
      sourceLabel: provenance.sourceLabel,
      sourceUrl: provenance.sourceUrl,
      observedAt: provenance.observedAt,
      verifiedAt: provenance.verifiedAt ?? null,
      derivedFrom: provenance.derivedFrom,
      contentLocale: provenance.contentLocale,
    },
    id: typeof raw.id === "string" ? raw.id : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    unknownFields: Object.keys(unknownFields).length > 0 ? unknownFields : undefined,
  });
}
