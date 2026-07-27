"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getAdaptiveWorkspaceCopy } from "@/lib/i18n/platform-copy-adaptive-workspace";
import { getBrandLocaleCopy, CANONICAL_BRAND_FACTS } from "@/lib/brand/canonical-identity";
import {
  buildWorkspaceCreationDraft,
  interpretRoleStatement,
  type WorkspaceCreationDraft,
} from "@/lib/adaptive-workspace/role-discovery";
import { getWorkspaceTemplate, listWorkspaceTemplates } from "@/lib/adaptive-workspace/templates";
import { useOperationalObjects } from "@/components/operational-objects/OperationalObjectProvider";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondary,
  cbaiEmptyDashed,
  cbaiPageHeader,
  cbaiPanelPadding,
  cbaiSectionEyebrow,
  cbaiSectionTitle,
  cbaiSurfaceSolid,
  cbaiTextBody,
  cbaiTextMuted,
} from "@/components/brand/brand-classes";

function chemistSeedStatement(locale: string): string {
  if (locale === "uz") return "Men kimyogarman";
  if (locale === "ru") return "Я химик";
  if (locale === "tr") return "Ben kimyagerim";
  return "I am a chemist";
}

function templateTitle(
  id: string,
  copy: ReturnType<typeof getAdaptiveWorkspaceCopy>,
): string {
  switch (id) {
    case "student":
      return copy.templateStudent;
    case "researcher_scientist":
      return copy.templateResearcher;
    case "chemist_scientist":
      return copy.templateChemist;
    case "academic_educator":
      return copy.templateAcademic;
    case "economist":
      return copy.templateEconomist;
    case "government":
      return copy.templateGovernment;
    case "investor_analyst":
      return copy.templateInvestor;
    case "organization":
      return copy.templateOrganization;
    default:
      return copy.templateGeneral;
  }
}

function templateDescription(
  id: string,
  copy: ReturnType<typeof getAdaptiveWorkspaceCopy>,
): string {
  switch (id) {
    case "student":
      return copy.templateStudentDesc;
    case "researcher_scientist":
      return copy.templateResearcherDesc;
    case "chemist_scientist":
      return copy.templateChemistDesc;
    case "academic_educator":
      return copy.templateAcademicDesc;
    case "economist":
      return copy.templateEconomistDesc;
    case "government":
      return copy.templateGovernmentDesc;
    case "investor_analyst":
      return copy.templateInvestorDesc;
    case "organization":
      return copy.templateOrganizationDesc;
    default:
      return copy.templateGeneralDesc;
  }
}

function buildChemistSeed(locale: string, copy: ReturnType<typeof getAdaptiveWorkspaceCopy>) {
  const seed = chemistSeedStatement(locale);
  const interpretation = interpretRoleStatement({ text: seed, locale });
  return {
    statement: seed,
    draft: buildWorkspaceCreationDraft({ interpretation, locale }),
    statusMessage: copy.draftStatus,
  };
}

/**
 * Adaptive My Workspace — role discovery, interpretation confirmation, and
 * draft-to-Operational-Object creation. Nothing is saved until Confirm.
 */
export default function AdaptiveWorkspaceClient({ embedded = false }: { embedded?: boolean }) {
  const { language } = useTranslation();
  const copy = getAdaptiveWorkspaceCopy(language);
  const brand = getBrandLocaleCopy(language);
  const objects = useOperationalObjects();
  const searchParams = useSearchParams();
  const discoverChemist =
    searchParams.get("discover") === "1" && searchParams.get("role") === "chemist";
  const seeded = useMemo(
    () => (discoverChemist ? buildChemistSeed(language, copy) : null),
    // Seed once from URL + locale; copy draftStatus string is locale-stable enough for init.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional URL seed
    [discoverChemist, language],
  );

  const [statement, setStatement] = useState(() => seeded?.statement ?? "");
  const [draft, setDraft] = useState<WorkspaceCreationDraft | null>(() => seeded?.draft ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(() => seeded?.statusMessage ?? null);

  const templates = useMemo(() => listWorkspaceTemplates(), []);

  function onInterpret() {
    const interpretation = interpretRoleStatement({ text: statement, locale: language });
    setDraft(buildWorkspaceCreationDraft({ interpretation, locale: language }));
    setStatusMessage(copy.draftStatus);
  }

  function onConfirm() {
    if (!draft) return;
    objects.openComposer(
      draft.operationalObjectDraft,
      draft.interpretation.inferredFields,
      "voice_command",
    );
    setStatusMessage(copy.confirmCreate);
  }

  function onSaveDraftOnly() {
    if (!draft) return;
    objects.openComposer(
      { ...draft.operationalObjectDraft, status: "draft" },
      draft.interpretation.inferredFields,
      "manual",
    );
    setStatusMessage(copy.saveDraft);
  }

  return (
    <div className={embedded ? "space-y-6" : "mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6"}>
      {embedded ? null : (
        <header className={cbaiPageHeader}>
          <p className={cbaiSectionEyebrow}>{CANONICAL_BRAND_FACTS.publicPlatformName}</p>
          <h1 className="cbai-display text-2xl font-semibold tracking-tight text-[color:var(--cbai-text-primary)] sm:text-3xl">
            {copy.pageTitle}
          </h1>
          <p className={`max-w-3xl ${cbaiTextBody}`}>{copy.pageDescription}</p>
        </header>
      )}
      {embedded ? (
        <div>
          <p className={cbaiSectionEyebrow}>{CANONICAL_BRAND_FACTS.publicPlatformName}</p>
          <h2 className={cbaiSectionTitle}>{copy.roleDiscoveryHeading}</h2>
          <p className={`mt-1 max-w-3xl ${cbaiTextBody}`}>{copy.pageDescription}</p>
        </div>
      ) : null}

      <section aria-labelledby="role-discovery" className={`${cbaiSurfaceSolid} ${cbaiPanelPadding}`}>
        <h2 id="role-discovery" className={cbaiSectionTitle}>
          {copy.roleDiscoveryHeading}
        </h2>
        <p className={`mt-2 ${cbaiTextBody}`}>{brand.roleDiscoveryPrompt}</p>
        {draft?.interpretation.suggestedTemplateId === "chemist_scientist" ? (
          <p className={`mt-2 ${cbaiTextMuted}`} data-chemist-discovery="1">
            {copy.chemistDiscoveryHint}
          </p>
        ) : null}
        <label className="mt-4 block text-sm text-[var(--cbai-text-secondary)]" htmlFor="role-statement">
          {copy.editFields}
        </label>
        <textarea
          id="role-statement"
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-canvas)] px-3 py-2 text-sm text-[var(--cbai-text-primary)]"
          placeholder={
            language === "uz"
              ? "Men kimyogarman. Organik kimyo, dissertatsiya mavzusi va maqsadni ayting."
              : "I am a chemist. Add field, thesis title, and research objective."
          }
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={cbaiBtnPrimary} onClick={onInterpret}>
            {copy.interpretationHeading}
          </button>
          <Link href="/discover" className={cbaiBtnSecondary}>
            {copy.discoveryTitle}
          </Link>
        </div>
      </section>

      {draft ? (
        <section
          aria-labelledby="interpretation"
          className={`${cbaiSurfaceSolid} ${cbaiPanelPadding}`}
          data-workspace-draft="awaiting_confirmation"
        >
          <h2 id="interpretation" className={cbaiSectionTitle}>
            {copy.interpretationHeading}
          </h2>
          <p className={`mt-1 ${cbaiTextMuted}`}>{copy.draftStatus}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className={cbaiTextMuted}>{copy.inferredLabel}</dt>
              <dd className="text-[var(--cbai-text-primary)]">
                {draft.interpretation.understoodRole} →{" "}
                {getWorkspaceTemplate(draft.interpretation.suggestedTemplateId).id}
              </dd>
            </div>
            <div>
              <dt className={cbaiTextMuted}>{copy.privacyPrivate}</dt>
              <dd className="text-[var(--cbai-text-primary)]">{draft.privacy}</dd>
            </div>
            <div>
              <dt className={cbaiTextMuted}>{copy.fieldGoal}</dt>
              <dd className="text-[var(--cbai-text-primary)]">{draft.objective}</dd>
            </div>
            <div>
              <dt className={cbaiTextMuted}>{copy.fieldProject}</dt>
              <dd className="text-[var(--cbai-text-primary)]">{draft.proposedProjectName}</dd>
            </div>
            <div>
              <dt className={cbaiTextMuted}>{copy.missingLabel}</dt>
              <dd className="text-[var(--cbai-text-primary)]">
                {draft.missingDetails.length ? draft.missingDetails.join(", ") : "—"}
              </dd>
            </div>
            <div>
              <dt className={cbaiTextMuted}>{copy.fieldOfficialSources}</dt>
              <dd className="text-[var(--cbai-text-primary)]">
                {draft.suggestedOfficialSources.join("; ") || "—"}
              </dd>
            </div>
          </dl>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-[var(--cbai-text-secondary)]">
            {draft.firstThreeActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={cbaiBtnPrimary} onClick={onConfirm}>
              {copy.confirmCreate}
            </button>
            <button type="button" className={cbaiBtnSecondary} onClick={onSaveDraftOnly}>
              {copy.saveDraft}
            </button>
            <button
              type="button"
              className={cbaiBtnSecondary}
              onClick={() => {
                setDraft(null);
                setStatusMessage(null);
              }}
            >
              {copy.cancel}
            </button>
          </div>
          {statusMessage ? <p className={`mt-3 ${cbaiTextMuted}`}>{statusMessage}</p> : null}
        </section>
      ) : null}

      <section aria-labelledby="templates">
        <h2 id="templates" className={cbaiSectionTitle}>
          {copy.editFields}
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {templates.map((template) => {
            const title = templateTitle(template.id, copy);
            const description = templateDescription(template.id, copy);
            return (
              <li key={template.id} className={`${cbaiSurfaceSolid} ${cbaiPanelPadding}`}>
                <p className="text-sm font-medium text-[var(--cbai-text-primary)]">{title}</p>
                <p className={`mt-1 ${cbaiTextMuted}`}>{description}</p>
                <p className={`mt-2 ${cbaiTextMuted}`}>
                  {copy.privacyPrivate} · {template.fields.length}
                </p>
              </li>
            );
          })}
        </ul>
        {!draft ? (
          <p className={`mt-4 ${cbaiEmptyDashed} ${cbaiTextMuted}`}>{copy.draftStatus}</p>
        ) : null}
      </section>
    </div>
  );
}
