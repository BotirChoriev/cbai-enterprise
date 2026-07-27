/**
 * Local-only PDF intake contract.
 *
 * Files are not transmitted or persisted. The browser computes metadata and a
 * SHA-256 checksum after explicit selection. Extraction remains unavailable
 * until a reviewed server-side parser/storage boundary is configured.
 */

export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export const PDF_MIME = "application/pdf";

export type PdfExtractionStatus =
  | "not_started"
  | "validating"
  | "metadata_ready"
  | "duplicate"
  | "scanned_document_unsupported"
  | "server_extraction_unavailable"
  | "cancelled"
  | "failed";

export type LocalPdfMetadata = {
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly mimeType: string;
  readonly checksumSha256: string;
  readonly pageCount: number | null;
  readonly originalLanguage: string | null;
  readonly selectedAt: string;
  readonly extractionStatus: PdfExtractionStatus;
  readonly persistence: "local_metadata_only";
  readonly limitations: readonly string[];
};

export type PdfValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "file_required" | "invalid_type" | "file_too_large" | "empty_file" };

export function validatePdfFile(file: Pick<File, "name" | "type" | "size"> | null): PdfValidationResult {
  if (!file) return { ok: false, reason: "file_required" };
  if (file.size <= 0) return { ok: false, reason: "empty_file" };
  if (file.size > MAX_PDF_BYTES) return { ok: false, reason: "file_too_large" };
  if (file.type !== PDF_MIME || !file.name.toLocaleLowerCase("en").endsWith(".pdf")) {
    return { ok: false, reason: "invalid_type" };
  }
  return { ok: true };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function checksumPdf(file: File, signal?: AbortSignal): Promise<string> {
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  const bytes = await file.arrayBuffer();
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  return bytesToHex(new Uint8Array(digest));
}

export async function createLocalPdfMetadata(
  file: File,
  input: { readonly originalLanguage: string | null; readonly signal?: AbortSignal },
): Promise<LocalPdfMetadata> {
  const validation = validatePdfFile(file);
  if (!validation.ok) throw new Error(validation.reason);
  const checksumSha256 = await checksumPdf(file, input.signal);
  return {
    fileName: file.name,
    sizeBytes: file.size,
    mimeType: file.type,
    checksumSha256,
    pageCount: null,
    originalLanguage: input.originalLanguage,
    selectedAt: new Date().toISOString(),
    extractionStatus: "server_extraction_unavailable",
    persistence: "local_metadata_only",
    limitations: [
      "The source file was not uploaded or persisted.",
      "Text, page references, citations, and evidence candidates were not extracted.",
      "A reviewed server-side storage, malware scanning, and PDF extraction service is required.",
    ],
  };
}

export function isDuplicatePdf(
  checksumSha256: string,
  existing: readonly Pick<LocalPdfMetadata, "checksumSha256">[],
): boolean {
  return existing.some((item) => item.checksumSha256 === checksumSha256);
}

export type ReportExportProvenance = {
  readonly reportTitle: string;
  readonly subject: string;
  readonly generatedAt: string;
  readonly coveragePeriod: string | null;
  readonly evidenceStatus: "verified" | "partial" | "human_review_required";
  readonly sourceIds: readonly string[];
  readonly limitations: readonly string[];
  readonly humanApprovalState: "draft" | "approved";
  readonly locale: string;
};

export function canExportApprovedReport(input: ReportExportProvenance): boolean {
  return (
    input.humanApprovalState === "approved" &&
    input.sourceIds.length > 0 &&
    input.limitations.length > 0 &&
    Boolean(input.reportTitle.trim() && input.subject.trim())
  );
}
