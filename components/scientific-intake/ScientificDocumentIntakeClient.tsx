"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import ArtifactResearchRoom from "@/components/artifact-workspace/ArtifactResearchRoom";
import {
  confirmScientificIntake,
  createScientificIntakeDraft,
  readScientificIntakeRecords,
  upsertScientificIntakeRecord,
  type ScientificDocumentPrivacy,
  type ScientificDocumentType,
} from "@/lib/scientific-intake/scientific-intake";
import { deriveDocumentUploadReadiness } from "@/lib/platform-capabilities/capability-registry";
import { createDocumentIntakeDraft } from "@/lib/document-intake/document-intake";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useOperationalObjectsOptional } from "@/components/operational-objects/OperationalObjectProvider";
import {
  buildIntakeOperationalDraft,
  INTAKE_OBJECT_PROPOSALS,
} from "@/lib/scientific-intake/intake-to-operational-draft";
import type { OperationalObjectType } from "@/lib/operational-objects/operational-object.types";

export default function ScientificDocumentIntakeClient() {
  const { t, language } = useTranslation();
  const { isSignedIn } = useAuth();
  const operationalObjects = useOperationalObjectsOptional();
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
  const [userQuestion, setUserQuestion] = useState("");
  const records = typeof window !== "undefined" ? readScientificIntakeRecords() : [];
  const uploadReadiness = deriveDocumentUploadReadiness();
  const storageConfigured = uploadReadiness === "available";
  const quarantineStorageConfigured = isSupabaseConfigured();
  const intakeHonesty = createDocumentIntakeDraft({
    originalFilename: fileName ?? "thesis.pdf",
    fileSizeBytes: fileSize ?? 0,
    contentLocale,
    privacy: privacy === "public-draft" ? "public" : privacy === "team" ? "team" : "private",
  });

  function openIntakeWork(proposedType: OperationalObjectType) {
    if (!operationalObjects) return;
    const { draft, inferredFields } = buildIntakeOperationalDraft({
      locale: language,
      title,
      purpose: purpose || userQuestion,
      domainLabel: domain,
      documentType,
      proposedType,
      userQuestion: userQuestion || undefined,
      attachment: fileName
        ? {
            fileName,
            mimeType: fileMime,
            fileSizeBytes: fileSize,
            source: "user_upload",
            createdAt: new Date().toISOString(),
            userDescription: purpose || userQuestion || title,
            contentLocale,
          }
        : null,
    });
    operationalObjects.openComposer(draft, inferredFields, "manual");
    setStatusMessage(t("operationalObject.intakeNextAction"));
  }

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
      {!storageConfigured ? (
        <p
          role="status"
          data-storage-required="1"
          className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3 text-sm text-[var(--cbai-text-primary)]"
        >
          {quarantineStorageConfigured
            ? language === "uz"
              ? "Private karantin storage ulangan. Tashqi malware scanner clean natija bermaguncha server processing yopiq qoladi."
              : "Private quarantine storage is connected. Server processing remains blocked until an external malware scanner returns clean."
            : t("voiceCommand.scientificIntakeStorageRequired")}
        </p>
      ) : null}
      <ArtifactResearchRoom />
      <p className="mb-4 mt-5 text-xs text-[var(--cbai-text-secondary)]" data-intake-status={intakeHonesty.metadata.processingStatus}>
        {intakeHonesty.metadata.extractionWarnings[0] ?? null}
      </p>
      <details className="mt-6 rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] p-4">
        <summary className="cursor-pointer text-sm font-medium">Advanced scientific intake metadata</summary>
      <form
        className="mt-5 grid max-w-xl gap-3"
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
        <label className="grid gap-1 text-sm" htmlFor={`${formId}-question`}>
          {t("operationalObject.intakeProposeResearchQuestion")}
          <textarea
            id={`${formId}-question`}
            className="min-h-20 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3 py-2"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="What would be required to make this vehicle operate?"
            data-cbai-intake-question=""
          />
        </label>
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
      </details>
      {operationalObjects ? (
        <section className="mt-8 space-y-3" data-cbai-intake-interpretation="" aria-labelledby={`${formId}-interpret`}>
          <h2 id={`${formId}-interpret`} className="text-base font-medium">
            {t("operationalObject.intakeCreateWork")}
          </h2>
          <p className="text-sm text-[var(--cbai-text-secondary)]">{t("operationalObject.intakeInterpretationRationale")}</p>
          <p className="text-xs text-[var(--cbai-text-muted)]">{t("operationalObject.intakeAssumptionNoAutoValidation")}</p>
          <div className="flex flex-wrap gap-2">
            {INTAKE_OBJECT_PROPOSALS.map((proposal) => (
              <button
                key={`${proposal.type}-${proposal.labelKey}`}
                type="button"
                className="min-h-11 rounded-lg border border-[var(--cbai-border-default)] px-3 text-xs focus-visible:outline focus-visible:outline-2"
                onClick={() => openIntakeWork(proposal.type)}
              >
                {t(proposal.labelKey)}
              </button>
            ))}
          </div>
        </section>
      ) : null}
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
