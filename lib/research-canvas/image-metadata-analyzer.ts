/**
 * Image metadata analyzer — honest local extraction only.
 * Does not infer chemical composition from photographs.
 */

export type ImageMetadataResult = {
  readonly fileName: string;
  readonly mimeType: string;
  readonly fileSizeBytes: number;
  readonly pixelWidth?: number | null;
  readonly pixelHeight?: number | null;
  readonly aspectRatio?: number | null;
  readonly colorMode?: string | null;
  readonly orientation?: string | null;
  readonly hasScaleInformation: boolean;
  readonly scaleNote: string;
  readonly exifAvailable: boolean;
  readonly exifSummary?: string | null;
  readonly limitations: readonly string[];
};

export function analyzeImageMetadata(input: {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  pixelWidth?: number | null;
  pixelHeight?: number | null;
  exifSummary?: string | null;
}): ImageMetadataResult {
  const limitations: string[] = [
    "Raster image metadata only — not a calibrated measurement.",
    "Chemical composition cannot be inferred from ordinary photographs.",
    "OCR and handwriting recognition unavailable unless explicitly configured.",
  ];

  const aspectRatio =
    input.pixelWidth && input.pixelHeight
      ? Number((input.pixelWidth / input.pixelHeight).toFixed(4))
      : null;

  return {
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
    pixelWidth: input.pixelWidth ?? null,
    pixelHeight: input.pixelHeight ?? null,
    aspectRatio,
    colorMode: input.mimeType.startsWith("image/") ? "unknown without decode" : null,
    orientation: null,
    hasScaleInformation: false,
    scaleNote: "No embedded scale — user must define reference calibration.",
    exifAvailable: Boolean(input.exifSummary),
    exifSummary: input.exifSummary ?? null,
    limitations,
  };
}

export function analyzePdfMetadata(input: {
  fileName: string;
  fileSizeBytes: number;
  pageCount?: number | null;
}): ImageMetadataResult {
  return {
    fileName: input.fileName,
    mimeType: "application/pdf",
    fileSizeBytes: input.fileSizeBytes,
    pixelWidth: null,
    pixelHeight: null,
    aspectRatio: null,
    colorMode: null,
    orientation: null,
    hasScaleInformation: false,
    scaleNote: "PDF attachment metadata only — OCR not implemented.",
    exifAvailable: false,
    exifSummary: input.pageCount != null ? `Pages: ${input.pageCount}` : null,
    limitations: [
      "PDF page count when provided by user — full-text extraction not implemented.",
      "Do not treat PDF metadata as experimental evidence.",
    ],
  };
}
