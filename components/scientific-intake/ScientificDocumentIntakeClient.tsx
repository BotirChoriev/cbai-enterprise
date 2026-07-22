"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  confirmScientificIntake,
  createScientificIntakeDraft,
  readScientificIntakeRecords,
  upsertScientificIntakeRecord,
  type ScientificDocumentPrivacy,
  type ScientificDocumentType,
} from "@/lib/scientific-intake/scientific-intake";

export default function ScientificDocumentIntakeClient() {
  const { t, language } = useTranslation();
  const { isSignedIn } = useAuth();
  const params = useSearchParams();
  const prepare = params.get("prepare") === "1";
  const formId = useId();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [title, setTitle] = useState(prepare ? "Chemistry PhD dissertation" : "");
  const [documentType, setDocumentType] = useState<ScientificDocumentType>("phd_dissertation");
  const [domain, setDomain] = useState("chemistry");
  const [contentLocale, setContentLocale] = useState(language);
  const [author, setAuthor] = useState("");
  const [privacy, setPrivacy] = useState<ScientificDocumentPrivacy>("private");
  const [purpose, setPurpose] = useState("");
  const [outputs, setOutputs] = useState("");
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const records = typeof window !== "undefined" ? readScientificIntakeRecords() : [];

  if (!isSignedIn) {
    return (
      <OperatingPageShell title={t("authCollab.intakeTitle")} description={t("authCollab.intakeSignInRequired")}>
        <Link
          href="/account?resume=pending"
          className="inline-flex min-h-11 items-center rounded-lg bg-[var(--cbai-accent-primary)] px-4 text-sm font-medium text-[var(--cbai-on-accent)] focus-visible:outline focus-visible:outline-2"
        >
          {t("authCollab.consentOpenAccount")}
        </Link>
      </OperatingPageShell>
    );
  }

  return (
    <OperatingPageShell title={t("authCollab.intakeTitle")} description={t("authCollab.intakeIntro")}>
      <div aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
      {statusMessage ? (
        <p role="status" className="mb-4 rounded-lg border border-[var(--cbai-border-default)] px-3 py-2 text-sm">
          {statusMessage}
        </p>
      ) : null}
      <form
        className="grid max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          try {
            const draft = createScientificIntakeDraft({
              title,
              documentType,
              scientificDomain: domain,
              contentLocale,
              authorOwner: author,
              privacy,
              analysisPurpose: purpose,
              requestedOutputs: outputs
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              copyrightConfirmed,
              fileName,
              fileSizeBytes: fileSize,
              fileMime,
              createdLocale: language,
              provenanceOriginalText: prepare ? "voice_prepare" : null,
            });
            const queued = confirmScientificIntake(draft);
            upsertScientificIntakeRecord(queued);
            setStatusMessage(t("authCollab.intakeQueued"));
          } catch (error) {
            const key = error instanceof Error ? error.message : "authCollab.intakeFileRequired";
            setStatusMessage(t(key.startsWith("authCollab.") ? key : "authCollab.intakeFileRequired"));
          }
        }}
      >
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-title`}>
          {t("authCollab.intakeFieldTitle")}
          <input
            id={`${formId}-title`}
            className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-type`}>
          {t("authCollab.intakeFieldType")}
          <select
            id={`${formId}-type`}
            className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as ScientificDocumentType)}
          >
            <option value="phd_dissertation">PhD / dissertation</option>
            <option value="thesis">Thesis</option>
            <option value="journal_article">Journal article</option>
            <option value="preprint">Preprint</option>
            <option value="report">Report</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-domain`}>
          {t("authCollab.intakeFieldDomain")}
          <input
            id={`${formId}-domain`}
            className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-lang`}>
          {t("authCollab.intakeFieldLanguage")}
          <input
            id={`${formId}-lang`}
            className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
            value={contentLocale}
            onChange={(e) => setContentLocale(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-author`}>
          {t("authCollab.intakeFieldAuthor")}
          <input
            id={`${formId}-author`}
            className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
        <fieldset className="grid gap-2 text-sm">
          <legend>{t("authCollab.intakeFieldPrivacy")}</legend>
          {(["private", "team", "public-draft"] as const).map((value) => (
            <label key={value} className="flex min-h-11 items-center gap-2">
              <input type="radio" name="privacy" checked={privacy === value} onChange={() => setPrivacy(value)} />
              {value === "private"
                ? t("authCollab.privacyPrivate")
                : value === "team"
                  ? t("authCollab.privacyTeam")
                  : t("authCollab.privacyPublicDraft")}
            </label>
          ))}
        </fieldset>
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-purpose`}>
          {t("authCollab.intakeFieldPurpose")}
          <textarea
            id={`${formId}-purpose`}
            className="min-h-24 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3 py-2"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-outputs`}>
          {t("authCollab.intakeFieldOutputs")}
          <input
            id={`${formId}-outputs`}
            className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
            value={outputs}
            onChange={(e) => setOutputs(e.target.value)}
            placeholder="summary, figures, citations"
          />
        </label>
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-file`}>
          {t("authCollab.intakeFieldFile")}
          <input
            id={`${formId}-file`}
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf"
            className="min-h-11 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setFileName(file?.name ?? null);
              setFileSize(file?.size ?? null);
              setFileMime(file?.type || null);
            }}
          />
        </label>
        <label className="flex min-h-11 items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={copyrightConfirmed}
            onChange={(e) => setCopyrightConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span>{t("authCollab.intakeCopyright")}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-[var(--cbai-accent-primary)] px-4 text-sm font-medium text-[var(--cbai-on-accent)] focus-visible:outline focus-visible:outline-2"
          >
            {t("authCollab.intakeConfirm")}
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-[var(--cbai-border-default)] px-4 text-sm focus-visible:outline focus-visible:outline-2"
            onClick={() => {
              setTitle("");
              setStatusMessage(null);
              setCopyrightConfirmed(false);
              setFileName(null);
            }}
          >
            {t("authCollab.intakeCancel")}
          </button>
        </div>
      </form>
      <section className="mt-8" aria-labelledby={`${formId}-records`}>
        <h2 id={`${formId}-records`} className="text-base font-medium">
          {t("authCollab.linkScientific")}
        </h2>
        {records.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">{t("authCollab.emptyNoItems")}</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {records.map((record) => (
              <li key={record.id} className="rounded-md border border-[var(--cbai-border-default)] px-3 py-2">
                <span className="font-medium">{record.title || record.id}</span>
                <span className="text-[var(--muted)]"> — {record.status}</span>
                <span className="block text-xs text-[var(--muted)]">
                  {t("authCollab.sourceContentLabel")}: {record.contentLocale}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </OperatingPageShell>
  );
}
