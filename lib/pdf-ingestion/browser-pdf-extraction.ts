export type ExtractedPdfPage = {
  readonly pageNumber: number;
  readonly text: string;
};

export type BrowserPdfExtraction = {
  readonly pageCount: number;
  readonly pages: readonly ExtractedPdfPage[];
  readonly characterCount: number;
  readonly truncated: boolean;
  readonly likelyScannedDocument: boolean;
  readonly detectedHeadings: readonly string[];
  readonly parserVersion: string;
  readonly provenance: "browser_pdfjs_local";
};

const MAX_EXTRACTED_CHARACTERS = 500_000;
const MAX_PAGES = 600;

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function detectHeadings(text: string): readonly string[] {
  const candidates = [
    "abstract",
    "introduction",
    "research question",
    "methodology",
    "methods",
    "results",
    "findings",
    "discussion",
    "conclusion",
    "references",
    "appendix",
  ];
  const lower = text.toLowerCase();
  return candidates.filter((heading) => lower.includes(heading));
}

export async function extractPdfLocally(
  file: File,
  signal?: AbortSignal,
): Promise<BrowserPdfExtraction> {
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    isEvalSupported: false,
    stopAtErrors: true,
    useSystemFonts: false,
  });
  const document = await loadingTask.promise;
  const pageLimit = Math.min(document.numPages, MAX_PAGES);
  const pages: ExtractedPdfPage[] = [];
  let characterCount = 0;
  let truncated = document.numPages > pageLimit;

  try {
    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = cleanText(
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" "),
      );
      const remaining = MAX_EXTRACTED_CHARACTERS - characterCount;
      if (remaining <= 0) {
        truncated = true;
        break;
      }
      const retained = text.slice(0, remaining);
      pages.push({ pageNumber, text: retained });
      characterCount += retained.length;
      if (retained.length < text.length) {
        truncated = true;
        break;
      }
    }
  } finally {
    await document.destroy();
  }

  const combined = pages.map((page) => page.text).join("\n");
  return {
    pageCount: document.numPages,
    pages,
    characterCount,
    truncated,
    likelyScannedDocument:
      document.numPages > 0 && characterCount / document.numPages < 80,
    detectedHeadings: detectHeadings(combined),
    parserVersion: "pdfjs-5.4.624-local-v1",
    provenance: "browser_pdfjs_local",
  };
}
