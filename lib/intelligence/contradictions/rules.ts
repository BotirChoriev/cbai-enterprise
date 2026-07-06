import type { Evidence, EvidenceStaleness } from "@/lib/intelligence/evidence.types";
import type {
  ContradictionSeverity,
  ContradictionSummary,
  EvidenceContradiction,
} from "@/lib/intelligence/contradictions/types";

/** Minimum relevance for both items before a contradiction is reported (Spec §7). */
export const CONTRADICTION_MIN_RELEVANCE = 40;

/** Rule: same entity + property with different excerpt values. */
export const RULE_PROPERTY_VALUE_CONFLICT = "property-value-conflict";

/** Rule: duplicate logical evidence key with conflicting payloads. */
export const RULE_DUPLICATE_ID_PAYLOAD_CONFLICT = "duplicate-id-payload-conflict";

/** Rule: explicit conflict flag on evidence item. */
export const RULE_EXPLICIT_CONFLICT_FLAG = "explicit-conflict-flag";

/** Rule: retrievedAt ordering inconsistent with staleness indicators. */
export const RULE_TIMESTAMP_ORDER_CONFLICT = "timestamp-order-conflict";

/** Rule: impossible entity status combination in classification excerpts. */
export const RULE_IMPOSSIBLE_STATE_COMBINATION = "impossible-state-combination";

/** Known property suffixes extracted from evidence ids. */
export const KNOWN_EVIDENCE_PROPERTY_SUFFIXES = [
  "overview",
  "ai-summary",
  "scores",
  "classification",
  "relationships",
  "signals",
  "match",
] as const;

const ENTITY_STATUS_PATTERN = /Entity status:\s*([^.]+)/i;
const AI_SCORE_PATTERN = /AI Score:\s*(\d+)/i;

/**
 * Normalize excerpt text for deterministic equality comparison.
 */
export function normalizeExcerptValue(excerpt: string): string {
  return excerpt.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Extract property key from evidence id or explicit conflict metadata.
 */
export function extractPropertyKey(item: Evidence): string {
  if (item.conflict?.property?.trim()) {
    return item.conflict.property.trim();
  }

  const suffix = item.id.split(":").pop() ?? "unknown";

  if (
    (KNOWN_EVIDENCE_PROPERTY_SUFFIXES as readonly string[]).includes(suffix)
  ) {
    return suffix;
  }

  if (item.relationshipLabel?.trim()) {
    return `relationship:${item.relationshipLabel.trim()}`;
  }

  return suffix;
}

/**
 * Build canonical logical key for duplicate-id detection across adapters.
 */
export function buildCanonicalEvidenceKey(item: Evidence): string {
  return `${item.entityType}:${item.entityId}:${extractPropertyKey(item)}`;
}

/**
 * Returns true when both items meet minimum relevance for contradiction reporting.
 */
export function meetsContradictionRelevanceThreshold(
  left: Evidence,
  right: Evidence,
): boolean {
  return (
    left.relevance >= CONTRADICTION_MIN_RELEVANCE &&
    right.relevance >= CONTRADICTION_MIN_RELEVANCE
  );
}

/**
 * Create a deterministic contradiction record for a pair of evidence items.
 */
export function createContradictionRecord(input: {
  ruleId: string;
  entityId: string;
  property: string;
  left: Evidence;
  right: Evidence;
  severity: ContradictionSeverity;
  description: string;
}): EvidenceContradiction {
  const [leftEvidenceId, rightEvidenceId] = [input.left.id, input.right.id].sort(
    (a, b) => a.localeCompare(b),
  );

  return {
    id: `contradiction:${input.ruleId}:${leftEvidenceId}:${rightEvidenceId}`,
    entityId: input.entityId,
    property: input.property,
    leftEvidenceId,
    rightEvidenceId,
    severity: input.severity,
    description: input.description,
    ruleId: input.ruleId,
  };
}

/**
 * Detect same entity + same property + different normalized excerpt values.
 */
export function detectPropertyValueConflicts(
  items: Evidence[],
): EvidenceContradiction[] {
  const groups = new Map<string, Evidence[]>();

  for (const item of items) {
    const key = `${item.entityId}:${extractPropertyKey(item)}`;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const contradictions: EvidenceContradiction[] = [];

  for (const [key, group] of groups) {
    if (group.length < 2) {
      continue;
    }

    const [entityId, property] = splitEntityPropertyKey(key);

    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const left = group[i];
        const right = group[j];

        if (!meetsContradictionRelevanceThreshold(left, right)) {
          continue;
        }

        const leftValue = normalizeExcerptValue(left.excerpt);
        const rightValue = normalizeExcerptValue(right.excerpt);

        if (leftValue === rightValue) {
          continue;
        }

        contradictions.push(
          createContradictionRecord({
            ruleId: RULE_PROPERTY_VALUE_CONFLICT,
            entityId,
            property,
            left,
            right,
            severity: "major",
            description: `Conflicting values for property "${property}" on entity ${entityId}.`,
          }),
        );
      }
    }
  }

  return contradictions;
}

/**
 * Detect duplicate logical evidence keys with different payloads or ids.
 */
export function detectDuplicateIdPayloadConflicts(
  items: Evidence[],
): EvidenceContradiction[] {
  const groups = new Map<string, Evidence[]>();

  for (const item of items) {
    const key = buildCanonicalEvidenceKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const contradictions: EvidenceContradiction[] = [];

  for (const [canonicalKey, group] of groups) {
    if (group.length < 2) {
      continue;
    }

    const [entityType, entityId, property] = splitCanonicalKey(canonicalKey);

    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const left = group[i];
        const right = group[j];

        if (left.id === right.id) {
          continue;
        }

        if (!meetsContradictionRelevanceThreshold(left, right)) {
          continue;
        }

        const leftValue = normalizeExcerptValue(left.excerpt);
        const rightValue = normalizeExcerptValue(right.excerpt);

        if (leftValue === rightValue) {
          continue;
        }

        contradictions.push(
          createContradictionRecord({
            ruleId: RULE_DUPLICATE_ID_PAYLOAD_CONFLICT,
            entityId,
            property,
            left,
            right,
            severity: "major",
            description: `Duplicate logical evidence key ${entityType}:${entityId}:${property} with conflicting payloads.`,
          }),
        );
      }
    }
  }

  return contradictions;
}

/**
 * Detect explicit conflict flags declared on evidence items.
 */
export function detectExplicitConflictFlags(
  items: Evidence[],
): EvidenceContradiction[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const contradictions: EvidenceContradiction[] = [];

  for (const item of items) {
    if (!item.conflict?.flagged) {
      continue;
    }

    const property = item.conflict.property?.trim() ?? extractPropertyKey(item);
    const relatedIds = item.conflict.relatedEvidenceIds ?? [];

    if (relatedIds.length === 0) {
      continue;
    }

    for (const relatedId of relatedIds) {
      const related = byId.get(relatedId);

      if (!related) {
        continue;
      }

      if (!meetsContradictionRelevanceThreshold(item, related)) {
        continue;
      }

      contradictions.push(
        createContradictionRecord({
          ruleId: RULE_EXPLICIT_CONFLICT_FLAG,
          entityId: item.entityId,
          property,
          left: item,
          right: related,
          severity: "critical",
          description: `Explicit conflict flag on evidence ${item.id} references ${relatedId}.`,
        }),
      );
    }
  }

  return contradictions;
}

/**
 * Detect timestamp order conflicts with staleness indicators.
 */
export function detectTimestampOrderConflicts(
  items: Evidence[],
): EvidenceContradiction[] {
  const byEntity = groupItemsByEntityId(items);
  const contradictions: EvidenceContradiction[] = [];

  for (const [entityId, entityItems] of byEntity) {
    const timedItems = entityItems.filter(
      (item) =>
        item.source.retrievedAt !== undefined &&
        item.staleness !== undefined &&
        Number.isFinite(Date.parse(item.source.retrievedAt)),
    );

    for (let i = 0; i < timedItems.length; i += 1) {
      for (let j = i + 1; j < timedItems.length; j += 1) {
        const left = timedItems[i];
        const right = timedItems[j];

        if (!meetsContradictionRelevanceThreshold(left, right)) {
          continue;
        }

        const leftTime = Date.parse(left.source.retrievedAt!);
        const rightTime = Date.parse(right.source.retrievedAt!);

        if (leftTime === rightTime) {
          continue;
        }

        const [earlier, later] =
          leftTime < rightTime ? [left, right] : [right, left];
        const earlierRank = stalenessRank(earlier.staleness);
        const laterRank = stalenessRank(later.staleness);

        if (earlierRank >= 0 && laterRank >= 0 && laterRank < earlierRank) {
          contradictions.push(
            createContradictionRecord({
              ruleId: RULE_TIMESTAMP_ORDER_CONFLICT,
              entityId,
              property: "retrievedAt-staleness",
              left: earlier,
              right: later,
              severity: "minor",
              description: `Later evidence (${later.id}) is fresher than earlier evidence (${earlier.id}) but reports better staleness.`,
            }),
          );
        }
      }
    }
  }

  return contradictions;
}

/**
 * Detect impossible entity status combinations from classification excerpts.
 */
export function detectImpossibleStateCombinations(
  items: Evidence[],
): EvidenceContradiction[] {
  const statusItems = items
    .map((item) => ({
      item,
      status: extractEntityStatus(item.excerpt),
    }))
    .filter(
      (entry): entry is { item: Evidence; status: string } =>
        entry.status !== null,
    );

  const byEntity = new Map<string, Array<{ item: Evidence; status: string }>>();

  for (const entry of statusItems) {
    const group = byEntity.get(entry.item.entityId) ?? [];
    group.push(entry);
    byEntity.set(entry.item.entityId, group);
  }

  const contradictions: EvidenceContradiction[] = [];

  for (const [entityId, entries] of byEntity) {
    const uniqueStatuses = new Map<string, Evidence>();

    for (const entry of entries) {
      const normalizedStatus = entry.status.trim().toLowerCase();

      if (!uniqueStatuses.has(normalizedStatus)) {
        uniqueStatuses.set(normalizedStatus, entry.item);
        continue;
      }

      const existing = uniqueStatuses.get(normalizedStatus)!;

      if (existing.id === entry.item.id) {
        continue;
      }
    }

    const statusList = [...uniqueStatuses.entries()];

    for (let i = 0; i < statusList.length; i += 1) {
      for (let j = i + 1; j < statusList.length; j += 1) {
        const [leftStatus, leftItem] = statusList[i];
        const [rightStatus, rightItem] = statusList[j];

        if (!meetsContradictionRelevanceThreshold(leftItem, rightItem)) {
          continue;
        }

        if (leftStatus === rightStatus) {
          continue;
        }

        contradictions.push(
          createContradictionRecord({
            ruleId: RULE_IMPOSSIBLE_STATE_COMBINATION,
            entityId,
            property: "entity-status",
            left: leftItem,
            right: rightItem,
            severity: "critical",
            description: `Impossible entity status combination: "${leftStatus}" vs "${rightStatus}".`,
          }),
        );
      }
    }
  }

  return contradictions;
}

/**
 * Run all deterministic contradiction rules and deduplicate results.
 */
export function runContradictionRules(items: Evidence[]): EvidenceContradiction[] {
  const merged = [
    ...detectExplicitConflictFlags(items),
    ...detectImpossibleStateCombinations(items),
    ...detectPropertyValueConflicts(items),
    ...detectDuplicateIdPayloadConflicts(items),
    ...detectTimestampOrderConflicts(items),
  ];

  const seen = new Set<string>();
  const deduped: EvidenceContradiction[] = [];

  for (const contradiction of merged.sort((a, b) => a.id.localeCompare(b.id))) {
    if (seen.has(contradiction.id)) {
      continue;
    }

    seen.add(contradiction.id);
    deduped.push(contradiction);
  }

  return deduped;
}

/**
 * Build summary counts from detected contradictions.
 */
export function buildContradictionSummary(
  contradictions: EvidenceContradiction[],
): ContradictionSummary {
  let critical = 0;
  let major = 0;
  let minor = 0;

  for (const contradiction of contradictions) {
    switch (contradiction.severity) {
      case "critical":
        critical += 1;
        break;
      case "major":
        major += 1;
        break;
      case "minor":
        minor += 1;
        break;
      default:
        break;
    }
  }

  return {
    totalContradictions: contradictions.length,
    critical,
    major,
    minor,
    hasBlockingConflict: critical > 0 || major > 0,
  };
}

function splitEntityPropertyKey(key: string): [string, string] {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex === -1) {
    return [key, "unknown"];
  }

  return [key.slice(0, separatorIndex), key.slice(separatorIndex + 1)];
}

function splitCanonicalKey(key: string): [string, string, string] {
  const parts = key.split(":");
  return [parts[0] ?? "unknown", parts[1] ?? "unknown", parts[2] ?? "unknown"];
}

function groupItemsByEntityId(items: Evidence[]): Map<string, Evidence[]> {
  const groups = new Map<string, Evidence[]>();

  for (const item of items) {
    const group = groups.get(item.entityId) ?? [];
    group.push(item);
    groups.set(item.entityId, group);
  }

  return groups;
}

function stalenessRank(staleness?: EvidenceStaleness): number {
  switch (staleness) {
    case "fresh":
      return 0;
    case "aging":
      return 1;
    case "stale":
      return 2;
    default:
      return -1;
  }
}

function extractEntityStatus(excerpt: string): string | null {
  const match = excerpt.match(ENTITY_STATUS_PATTERN);
  return match?.[1]?.trim() ?? null;
}

/**
 * Extract numeric AI score from scores excerpt — exposed for tests and explainability.
 */
export function extractAiScore(excerpt: string): number | null {
  const match = excerpt.match(AI_SCORE_PATTERN);
  if (!match?.[1]) {
    return null;
  }

  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}
