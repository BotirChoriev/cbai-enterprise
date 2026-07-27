/**
 * Document intake architecture — typed end-to-end contract for PhD / research PDFs.
 *
 * Production blob upload requires configured object storage + malware scanning.
 * This module never places file bytes in localStorage. A mock adapter exists for tests only.
 */

import {
  OBJECT_STORAGE_RULES,
  mayClaimReady,
  sanitizeUploadFileName,
  type ObjectLifecycleStatus,
  type ScanStatus,
} from "@/lib/object-storage/contracts";
import { deriveDocumentUploadReadiness } from "@/lib/platform-capabilities/capability-registry";

export type DocumentProcessingStatus =
  | "awaiting_upload"
  | "uploading"
  | "uploaded"
  | "scanning"
  | "extracting"
  | "indexing"
  | "ready"
  | "partial"
  | "failed";

export type DocumentPrivacy = "private" | "team" | "public";

export type DocumentIntakeMetadata = {
  readonly documentId: string;
  readonly originalFilename: string;
  readonly safeFilename: string;
  readonly fileSizeBytes: number;
  readonly pageCount: number | null;
  readonly contentLocale: string;
  readonly uploadedAt: string | null;
  readonly checksumSha256: string | null;
  readonly uploaderId: string | null;
  readonly workspaceId: string | null;
  readonly privacy: DocumentPrivacy;
  readonly processingStatus: DocumentProcessingStatus;
  readonly sourceProvenance: string;
  readonly parserVersion: string | null;
  readonly extractionWarnings: readonly string[];
  readonly mimeType: string;
};

export type ExtractedPassage = {
  readonly id: string;
  readonly page: number;
  readonly text: string;
  readonly kind: "extracted" | "ai_summary";
  readonly confidence: number | null;
};

export type DocumentOutlineSection = {
  readonly title: string;
  readonly page: number | null;
  readonly kind:
    | "title"
    | "abstract"
    | "research_question"
    | "methodology"
    | "findings"
    | "references"
    | "table"
    | "appendix"
    | "other";
  readonly detected: boolean;
};

export type DocumentIntakeSession = {
  readonly metadata: DocumentIntakeMetadata;
  readonly storageConfigured: boolean;
  readonly scanStatus: ScanStatus;
  readonly lifecycle: ObjectLifecycleStatus;
  readonly outline: readonly DocumentOutlineSection[];
  readonly passages: readonly ExtractedPassage[];
  readonly userMessageKey: string;
};

export const DOCUMENT_INTAKE_LIMITS = {
  maxBytes: 200 * 1024 * 1024,
  maxPagesSoft: 600,
  allowedMime: ["application/pdf"] as const,
  parserVersion: "intake-contract-v1",
} as const;

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF

export function isPdfSignature(bytes: ArrayBuffer | Uint8Array): boolean {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (view.length < 4) return false;
  return PDF_MAGIC.every((b, i) => view[i] === b);
}

export function createDocumentIntakeDraft(input: {
  readonly originalFilename: string;
  readonly fileSizeBytes: number;
  readonly contentLocale: string;
  readonly workspaceId?: string | null;
  readonly uploaderId?: string | null;
  readonly privacy?: DocumentPrivacy;
  readonly pageCount?: number | null;
  readonly checksumSha256?: string | null;
  readonly mimeType?: string;
}): DocumentIntakeSession {
  const readiness = deriveDocumentUploadReadiness();
  const storageConfigured = readiness === "available";
  const documentId = `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const metadata: DocumentIntakeMetadata = {
    documentId,
    originalFilename: input.originalFilename,
    safeFilename: sanitizeUploadFileName(input.originalFilename),
    fileSizeBytes: input.fileSizeBytes,
    pageCount: input.pageCount ?? null,
    contentLocale: input.contentLocale,
    uploadedAt: null,
    checksumSha256: input.checksumSha256 ?? null,
    uploaderId: input.uploaderId ?? null,
    workspaceId: input.workspaceId ?? null,
    privacy: input.privacy ?? "private",
    processingStatus: "awaiting_upload",
    sourceProvenance: "user_selected_local_file",
    parserVersion: DOCUMENT_INTAKE_LIMITS.parserVersion,
    extractionWarnings: storageConfigured
      ? []
      : ["Secure object storage is not connected; file bytes were not uploaded."],
    mimeType: input.mimeType ?? "application/pdf",
  };

  return {
    metadata,
    storageConfigured,
    scanStatus: OBJECT_STORAGE_RULES.virusScanRequiredForProduction ? "not_configured" : "pending",
    lifecycle: "draft",
    outline: [],
    passages: [],
    userMessageKey: storageConfigured
      ? "voiceCommand.announcedScientificIntake"
      : "voiceCommand.scientificIntakeStorageRequired",
  };
}

/** Test-only mock adapter — never used for production claims. */
export function mockProcessUploadedDocument(
  session: DocumentIntakeSession,
  extracted: { readonly outline: readonly DocumentOutlineSection[]; readonly passages: readonly ExtractedPassage[] },
): DocumentIntakeSession {
  if (!session.storageConfigured && process.env.NODE_ENV === "production") {
    return {
      ...session,
      metadata: {
        ...session.metadata,
        processingStatus: "failed",
        extractionWarnings: [
          ...session.metadata.extractionWarnings,
          "Production storage is required before processing.",
        ],
      },
      userMessageKey: "voiceCommand.scientificIntakeStorageRequired",
    };
  }
  const lifecycle: ObjectLifecycleStatus = "ready";
  const scanStatus: ScanStatus = "clean";
  const ready = mayClaimReady(lifecycle, scanStatus);
  return {
    ...session,
    storageConfigured: true,
    scanStatus,
    lifecycle,
    outline: extracted.outline,
    passages: extracted.passages.map((p) => ({
      ...p,
      kind: p.kind === "ai_summary" ? "ai_summary" : "extracted",
    })),
    metadata: {
      ...session.metadata,
      uploadedAt: new Date().toISOString(),
      processingStatus: ready ? "ready" : "partial",
      extractionWarnings: extracted.outline.some((s) => !s.detected)
        ? ["Some expected sections were not detected; nothing was fabricated."]
        : [],
    },
    userMessageKey: "voiceCommand.announcedScientificIntake",
  };
}

export function validateDocumentUploadCandidate(input: {
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly mimeType: string | null;
  readonly headerBytes?: ArrayBuffer | Uint8Array | null;
}): { ok: true } | { ok: false; reason: "type" | "size" | "signature" | "empty" } {
  if (input.sizeBytes <= 0) return { ok: false, reason: "empty" };
  if (input.sizeBytes > DOCUMENT_INTAKE_LIMITS.maxBytes) return { ok: false, reason: "size" };
  const lower = input.fileName.toLowerCase();
  const mimeOk = input.mimeType === "application/pdf" || lower.endsWith(".pdf");
  if (!mimeOk) return { ok: false, reason: "type" };
  if (input.headerBytes && !isPdfSignature(input.headerBytes)) {
    return { ok: false, reason: "signature" };
  }
  return { ok: true };
}
