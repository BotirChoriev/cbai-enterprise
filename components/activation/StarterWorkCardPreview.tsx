"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getActivationCopy } from "@/lib/i18n/platform-copy-activation";
import type { ActivationFieldLabelId } from "@/lib/i18n/platform-copy-activation";
import { WORK_CARD_SECTIONS, type StarterWorkCard, type WorkCardSectionId } from "@/lib/activation/starter-work-card";
import { SOURCE_CAPABILITY_MAP } from "@/lib/activation/source-capability";

type StarterWorkCardPreviewProps = {
  readonly card: StarterWorkCard;
  readonly exampleMode?: boolean;
  readonly onConfirm: () => void;
  readonly onBack: () => void;
};

function Badge({ tone, children }: { tone: "inferred" | "unknown" | "user"; children: string }) {
  const cls =
    tone === "unknown"
      ? "border-amber-400/40 bg-amber-950/40 text-amber-200"
      : tone === "user"
        ? "border-teal-400/40 bg-teal-950/40 text-teal-200"
        : "border-sky-400/40 bg-sky-950/40 text-sky-200";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

/**
 * Progressive-disclosure Starter Work Card (Phase 5/6): Essentials → Evidence
 * → Options → Plan → Monitoring → Review → History. Every inferred value is
 * badged, every unknown stays visibly unknown, and confirmation happens only
 * through the canonical Operational Object composer.
 */
export default function StarterWorkCardPreview({
  card,
  exampleMode = false,
  onConfirm,
  onBack,
}: StarterWorkCardPreviewProps) {
  const { language } = useTranslation();
  const copy = getActivationCopy(language);
  const [section, setSection] = useState<WorkCardSectionId>("essentials");

  const fieldLabel = (id: string): string =>
    copy.fieldLabels[id as ActivationFieldLabelId] ?? id;

  const stateBadge = (state: string) =>
    state === "unknown" ? (
      <Badge tone="unknown">{copy.badgeUnknown}</Badge>
    ) : state === "known" ? (
      <Badge tone="user">{copy.badgeUserProvided}</Badge>
    ) : (
      <Badge tone="inferred">{copy.badgeInferred}</Badge>
    );

  return (
    <div data-activation-card="1" className="rounded-2xl border border-teal-500/25 bg-[#0a1528]/95 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-50">{copy.starterHeading}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{copy.starterReady}</p>
        </div>
        {exampleMode ? (
          <span className="rounded-full border border-teal-400/40 bg-teal-950/40 px-2.5 py-1 text-[10px] font-medium text-teal-200">
            {copy.exampleBadge}
          </span>
        ) : null}
      </div>

      <div role="tablist" aria-label={copy.starterHeading} className="mt-4 flex flex-wrap gap-1.5">
        {WORK_CARD_SECTIONS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`activation-tab-${id}`}
            aria-selected={section === id}
            aria-controls={`activation-panel-${id}`}
            onClick={() => setSection(id)}
            className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300 ${
              section === id
                ? "border-teal-400/60 bg-teal-900/50 text-teal-100"
                : "border-teal-500/20 bg-transparent text-slate-300 hover:border-teal-400/40"
            }`}
          >
            {copy.sections[id]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`activation-panel-${section}`}
        aria-labelledby={`activation-tab-${section}`}
        className="mt-4 space-y-4 text-sm text-slate-200"
      >
        {section === "essentials" ? (
          <>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">{copy.labels.workingTitle}</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="break-words">{card.workingTitle}</span>
                  {stateBadge(card.titleState)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.labels.role}</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{copy.roles[card.role]}</span>
                  {stateBadge(card.roleState)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.labels.domain}</dt>
                <dd className="mt-0.5">{copy.domains[card.blueprint.domain]}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.labels.outcome}</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="break-words">{card.desiredOutcome ?? copy.badgeUnknown}</span>
                  {stateBadge(card.outcomeState)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">{copy.labels.problem}</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="break-words">{card.problemInterpretation || copy.badgeUnknown}</span>
                  {stateBadge(card.problemState)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">{copy.labels.constraints}</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="break-words">{card.constraints ?? copy.badgeUnknown}</span>
                  {stateBadge(card.constraintsState)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.labels.locale}</dt>
                <dd className="mt-0.5 uppercase">{card.contentLocale}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.labels.provenance}</dt>
                <dd className="mt-0.5 text-xs text-slate-300">
                  {card.source} · {copy.labels.sourceRoute}: {card.sourceRoute}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-slate-400">{copy.roleNotSilo}</p>
            <div className="space-y-3">
              {card.blueprint.sections.map((blueprintSection) => (
                <div key={blueprintSection.id}>
                  <p className="text-xs font-medium uppercase tracking-wide text-teal-200/90">
                    {copy.sectionLabels[blueprintSection.id]}
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {blueprintSection.fieldIds.map((fieldId) => (
                      <li
                        key={fieldId}
                        className="rounded-md border border-teal-500/15 bg-[#0d1a30]/80 px-2 py-1 text-[11px] text-slate-300"
                      >
                        {fieldLabel(fieldId)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {section === "evidence" ? (
          <>
            <div>
              <p className="text-xs text-slate-400">{copy.labels.materials}</p>
              {card.materials.length > 0 ? (
                <ul className="mt-1.5 space-y-1.5">
                  {card.materials.map((material, index) => (
                    <li key={`${material.origin}-${index}`} className="flex flex-wrap items-center gap-2">
                      <Badge tone="user">{copy.badgeUserProvided}</Badge>
                      <span className="break-all text-slate-200">{material.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">{copy.materialsEmpty}</p>
              )}
              <p className="mt-2 text-[11px] text-slate-500">{copy.materialsFileHint}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-teal-200/90">
                {copy.capabilityHeading}
              </p>
              <ul className="mt-1.5 space-y-1">
                {SOURCE_CAPABILITY_MAP.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-300">
                      {copy.capabilitySources[entry.id as keyof typeof copy.capabilitySources]}
                    </span>
                    <span
                      className={
                        entry.status === "user_provided" || entry.status === "public_web"
                          ? "text-teal-200"
                          : "text-slate-400"
                      }
                    >
                      {copy.capabilityStatus[entry.status]}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500">{copy.evidenceHonestyNote}</p>
            </div>
          </>
        ) : null}

        {section === "options" ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">{copy.labels.pathways}</p>
            {card.pathways.map((pathway) => {
              const pathwayCopy = copy.pathways[pathway.id];
              const basisLabel =
                pathway.evidenceBasis === "user_provided"
                  ? copy.capabilityStatus.user_provided
                  : pathway.evidenceBasis === "public_knowledge"
                    ? copy.capabilityStatus.public_web
                    : copy.monitoringStatus.source_required;
              return (
                <article key={pathway.id} className="rounded-xl border border-teal-500/15 bg-[#0d1a30]/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-slate-50">{pathwayCopy.title}</h4>
                    <span className="text-[10px] text-slate-400">{basisLabel}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{pathwayCopy.summary}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium text-teal-200/90">{copy.labels.benefits}</p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
                        <li>{pathwayCopy.benefit1}</li>
                        <li>{pathwayCopy.benefit2}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-amber-200/90">{copy.labels.risks}</p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
                        <li>{pathwayCopy.risk1}</li>
                        <li>{pathwayCopy.risk2}</li>
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
            <p className="text-xs text-slate-400">{copy.humanDecisions.choose_pathway} — {copy.humanDecisionLine}</p>
          </div>
        ) : null}

        {section === "plan" ? (
          <div>
            <p className="text-xs text-slate-400">{copy.labels.plan}</p>
            <ol className="mt-2 space-y-2">
              {card.sevenDayPlan.map((step) => (
                <li key={step.stepId} className="flex gap-3">
                  <span className="shrink-0 rounded-md border border-teal-500/25 bg-teal-950/40 px-2 py-0.5 text-[11px] text-teal-200">
                    {copy.dayLabel} {step.days[0] === step.days[1] ? step.days[0] : `${step.days[0]}–${step.days[1]}`}
                  </span>
                  <span className="text-xs leading-relaxed text-slate-200">{copy.planSteps[step.stepId]}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[11px] text-slate-500">{copy.humanDecisionLine}</p>
          </div>
        ) : null}

        {section === "monitoring" ? (
          <div>
            <p className="text-xs text-slate-400">{copy.labels.monitoring}</p>
            <ul className="mt-2 space-y-1.5">
              {card.monitoring.map((indicator) => (
                <li
                  key={indicator.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-teal-500/10 bg-[#0d1a30]/60 px-3 py-2"
                >
                  <span className="text-xs text-slate-200">
                    {fieldLabel(indicator.id)}
                    {indicator.unit ? <span className="text-slate-500"> · {indicator.unit}</span> : null}
                  </span>
                  <span className="text-[11px] text-amber-200/90">
                    {copy.monitoringStatus[indicator.status]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-slate-500">{copy.monitoringNoFake}</p>
            <p className="mt-1 text-[11px] text-slate-500">{copy.nextMeasurementDue}</p>
          </div>
        ) : null}

        {section === "review" ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">{copy.labels.unknowns}</p>
              {card.unknowns.length > 0 ? (
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
                  {card.unknowns.map((id) => (
                    <li key={id}>{copy.clarifications[id]}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-slate-400">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400">{copy.labels.assumptions}</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {card.assumptions.map((id) => (
                  <li key={id}>
                    <Badge tone="inferred">{copy.badgeInferred}</Badge>
                    <span className="ml-1 text-[11px] text-slate-400">{id}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-slate-400">{copy.labels.decisions}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
                {card.humanDecisions.map((id) => (
                  <li key={id}>{copy.humanDecisions[id]}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-teal-100/90">{copy.reviewLine}</p>
          </div>
        ) : null}

        {section === "history" ? (
          <p className="text-xs text-slate-400">{copy.historyEmpty}</p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-teal-500/15 pt-4">
        <button
          type="button"
          onClick={onConfirm}
          data-activation-confirm="1"
          className="inline-flex min-h-11 items-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-200"
        >
          {copy.confirmCta}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center rounded-lg border border-teal-500/25 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-teal-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
        >
          {copy.backCta}
        </button>
        <p className="w-full text-[11px] text-slate-500 sm:w-auto sm:flex-1 sm:text-right">
          {copy.humanDecisionLine}
        </p>
      </div>

      <AccountAfterValue />
    </div>
  );
}

/**
 * Account-after-value (Phase 12): a calm, dismissible offer shown only once
 * the Starter Work Card exists. Never blocks, never uses urgency.
 */
function AccountAfterValue() {
  const { language } = useTranslation();
  const copy = getActivationCopy(language);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      data-activation-account-prompt="1"
      className="mt-4 rounded-xl border border-teal-500/20 bg-teal-950/30 p-3"
      aria-label={copy.accountTitle}
    >
      <p className="text-sm font-medium text-slate-50">{copy.accountTitle}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-300">{copy.accountBody}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href="/account"
          className="inline-flex min-h-9 items-center rounded-lg border border-teal-400/40 bg-teal-900/40 px-3 py-1.5 text-xs font-medium text-teal-100 hover:bg-teal-900/70"
        >
          {copy.accountCta}
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="inline-flex min-h-9 items-center rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
        >
          {copy.accountLater}
        </button>
      </div>
    </aside>
  );
}
