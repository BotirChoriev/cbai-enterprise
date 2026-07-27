import type { SourceProvenance, VerificationStatus } from "@/lib/intelligence-os/source-provenance";

export type WatchTargetType =
  | "country"
  | "indicator"
  | "evidence_source"
  | "project"
  | "report"
  | "official_publication";

export type VerifiedChangeEventType =
  | "new_verified_source"
  | "indicator_updated"
  | "source_became_stale"
  | "contradiction_detected"
  | "report_ready"
  | "evidence_coverage_changed"
  | "human_review_required";

export type CountryWatch = {
  readonly id: string;
  readonly targetType: WatchTargetType;
  readonly targetId: string;
  readonly targetLabel: string;
  readonly createdAt: string;
  readonly contentLocale: string;
  readonly enabled: boolean;
  readonly pollingDisclosure: "manual_refresh" | "scheduled_polling" | "push";
  readonly pollingIntervalMinutes: number | null;
};

export type VerifiedChangeNotification = {
  readonly id: string;
  readonly dedupeKey: string;
  readonly watchId: string;
  readonly eventType: VerifiedChangeEventType;
  readonly title: string;
  readonly whatChanged: string;
  readonly oldVerifiedValue: string | number | null;
  readonly newVerifiedValue: string | number | null;
  readonly effectiveAt: string | null;
  readonly detectedAt: string;
  readonly verificationStatus: VerificationStatus;
  readonly source: SourceProvenance;
  readonly supportingEvidenceUrl: string | null;
  readonly readAt: string | null;
  readonly dismissedAt: string | null;
};

export function createNotificationDedupeKey(input: {
  readonly watchId: string;
  readonly eventType: VerifiedChangeEventType;
  readonly sourceId: string;
  readonly newVerifiedValue: string | number | null;
  readonly effectiveAt: string | null;
}): string {
  return [
    input.watchId,
    input.eventType,
    input.sourceId,
    String(input.newVerifiedValue ?? "null"),
    input.effectiveAt ?? "unknown",
  ].join(":");
}

export function appendNotificationOnce(
  existing: readonly VerifiedChangeNotification[],
  notification: VerifiedChangeNotification,
): readonly VerifiedChangeNotification[] {
  if (existing.some((item) => item.dedupeKey === notification.dedupeKey)) return existing;
  return [notification, ...existing];
}

export function describeUpdateCapability(input: {
  readonly licensedFeedConfigured: boolean;
  readonly pollingIntervalMinutes: number | null;
}): "licensed_feed" | "scheduled_polling" | "manual_refresh_only" {
  if (input.licensedFeedConfigured) return "licensed_feed";
  if (input.pollingIntervalMinutes !== null && input.pollingIntervalMinutes > 0) {
    return "scheduled_polling";
  }
  return "manual_refresh_only";
}

export function formatCountryTime(
  timeZone: string,
  locale: string,
  now: Date = new Date(),
): string | null {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(now);
  } catch {
    return null;
  }
}
