"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getPdfCopy } from "@/lib/i18n/platform-copy-pdf";
import {
  createLocalPdfMetadata,
  validatePdfFile,
  type LocalPdfMetadata,
} from "@/lib/pdf-ingestion/local-pdf-ingestion";

export default function LocalPdfIntake() {
  const { language } = useTranslation();
  const copy = getPdfCopy(language);
  const [file, setFile] = useState<File | null>(null);
  const [originalLanguage, setOriginalLanguage] = useState(language);
  const [metadata, setMetadata] = useState<LocalPdfMetadata | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setFile(null);
    setMetadata(null);
    setStatus(null);
  };

  return (
    <section className="mb-8 rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] p-5">
      <h2 className="text-lg font-semibold">{copy.title}</h2>
      <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">{copy.intro}</p>
      <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm text-amber-200">
        {copy.privacy}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          {copy.choose}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="min-h-11"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setFile(nextFile);
              setMetadata(null);
              const validation = validatePdfFile(nextFile);
              setStatus(
                validation.ok
                  ? null
                  : validation.reason === "invalid_type"
                    ? copy.invalidType
                    : validation.reason === "file_too_large"
                      ? copy.tooLarge
                      : validation.reason === "empty_file"
                        ? copy.empty
                        : copy.required,
              );
            }}
          />
        </label>
        <label className="grid gap-1 text-sm">
          {copy.language}
          <input
            className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
            value={originalLanguage}
            onChange={(event) => setOriginalLanguage(event.target.value)}
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          className="min-h-11 rounded-lg bg-[var(--cbai-accent-primary)] px-4 text-sm font-medium text-[var(--cbai-on-accent)] disabled:opacity-50"
          onClick={async () => {
            const validation = validatePdfFile(file);
            if (!validation.ok) {
              setStatus(
                validation.reason === "invalid_type"
                  ? copy.invalidType
                  : validation.reason === "file_too_large"
                    ? copy.tooLarge
                    : validation.reason === "empty_file"
                      ? copy.empty
                      : copy.required,
              );
              return;
            }
            if (!file) {
              setStatus(copy.required);
              return;
            }
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            setBusy(true);
            setStatus(copy.validating);
            try {
              const result = await createLocalPdfMetadata(file, {
                originalLanguage: originalLanguage || null,
                signal: controller.signal,
              });
              setMetadata(result);
              setStatus(copy.ready);
            } catch (error) {
              if (!(error instanceof DOMException && error.name === "AbortError")) {
                setStatus(copy.unavailable);
              }
            } finally {
              if (abortRef.current === controller) abortRef.current = null;
              setBusy(false);
            }
          }}
        >
          {busy ? copy.validating : copy.validate}
        </button>
        <button type="button" onClick={cancel} className="min-h-11 rounded-lg border border-[var(--cbai-border-default)] px-4 text-sm">
          {copy.cancel}
        </button>
      </div>
      {status ? <p role="status" className="mt-3 text-sm text-[var(--cbai-text-secondary)]">{status}</p> : null}
      {metadata ? (
        <dl className="mt-4 grid gap-3 rounded-lg bg-[var(--cbai-surface-muted)] p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.checksum}</dt><dd className="mt-1 break-all font-mono text-xs">{metadata.checksumSha256}</dd></div>
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.pageCount}</dt><dd className="mt-1">{copy.notAvailable}</dd></div>
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.localOnly}</dt><dd className="mt-1">{metadata.fileName}</dd></div>
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.language}</dt><dd className="mt-1">{metadata.originalLanguage ?? copy.notAvailable}</dd></div>
          <p className="text-[var(--cbai-text-muted)] sm:col-span-2">{copy.unavailable}</p>
        </dl>
      ) : null}
    </section>
  );
}
