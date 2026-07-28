import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const extractor = readFileSync(
  new URL("../lib/pdf-ingestion/browser-pdf-extraction.ts", import.meta.url),
  "utf8",
);
const room = readFileSync(
  new URL("../components/artifact-workspace/ArtifactResearchRoom.tsx", import.meta.url),
  "utf8",
);

test("PDF extraction is local, bounded, and provenance-labelled", () => {
  assert.match(extractor, /MAX_EXTRACTED_CHARACTERS\s*=\s*500_000/);
  assert.match(extractor, /MAX_PAGES\s*=\s*600/);
  assert.match(extractor, /isEvalSupported:\s*false/);
  assert.match(extractor, /stopAtErrors:\s*true/);
  assert.match(extractor, /provenance:\s*"browser_pdfjs_local"/);
});

test("scanned documents and truncation stay visible", () => {
  assert.match(extractor, /likelyScannedDocument/);
  assert.match(extractor, /truncated/);
  assert.match(room, /data-cbai-local-pdf-extraction/);
  assert.match(room, /scanned_document_unsupported/);
});
