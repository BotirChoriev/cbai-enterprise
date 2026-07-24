/**
 * Scientific Document Intake — draft + async ingestion contract.
 * Nothing is uploaded or saved before explicit confirmation.
 */

export type ScientificDocumentPrivacy = "private" | "team" | "public-draft";

export type ScientificDocumentType =
  | "phd_dissertation"
  | "thesis"
  | "journal_article"
  | "preprint"
  | "report"
  | "other";

export type ScientificIntakeStatus =
  | "draft"
  | "received"
  | "checking"
  | "indexing"
  | "ready"
  | "failed"
  | "cancelled"
  | "queued_pending";

export type ScientificIntakeDraft = {
  readonly id: string;
  readonly title: string;
  readonly documentType: ScientificDocumentType;
  readonly scientificDomain: string;
  readonly contentLocale: string;
  readonly authorOwner: string;
  readonly privacy: ScientificDocumentPrivacy;
  readonly analysisPurpose: string;
  readonly requestedOutputs: readonly string[];
  readonly copyrightConfirmed: boolean;
  readonly fileName: string | null;
  readonly fileSizeBytes: number | null;
  readonly fileMime: string | null;
  readonly status: ScientificIntakeStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdLocale: string;
  readonly provenanceOriginalText: string | null;
};

export type IngestionContractStep =
  | "secure_upload"
  | "type_size_validation"
  | "malware_scan_boundary"
  | "ocr_if_needed"
  | "page_section_segmentation"
  | "figure_table_formula_reference_extraction"
  | "semantic_chunking"
  | "citation_page_provenance"
  | "status_updates"
  | "retry_without_duplicate"
  | "cancellation";

export const INGESTION_CONTRACT_STEPS: readonly IngestionContractStep[] = [
  "secure_upload",
  "type_size_validation",
  "malware_scan_boundary",
  "ocr_if_needed",
  "page_section_segmentation",
  "figure_table_formula_reference_extraction",
  "semantic_chunking",
  "citation_page_provenance",
  "status_updates",
  "retry_without_duplicate",
  "cancellation",
] as const;

const STORE_KEY = "cbai-scientific-intake-records";

export const MAX_SCIENTIFIC_UPLOAD_BYTES = 200 * 1024 * 1024; // 200 MB honest ceiling
export const ALLOWED_SCIENTIFIC_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export function createScientificIntakeDraft(partial: Partial<ScientificIntakeDraft> & { createdLocale: string }): ScientificIntakeDraft {
  const now = new Date().toISOString();
  return {
    id: `sci_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title: partial.title ?? "",
    documentType: partial.documentType ?? "phd_dissertation",
    scientificDomain: partial.scientificDomain ?? "",
    contentLocale: partial.contentLocale ?? partial.createdLocale,
    authorOwner: partial.authorOwner ?? "",
    privacy: partial.privacy ?? "private",
    analysisPurpose: partial.analysisPurpose ?? "",
    requestedOutputs: partial.requestedOutputs ?? [],
    copyrightConfirmed: partial.copyrightConfirmed ?? false,
    fileName: partial.fileName ?? null,
    fileSizeBytes: partial.fileSizeBytes ?? null,
    fileMime: partial.fileMime ?? null,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdLocale: partial.createdLocale,
    provenanceOriginalText: partial.provenanceOriginalText ?? null,
  };
}

export function validateScientificFileMeta(fileName: string | null, size: number | null, mime: string | null): {
  ok: boolean;
  reasonKey?: string;
} {
  if (!fileName) return { ok: false, reasonKey: "authCollab.intakeFileRequired" };
  if (size != null && size > MAX_SCIENTIFIC_UPLOAD_BYTES) {
    return { ok: false, reasonKey: "authCollab.intakeFileTooLarge" };
  }
  if (mime && !ALLOWED_SCIENTIFIC_MIME.includes(mime as (typeof ALLOWED_SCIENTIFIC_MIME)[number])) {
    const lower = fileName.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".doc") && !lower.endsWith(".txt")) {
      return { ok: false, reasonKey: "authCollab.intakeFileTypeUnsupported" };
    }
  }
  return { ok: true };
}

/** Confirm creates a queued_pending record — never claims ready without a backend. */
export function confirmScientificIntake(draft: ScientificIntakeDraft): ScientificIntakeDraft {
  if (!draft.copyrightConfirmed) {
    throw new Error("copyright_confirmation_required");
  }
  const fileCheck = validateScientificFileMeta(draft.fileName, draft.fileSizeBytes, draft.fileMime);
  if (!fileCheck.ok) {
    throw new Error(fileCheck.reasonKey ?? "file_invalid");
  }
  return {
    ...draft,
    status: "queued_pending",
    updatedAt: new Date().toISOString(),
  };
}

export function readScientificIntakeRecords(): readonly ScientificIntakeDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScientificIntakeDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertScientificIntakeRecord(record: ScientificIntakeDraft): void {
  if (typeof window === "undefined") return;
  const existing = [...readScientificIntakeRecords()];
  const idx = existing.findIndex((r) => r.id === record.id);
  if (idx >= 0) existing[idx] = record;
  else existing.unshift(record);
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(existing));
  } catch {
    /* ignore */
  }
}

export function matchScientificIntakeIntent(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /(phd|dissert|doktorlik|диссертац|tez|400\s*sahifa|400-page|upload.*(paper|document|pdf)|yubor|yukla|qayerga.*(yubor|yukla)|where.*(upload|send)|scientific\s+document|ilmiy\s+hujjat)/i.test(
      t,
    )
  );
}
