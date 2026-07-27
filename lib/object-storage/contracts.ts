/**
 * Object-storage contracts — metadata + object references only in app records.
 * Never store large file payloads in localStorage (DD-PC-003).
 */

export type ObjectVisibility = "private" | "team" | "public";

export type ObjectLifecycleStatus =
  | "draft"
  | "upload_pending"
  | "uploading"
  | "uploaded"
  | "processing_pending"
  | "processing"
  | "needs_review"
  | "ready"
  | "failed";

export type ObjectStorageRef = {
  readonly objectId: string;
  readonly bucket: string;
  readonly storageKey: string;
  readonly contentHash: string | null;
  readonly byteSize: number | null;
  readonly mimeType: string | null;
  readonly visibility: ObjectVisibility;
  readonly ownerAccountId: string | null;
  readonly organizationId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Never a permanent public path for private assets. */
  readonly signedUrlExpiresAt: string | null;
};

export type ScanStatus = "not_configured" | "pending" | "clean" | "infected" | "failed" | "external_blocked";

export type ObjectUploadSession = {
  readonly uploadId: string;
  readonly objectId: string;
  readonly status: ObjectLifecycleStatus;
  readonly scanStatus: ScanStatus;
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly errorCode: string | null;
};

export const OBJECT_STORAGE_RULES = {
  noLocalStoragePayloads: true,
  defaultVisibility: "private" as const,
  readyRequiresProcessingComplete: true,
  publicRequiresConfirmation: true,
  virusScanRequiredForProduction: true,
  virusScanUnavailableIsExternalBlocked: true,
} as const;

const TERMINAL_READY: ReadonlySet<ObjectLifecycleStatus> = new Set(["ready"]);

export function mayClaimReady(status: ObjectLifecycleStatus, scanStatus: ScanStatus): boolean {
  if (!TERMINAL_READY.has(status)) return false;
  if (scanStatus === "external_blocked" || scanStatus === "not_configured") return false;
  if (scanStatus === "infected" || scanStatus === "failed") return false;
  return scanStatus === "clean";
}

export function nextLifecycleAfterUploadAck(current: ObjectLifecycleStatus): ObjectLifecycleStatus {
  if (current === "uploading" || current === "upload_pending") return "uploaded";
  return current;
}

export function sanitizeUploadFileName(name: string): string {
  const base = name.replace(/[/\\]/g, "_").replace(/\0/g, "").trim();
  return base.slice(0, 180) || "unnamed";
}
