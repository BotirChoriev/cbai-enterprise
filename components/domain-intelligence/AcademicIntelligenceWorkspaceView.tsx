"use client";

import Link from "next/link";
import type { AcademicIntelligenceWorkspace } from "@/lib/domain-intelligence/academic-workspace";
import CreateLinkedWorkButton from "@/components/operational-objects/CreateLinkedWorkButton";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiFocusRing, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type Props = {
  readonly workspace: AcademicIntelligenceWorkspace;
  readonly countryId?: string;
  readonly countryName?: string;
};

export default function AcademicIntelligenceWorkspaceView({
  workspace,
  countryId,
  countryName,
}: Props) {
  const { t } = useTranslation();

  return (
    <section aria-label={t("domainIntelligence.academicTitle")} className="space-y-5">
      <div className={`${cbaiGlassCard} space-y-3 p-5`}>
        <p className={cbaiSectionEyebrow}>{t("domainIntelligence.academicTitle")}</p>
        <p className="text-sm text-[var(--cbai-text-secondary)]">{workspace.honestyNotice}</p>
        <div>
          <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
            {t("domainIntelligence.discipline")}
          </h3>
          {workspace.discipline.topic ? (
            <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">
              {workspace.discipline.topic.topicName} · {workspace.discipline.domainName} ·{" "}
              {workspace.discipline.catalogStatus}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">{t("domainIntelligence.materialUnknown")}</p>
          )}
          {workspace.discipline.relatedMethods.length > 0 ? (
            <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">
              Methods (catalog labels only): {workspace.discipline.relatedMethods.join(", ")}
            </p>
          ) : null}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
            {t("domainIntelligence.primaryNextAction")}
          </h3>
          <p className="mt-1 text-sm text-[var(--cbai-text-secondary)]">
            {workspace.primaryNextAction.label}
          </p>
          {countryId && countryName ? (
            <div className="mt-3">
              <CreateLinkedWorkButton
                variant="country"
                country={{
                  countryId,
                  countryName,
                  routePath: `/countries?country=${encodeURIComponent(countryId)}`,
                }}
                compact
              />
            </div>
          ) : workspace.discipline.topic ? (
            <div className="mt-3">
              <CreateLinkedWorkButton
                variant="research"
                research={{
                  topicId: workspace.discipline.topic.topicId,
                  topicName: workspace.discipline.topic.topicName,
                  routePath: `/research/${workspace.discipline.topic.topicId}`,
                }}
                compact
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-5`}>
        <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
          {workspace.geography.focusCountryName
            ? `${workspace.geography.focusCountryName} universities`
            : "Universities (registry)"}
        </h3>
        <ul className="space-y-1 text-sm text-[var(--cbai-text-secondary)]">
          {(workspace.geography.localUniversities.length > 0
            ? workspace.geography.localUniversities
            : workspace.geography.internationalUniversities.slice(0, 5)
          ).map((u) => (
            <li key={u.id}>
              <Link
                href={`/universities?university=${u.id}`}
                className={`text-teal-400 hover:text-teal-300 ${cbaiFocusRing}`}
              >
                {u.name}
              </Link>
              <span className="text-[var(--cbai-text-muted)]">
                {" "}
                — {u.city}, {u.country}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-5`}>
        <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("domainIntelligence.comparisons")}
        </h3>
        <ul className="space-y-2">
          {workspace.comparisons.map((c) => (
            <li key={c.kind} className="rounded-md border border-[var(--cbai-border-subtle)] px-3 py-2">
              <p className="text-sm text-[var(--cbai-text-primary)]">
                {c.leftLabel} vs {c.rightLabel}
              </p>
              <p className="text-xs text-[var(--cbai-text-muted)]">{c.notice}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-5`}>
        <h3 className="text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("domainIntelligence.openQuestions")}
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--cbai-text-secondary)]">
          {workspace.hierarchy.openQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <h3 className="pt-2 text-sm font-semibold text-[var(--cbai-text-primary)]">
          {t("domainIntelligence.limitations")}
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--cbai-text-muted)]">
          {workspace.hierarchy.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
