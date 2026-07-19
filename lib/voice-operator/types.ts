/** CBAI Voice Operator — canonical types for Realtime and browser-fallback modes. */

export type VoiceOperatorMode = "realtime" | "browser_fallback";

export type VoiceDockState =
  | "closed"
  | "ready"
  | "permission_required"
  | "connecting"
  | "listening"
  | "user_speaking"
  | "thinking"
  | "searching_sources"
  | "responding"
  | "action_confirmation"
  | "disconnected"
  | "backend_required"
  | "error";

export type VoicePermissionIssue =
  | "denied"
  | "dismissed"
  | "no_device"
  | "device_busy"
  | "insecure_origin"
  | "unsupported"
  | "speech_unavailable"
  | "network_disconnected";

export type VoiceBrokerIssue = "required" | "unreachable" | "authentication_failed";

export type ToolRiskClass = "read_only" | "external_read" | "draft_write" | "consequential";

export type ConversationTurn = {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly text: string;
  readonly at: string;
  readonly toolActivity?: string;
};

export type ExternalSearchConsentScope = {
  readonly active: boolean;
  readonly sanitizedQuery: string;
  readonly providers: readonly string[];
  readonly grantedAt: string | null;
};

export type VoiceSessionMemory = {
  readonly sessionId: string;
  readonly language: string;
  readonly mode: VoiceOperatorMode;
  readonly turns: readonly ConversationTurn[];
  readonly activeContextSummary: string | null;
  readonly lastConfirmedQuery: string | null;
  readonly presentedEvidenceIds: readonly string[];
  readonly unresolvedClarification: string | null;
  readonly externalSearchConsent: ExternalSearchConsentScope | null;
  readonly pendingDraftId: string | null;
  readonly startedAt: string;
};

export type EphemeralRealtimeCredential = {
  readonly clientSecret: string;
  readonly expiresAt: string;
  readonly sessionId: string;
  readonly model: string;
};

export type VoiceBrokerStatus =
  | { readonly kind: "available"; readonly brokerUrl: string }
  | { readonly kind: "backend_required"; readonly reason: string }
  | { readonly kind: "error"; readonly message: string };

export type EvidenceResultItem = {
  readonly id: string;
  readonly provider: string;
  readonly title: string;
  readonly authors: readonly string[];
  readonly year: string | null;
  readonly doi: string | null;
  readonly sourceUrl: string | null;
  readonly abstractAvailable: boolean;
  readonly relevanceNote: string;
  readonly limitations: readonly string[];
};

export type EvidenceResultsPayload = {
  readonly query: string;
  readonly items: readonly EvidenceResultItem[];
  readonly providerFailures: readonly string[];
  readonly limitations: readonly string[];
};
