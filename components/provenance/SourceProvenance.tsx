"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getProvenanceCopy } from "@/lib/i18n/platform-copy-provenance";
import type {
  CoverageState,
  FreshnessStatus,
  SourceMaterialKind,
  SourceProvenance,
} from "@/lib/intelligence-os/source-provenance";

const STATUS_CLASS: Record<FreshnessStatus, string> = {
  current: "border-emerald-500/30 text-emerald-300",
  aging: "border-amber-500/30 text-amber-300",
  stale: "border-amber-500/30 text-amber-300",
  update_expected: "border-amber-500/30 text-amber-300",
  unavailable: "border-zinc-500/30 text-zinc-400",
  verification_required: "border-violet-500/30 text-violet-300",
};

const MATERIAL_CLASS: Record<SourceMaterialKind, string> = {
  official_source: "border-emerald-500/30 text-emerald-300",
  retrieved_evidence: "border-teal-500/30 text-teal-300",
  user_provided: "border-sky-500/30 text-sky-300",
  deterministic_label: "border-zinc-500/30 text-zinc-300",
  ai_generated_summary: "border-violet-500/30 text-violet-300",
  inference: "border-amber-500/30 text-amber-300",
  unresolved_question: "border-violet-500/30 text-violet-300",
};

function formatDate(value: string | null, locale: string, unavailable: string): string {
  if (!value || Number.isNaN(Date.parse(value))) return unavailable;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value),
  );
}

export function FreshnessBadge({ status }: { status: FreshnessStatus }) {
  const { language } = useTranslation();
  const copy = getProvenanceCopy(language);
  const label = copy[
    status === "update_expected"
      ? "updateExpected"
      : status === "verification_required"
        ? "verificationRequired"
        : status
  ];
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[status]}`}>
      {label}
    </span>
  );
}

export function SourceBadge({ kind }: { kind: SourceMaterialKind }) {
  const { language } = useTranslation();
  const copy = getProvenanceCopy(language);
  const key: Record<SourceMaterialKind, keyof typeof copy> = {
    official_source: "officialSource",
    retrieved_evidence: "retrievedEvidence",
    user_provided: "userProvided",
    deterministic_label: "deterministicLabel",
    ai_generated_summary: "aiSummary",
    inference: "inference",
    unresolved_question: "unresolvedQuestion",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${MATERIAL_CLASS[kind]}`}>
      {copy[key[kind]]}
    </span>
  );
}

export function LastVerified({ value }: { value: string | null }) {
  const { language } = useTranslation();
  const copy = getProvenanceCopy(language);
  return (
    <span className="text-xs text-[var(--cbai-text-muted)]">
      {copy.lastVerified}: {formatDate(value, language, copy.dateUnavailable)}
    </span>
  );
}

export function EvidenceCoverage({ state }: { state: CoverageState }) {
  const { language } = useTranslation();
  const copy = getProvenanceCopy(language);
  const labels: Record<CoverageState, Record<string, string>> = {
    complete: { en: "Complete", uz: "Toʻliq", ru: "Полное", tr: "Tam" },
    partial: { en: "Partial", uz: "Qisman", ru: "Частичное", tr: "Kısmi" },
    missing: { en: "Missing", uz: "Yetishmaydi", ru: "Отсутствует", tr: "Eksik" },
    not_applicable: { en: "Not applicable", uz: "Tatbiq etilmaydi", ru: "Не применимо", tr: "Uygulanamaz" },
  };
  return (
    <span className="text-xs text-[var(--cbai-text-muted)]">
      {copy.coverage}: {labels[state][language] ?? labels[state].en}
    </span>
  );
}

export function ProvenanceDrawer({
  source,
  open,
  onClose,
}: {
  source: SourceProvenance;
  open: boolean;
  onClose: () => void;
}) {
  const { language } = useTranslation();
  const copy = getProvenanceCopy(language);
  const titleId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="presentation">
      <button className="absolute inset-0 bg-black/55" aria-label={copy.close} onClick={onClose} />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative h-full w-full max-w-md overflow-y-auto border-l border-[var(--cbai-border-default)] bg-[var(--cbai-inspector-surface)] p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <SourceBadge kind={source.materialKind} />
            <h2 id={titleId} className="mt-3 text-lg font-semibold">{source.sourceTitle}</h2>
            <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">{source.sourceOrganization}</p>
          </div>
          <button className="min-h-11 rounded-lg border border-[var(--cbai-border-default)] px-3 text-sm" onClick={onClose}>
            {copy.close}
          </button>
        </div>
        <dl className="mt-6 grid gap-4 text-sm">
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.freshness}</dt><dd className="mt-1"><FreshnessBadge status={source.freshness.freshnessStatus} /></dd></div>
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.lastVerified}</dt><dd className="mt-1">{formatDate(source.freshness.verifiedAt, language, copy.dateUnavailable)}</dd></div>
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.methodology}</dt><dd className="mt-1">{source.freshness.verificationMethod ?? copy.dateUnavailable}</dd></div>
          <div><dt className="text-[var(--cbai-text-muted)]">{copy.limitations}</dt><dd className="mt-1">{source.knownLimitations.length ? source.knownLimitations.join("; ") : "—"}</dd></div>
        </dl>
        {source.canonicalUrl ? (
          <a className="mt-6 inline-flex min-h-11 items-center text-sm text-[var(--cbai-accent-primary)] underline" href={source.canonicalUrl} target="_blank" rel="noreferrer">
            {copy.source}: {source.sourceOrganization}
          </a>
        ) : null}
      </aside>
    </div>
  );
}

export function AiSourceDisclosure({ source }: { source: SourceProvenance }) {
  const { language } = useTranslation();
  const copy = getProvenanceCopy(language);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="min-h-11 text-sm font-medium text-[var(--cbai-accent-primary)] underline underline-offset-4"
        onClick={() => setOpen(true)}
      >
        {copy.sourcesUsed}
      </button>
      <ProvenanceDrawer source={source} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
